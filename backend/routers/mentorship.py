import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from database import get_db
from models import User, Mentorship, MentorshipInteraction, AlumniProfile, StudentProfile, MentorshipRating, AlumniImpact, RewardTransaction, Notification
from auth import require_role, get_current_user

router = APIRouter(prefix="/api/v1/mentorship", tags=["mentorship"])

# Helper to create notifications
def create_notification(db: Session, user_id: str, title: str, message: str, type: str):
    notif = Notification(
        id=str(uuid.uuid4()),
        user_id=user_id,
        title=title,
        message=message,
        type=type
    )
    db.add(notif)
    return notif

# Pydantic models
class MentorshipRequestCreate(BaseModel):
    alumni_id: str
    message: str

class MentorshipInteractionCreate(BaseModel):
    interaction_type: str
    duration_minutes: int
    notes: str

class InteractionResponse(BaseModel):
    id: str
    interaction_type: str
    duration_minutes: int
    notes: str
    created_at: datetime

class MentorshipResponse(BaseModel):
    id: str
    student_id: str
    alumni_id: str
    student_name: str
    student_department: Optional[str]
    student_year: Optional[int]
    student_goal: Optional[str]
    alumni_name: str
    alumni_role: Optional[str]
    alumni_company: Optional[str]
    message: str
    status: str
    requested_at: datetime

class RatingBody(BaseModel):
    rating: int
    review: Optional[str]

def get_mentorship_response(req: Mentorship, student: StudentProfile, alumni: AlumniProfile) -> MentorshipResponse:
    return MentorshipResponse(
        id=req.id,
        student_id=req.student_id,
        alumni_id=req.alumni_id,
        student_name=student.name,
        student_department=student.department,
        student_year=student.year,
        student_goal=student.desired_career,
        alumni_name=alumni.name,
        alumni_role=alumni.current_role,
        alumni_company=alumni.company,
        message=req.message,
        status=req.status,
        requested_at=req.requested_at
    )

def update_alumni_impact(db: Session, alumni_id: str):
    impact = db.query(AlumniImpact).filter(AlumniImpact.alumni_id == alumni_id).first()
    if not impact:
        impact = AlumniImpact(alumni_id=alumni_id)
        db.add(impact)
        
    requests = db.query(Mentorship).filter(Mentorship.alumni_id == alumni_id).all()
    req_ids = [r.id for r in requests]
    interactions = db.query(MentorshipInteraction).filter(MentorshipInteraction.mentorship_id.in_(req_ids)).all()
    
    impact.total_interactions = len(interactions)
    
    active_student_ids = set()
    for i in interactions:
        req = next((r for r in requests if r.id == i.mentorship_id), None)
        if req:
            active_student_ids.add(req.student_id)
    impact.students_helped = len(active_student_ids)
    
    completed = [r for r in requests if r.status == "completed"]
    impact.completed_mentorships = len(completed)
    
    ratings = db.query(MentorshipRating).filter(MentorshipRating.alumni_id == alumni_id).all()
    if ratings:
        impact.average_rating = round(sum(r.rating for r in ratings) / len(ratings), 2)
    else:
        impact.average_rating = 0.0
        
    # Formula: 10 per completed + 5 per interaction + (avg_rating * 2)
    score = (impact.completed_mentorships * 10) + (impact.total_interactions * 5) + (int(impact.average_rating) * 2)
    impact.total_score = score
    db.commit()

@router.post("/requests", response_model=MentorshipResponse)
async def create_request(
    body: MentorshipRequestCreate,
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db)
):
    existing = db.query(Mentorship).filter(
        Mentorship.student_id == current_user.id,
        Mentorship.alumni_id == body.alumni_id,
        Mentorship.status == "pending"
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="A pending request already exists for this alumni.")
        
    alumni = db.query(AlumniProfile).filter(AlumniProfile.user_id == body.alumni_id).first()
    student = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    
    if not alumni or not student:
        raise HTTPException(status_code=404, detail="User profile not found")
        
    req = Mentorship(
        id=str(uuid.uuid4()),
        student_id=current_user.id,
        alumni_id=body.alumni_id,
        message=body.message,
        status="pending"
    )
    db.add(req)
    
    create_notification(
        db, body.alumni_id, 
        "New Mentorship Request", 
        f"{student.name} has requested mentorship from you.", 
        "mentorship_request"
    )
    
    db.commit()
    db.refresh(req)
    
    return get_mentorship_response(req, student, alumni)

