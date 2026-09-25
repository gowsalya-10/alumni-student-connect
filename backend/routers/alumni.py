from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from pydantic import BaseModel
from typing import List, Optional
import json

from database import get_db
from models import User, AlumniProfile
from auth import require_role

router = APIRouter(prefix="/api/v1/alumni", tags=["alumni"])

class AlumniResponse(BaseModel):
    user_id: str
    name: str
    photo_url: Optional[str]
    current_role: Optional[str]
    company: Optional[str]
    domain: Optional[str]
    industry: Optional[str]
    location: Optional[str]
    skills: List[str]
    mentorship_interests: List[str]
    experience: Optional[str]
    education: Optional[str]
    bio: Optional[str]
    is_verified: bool

def parse_json_list(field_data) -> List[str]:
    if not field_data:
        return []
    try:
        return json.loads(field_data)
    except:
        return []

@router.get("", response_model=List[AlumniResponse])
async def search_alumni(
    search: Optional[str] = None,
    domain: Optional[str] = None,
    industry: Optional[str] = None,
    location: Optional[str] = None,
    current_user: User = Depends(require_role("student")),
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
    
    result = []
    for a in alumni_list:
        result.append(AlumniResponse(
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
        ))
    return result

@router.get("/{id}", response_model=AlumniResponse)
async def get_alumni_profile(
    id: str,
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db)
):
    a = db.query(AlumniProfile).filter(AlumniProfile.user_id == id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Alumni profile not found")
        
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

from models import AlumniImpact, RewardTransaction
from auth import get_current_user

class AlumniImpactResponse(BaseModel):
    total_score: int
    total_interactions: int
    students_helped: int
    completed_mentorships: int
    average_rating: float
    reward_points: int

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

class RewardTransactionResponse(BaseModel):
    id: str
    points: int
    reason: str
    created_at: str

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
