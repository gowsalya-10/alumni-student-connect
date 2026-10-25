from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from pydantic import BaseModel
from typing import List, Optional
import json

from database import get_db
from models import User, AlumniProfile, StudentProfile, StudentSkill, Skill, AlumniImpact, RewardTransaction
from auth import require_role, get_current_user

router = APIRouter(prefix="/api/v1/alumni", tags=["alumni"])

class AlumniResponse(BaseModel):
    user_id: str
    name: str
    photo_url: Optional[str] = None
    current_role: Optional[str] = None
    company: Optional[str] = None
    domain: Optional[str] = None
    industry: Optional[str] = None
    location: Optional[str] = None
    skills: List[str] = []
    mentorship_interests: List[str] = []
    experience: Optional[str] = None
    education: Optional[str] = None
    bio: Optional[str] = None
    is_verified: bool = False

class AlumniMatchResponse(AlumniResponse):
    match_pct: int
    matching_reasons: List[str]

class AlumniProfileUpdate(BaseModel):
    name: Optional[str] = None
    photo_url: Optional[str] = None
    current_role: Optional[str] = None
    company: Optional[str] = None
    domain: Optional[str] = None
    industry: Optional[str] = None
    location: Optional[str] = None
    skills: Optional[List[str]] = None
    mentorship_interests: Optional[List[str]] = None
    experience: Optional[str] = None
    education: Optional[str] = None
    bio: Optional[str] = None

class AlumniImpactResponse(BaseModel):
    total_score: int
    total_interactions: int
    students_helped: int
    completed_mentorships: int
    average_rating: float
    reward_points: int

class RewardTransactionResponse(BaseModel):
    id: str
    points: int
    reason: str
    created_at: str

def parse_json_list(field_data) -> List[str]:
    if not field_data:
        return []
    try:
        return json.loads(field_data)
    except Exception:
        return []

def serialize_alumni_profile(a: AlumniProfile) -> AlumniResponse:
    return AlumniResponse(
        user_id=a.user_id,
        name=a.name,
        photo_url=a.photo_url,
        current_role=a.current_role,
        company=a.company,
        domain=a.domain,
        industry=a.industry,
        location=a.location,
        skills=parse_json_list(a.skills),
        mentorship_interests=parse_json_list(a.mentorship_interests),
        experience=a.experience,
        education=a.education,
        bio=a.bio,
        is_verified=a.is_verified
    )

@router.get("", response_model=List[AlumniResponse])
async def search_alumni(
    search: Optional[str] = None,
    domain: Optional[str] = None,
    industry: Optional[str] = None,
    location: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(AlumniProfile)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                AlumniProfile.name.ilike(search_term),
                AlumniProfile.current_role.ilike(search_term),
                AlumniProfile.company.ilike(search_term),
                AlumniProfile.skills.ilike(search_term)
            )
        )
        
    if domain:
        query = query.filter(AlumniProfile.domain.ilike(f"%{domain}%"))
    if industry:
        query = query.filter(AlumniProfile.industry.ilike(f"%{industry}%"))
    if location:
        query = query.filter(AlumniProfile.location.ilike(f"%{location}%"))
        
    alumni_list = query.all()
    return [serialize_alumni_profile(a) for a in alumni_list]