@router.get("/my", response_model=List[MentorshipResponse])
async def get_my_requests(
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db)
):
    requests = db.query(Mentorship).filter(Mentorship.student_id == current_user.id).all()
    results = []
    for req in requests:
        alumni = db.query(AlumniProfile).filter(AlumniProfile.user_id == req.alumni_id).first()
        student = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
        if alumni and student:
            results.append(get_mentorship_response(req, student, alumni))
    return results

@router.delete("/requests/{id}")
async def cancel_request(
    id: str,
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db)
):
    req = db.query(Mentorship).filter(
        Mentorship.id == id, 
        Mentorship.student_id == current_user.id,
        Mentorship.status == "pending"
    ).first()
    if not req:
        raise HTTPException(status_code=404, detail="Pending request not found")
        
    req.status = "cancelled"
    req.responded_at = datetime.utcnow()
    db.commit()
    return {"message": "Request cancelled"}

@router.get("/incoming", response_model=List[MentorshipResponse])
async def get_incoming_requests(
    current_user: User = Depends(require_role("alumni")),
    db: Session = Depends(get_db)
):
    requests = db.query(Mentorship).filter(Mentorship.alumni_id == current_user.id).all()
    results = []
    for req in requests:
        alumni = db.query(AlumniProfile).filter(AlumniProfile.user_id == current_user.id).first()
        student = db.query(StudentProfile).filter(StudentProfile.user_id == req.student_id).first()
        if alumni and student:
            results.append(get_mentorship_response(req, student, alumni))
    return results

@router.put("/{id}/accept")
async def accept_request(
    id: str,
    current_user: User = Depends(require_role("alumni")),
    db: Session = Depends(get_db)
):
    req = db.query(Mentorship).filter(
        Mentorship.id == id, 
        Mentorship.alumni_id == current_user.id,
        Mentorship.status == "pending"
    ).first()
    if not req:
        raise HTTPException(status_code=404, detail="Pending request not found")
        
    req.status = "accepted"
    req.responded_at = datetime.utcnow()
    
    alumni = db.query(AlumniProfile).filter(AlumniProfile.user_id == current_user.id).first()
    create_notification(
        db, req.student_id, 
        "Mentorship Accepted", 
        f"{alumni.name} has accepted your mentorship request.", 
        "mentorship_accepted"
    )
    
    db.commit()
    return {"message": "Request accepted"}

@router.put("/{id}/decline")
async def decline_request(
    id: str,
    current_user: User = Depends(require_role("alumni")),
    db: Session = Depends(get_db)
):
    req = db.query(Mentorship).filter(
        Mentorship.id == id, 
        Mentorship.alumni_id == current_user.id,
        Mentorship.status == "pending"
    ).first()
    if not req:
        raise HTTPException(status_code=404, detail="Pending request not found")
        
    req.status = "declined"
    req.responded_at = datetime.utcnow()
    
    alumni = db.query(AlumniProfile).filter(AlumniProfile.user_id == current_user.id).first()
    create_notification(
        db, req.student_id, 
        "Mentorship Declined", 
        f"{alumni.name} was unable to accept your request at this time.", 
        "mentorship_declined"
    )
    
    db.commit()
    return {"message": "Request declined"}

