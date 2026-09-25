import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from database import get_db
from models import User, Mentorship, MentorshipInteraction, AlumniProfile, StudentProfile
from auth import require_role

router = APIRouter(prefix="/api/v1/mentorship", tags=["mentorship"])

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

@router.post("/requests", response_model=MentorshipResponse)
async def create_request(
    body: MentorshipRequestCreate,
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db)
):
    # Prevent duplicate pending
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
    db.commit()
    return {"message": "Request declined"}

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
    db.commit()
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
    current_user: User = Depends(),
    db: Session = Depends(get_db)
):
    req = db.query(Mentorship).filter(Mentorship.id == id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Mentorship not found")
        
    # Security: Only participants can view
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