@router.get("/profile/me", response_model=AlumniResponse)
async def get_my_alumni_profile(
    current_user: User = Depends(require_role("alumni")),
    db: Session = Depends(get_db)
):
    profile = db.query(AlumniProfile).filter(AlumniProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Alumni profile not found")
    return serialize_alumni_profile(profile)

@router.put("/profile", response_model=AlumniResponse)
async def update_alumni_profile(
    request: AlumniProfileUpdate,
    current_user: User = Depends(require_role("alumni")),
    db: Session = Depends(get_db)
):
    profile = db.query(AlumniProfile).filter(AlumniProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Alumni profile not found")

    update_data = request.model_dump(exclude_unset=True)
    if "skills" in update_data and update_data["skills"] is not None:
        update_data["skills"] = json.dumps(update_data["skills"])
    if "mentorship_interests" in update_data and update_data["mentorship_interests"] is not None:
        update_data["mentorship_interests"] = json.dumps(update_data["mentorship_interests"])

    try:
        for key, value in update_data.items():
            setattr(profile, key, value)

        db.commit()
        db.refresh(profile)
        return serialize_alumni_profile(profile)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update alumni profile.")

@router.get("/matching", response_model=List[AlumniMatchResponse])
async def get_mentor_matches(
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db)
):
    student = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # Fetch student skills
    student_skills_db = (
        db.query(Skill.name)
        .join(StudentSkill, Skill.id == StudentSkill.skill_id)
        .filter(StudentSkill.student_id == current_user.id)
        .all()
    )
    student_skill_names = {s[0].strip().lower() for s in student_skills_db}

    student_domain = (student.desired_domain or "").strip().lower()
    student_career = (student.desired_career or "").strip().lower()
    student_interests = {i.strip().lower() for i in parse_json_list(student.mentorship_interests)}

    alumni_list = db.query(AlumniProfile).all()
    matches: List[AlumniMatchResponse] = []

    for a in alumni_list:
        base = serialize_alumni_profile(a)
        score = 0
        reasons: List[str] = []

        alumni_domain = (a.domain or "").strip().lower()
        alumni_role = (a.current_role or "").strip().lower()
        alumni_skills = [s.strip().lower() for s in base.skills]
        alumni_interests = [i.strip().lower() for i in base.mentorship_interests]

        # 1. Target Domain Alignment (up to 40 pts)
        if student_domain and alumni_domain:
            if student_domain == alumni_domain:
                score += 40
                reasons.append(f"Domain alignment: {a.domain}")
            elif student_domain in alumni_domain or alumni_domain in student_domain:
                score += 30
                reasons.append(f"Related field: {a.domain}")

        # 2. Target Role Alignment (up to 25 pts)
        if student_career and alumni_role:
            if student_career in alumni_role or alumni_role in student_career:
                score += 25
                reasons.append(f"Role match: {a.current_role}")

        # 3. Shared Skill Overlap (up to 25 pts)
        shared_skills = [orig for orig in base.skills if orig.strip().lower() in student_skill_names]
        if shared_skills:
            skill_pts = min(25, len(shared_skills) * 8)
            score += skill_pts
            reasons.append(f"Shared skills: {', '.join(shared_skills[:3])}")

        # 4. Mentorship Interest Overlap (up to 15 pts)
        shared_interests = [orig for orig in base.mentorship_interests if orig.strip().lower() in student_interests]
        if shared_interests:
            interest_pts = min(15, len(shared_interests) * 8)
            score += interest_pts
            reasons.append(f"Shared interests: {', '.join(shared_interests[:2])}")

        # Verified mentor boost
        if a.is_verified:
            score += 5

        # Bound score between 15% and 98%
        match_pct = max(15, min(98, score if score > 0 else 20))

        matches.append(
            AlumniMatchResponse(
                **base.model_dump(),
                match_pct=match_pct,
                matching_reasons=reasons or ["Available for general career mentorship"]
            )
        )

    # Sort by match score descending
    matches.sort(key=lambda m: m.match_pct, reverse=True)
    return matches

@router.get("/my/rewards", response_model=List[RewardTransactionResponse])
async def get_my_rewards(
    current_user: User = Depends(require_role("alumni")),
    db: Session = Depends(get_db)
):
    rewards = db.query(RewardTransaction).filter(RewardTransaction.alumni_id == current_user.id).order_by(RewardTransaction.created_at.desc()).all()
    return [
        RewardTransactionResponse(
            id=r.id,
            points=r.points,
            reason=r.reason,
            created_at=r.created_at.isoformat()
        ) for r in rewards
    ]

@router.get("/{id}", response_model=AlumniResponse)
async def get_alumni_profile(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    a = db.query(AlumniProfile).filter(AlumniProfile.user_id == id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Alumni profile not found")
        
    return serialize_alumni_profile(a)

@router.get("/{id}/impact", response_model=AlumniImpactResponse)
async def get_alumni_impact(
    id: str,
    db: Session = Depends(get_db)
):
    impact = db.query(AlumniImpact).filter(AlumniImpact.alumni_id == id).first()
    if not impact:
        return AlumniImpactResponse(
            total_score=0,
            total_interactions=0,
            students_helped=0,
            completed_mentorships=0,
            average_rating=0.0,
            reward_points=0
        )
    return AlumniImpactResponse(
        total_score=impact.total_score,
        total_interactions=impact.total_interactions,
        students_helped=impact.students_helped,
        completed_mentorships=impact.completed_mentorships,
        average_rating=float(impact.average_rating),
        reward_points=impact.reward_points
    )