@router.put("/{id}/complete")
async def complete_mentorship(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    req = db.query(Mentorship).filter(Mentorship.id == id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Mentorship not found")
        
    if req.student_id != current_user.id and req.alumni_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    if req.status != "accepted":
        raise HTTPException(status_code=400, detail="Only accepted mentorships can be completed")
        
    req.status = "completed"
    
    if current_user.id == req.alumni_id:
        # Alumni completed it -> notify student
        create_notification(
            db, req.student_id, 
            "Mentorship Completed", 
            "Your mentorship session was marked as complete. Please leave a rating!", 
            "rating_reminder"
        )
    
    db.commit()
    update_alumni_impact(db, req.alumni_id)
    return {"message": "Mentorship marked as completed"}

@router.post("/{id}/interactions", response_model=InteractionResponse)
async def log_interaction(
    id: str,
    body: MentorshipInteractionCreate,
    current_user: User = Depends(require_role("alumni")),
    db: Session = Depends(get_db)
):
    req = db.query(Mentorship).filter(Mentorship.id == id, Mentorship.alumni_id == current_user.id).first()
    if not req or req.status not in ["accepted", "completed"]:
        raise HTTPException(status_code=400, detail="Mentorship must be accepted or completed to log interactions")
        
    interaction = MentorshipInteraction(
        id=str(uuid.uuid4()),
        mentorship_id=req.id,
        interaction_type=body.interaction_type,
        duration_minutes=body.duration_minutes,
        notes=body.notes
    )
    db.add(interaction)
    
    # Reward points
    points = body.duration_minutes // 10  # 1 point per 10 mins
    if points > 0:
        reward = RewardTransaction(
            id=str(uuid.uuid4()),
            alumni_id=current_user.id,
            points=points,
            reason=f"Logged interaction: {body.interaction_type}",
            interaction_id=interaction.id
        )
        db.add(reward)
        impact = db.query(AlumniImpact).filter(AlumniImpact.alumni_id == current_user.id).first()
        if not impact:
            impact = AlumniImpact(alumni_id=current_user.id)
            db.add(impact)
        impact.reward_points += points
        
        create_notification(
            db, current_user.id, 
            "Reward Points Earned", 
            f"You earned {points} points for logging an interaction.", 
            "reward_earned"
        )
    
    db.commit()
    update_alumni_impact(db, current_user.id)
    db.refresh(interaction)
    
    return InteractionResponse(
        id=interaction.id,
        interaction_type=interaction.interaction_type,
        duration_minutes=interaction.duration_minutes,
        notes=interaction.notes,
        created_at=interaction.created_at
    )

@router.get("/{id}/interactions", response_model=List[InteractionResponse])
async def get_interactions(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    req = db.query(Mentorship).filter(Mentorship.id == id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Mentorship not found")
        
    if req.student_id != current_user.id and req.alumni_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    interactions = db.query(MentorshipInteraction).filter(MentorshipInteraction.mentorship_id == id).order_by(MentorshipInteraction.created_at.desc()).all()
    return [
        InteractionResponse(
            id=i.id,
            interaction_type=i.interaction_type,
            duration_minutes=i.duration_minutes,
            notes=i.notes,
            created_at=i.created_at
        ) for i in interactions
    ]

@router.post("/{id}/rating")
async def rate_mentorship(
    id: str,
    body: RatingBody,
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db)
):
    req = db.query(Mentorship).filter(Mentorship.id == id, Mentorship.student_id == current_user.id).first()
    if not req or req.status != "completed":
        raise HTTPException(status_code=400, detail="Only completed mentorships can be rated.")
        
    existing = db.query(MentorshipRating).filter(MentorshipRating.mentorship_id == req.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already rated this mentorship.")
        
    rating = MentorshipRating(
        id=str(uuid.uuid4()),
        mentorship_id=req.id,
        student_id=current_user.id,
        alumni_id=req.alumni_id,
        rating=body.rating,
        review=body.review
    )
    db.add(rating)
    
    student = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    create_notification(
        db, req.alumni_id, 
        "New Rating Received", 
        f"{student.name} left a {body.rating}-star rating for your mentorship.", 
        "new_rating"
    )
    
    db.commit()
    update_alumni_impact(db, req.alumni_id)
    return {"message": "Rating submitted successfully"}
