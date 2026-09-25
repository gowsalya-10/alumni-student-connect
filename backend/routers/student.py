from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, List
import json
from database import get_db
from models import User, StudentProfile, Skill, StudentSkill
from auth import get_current_user, require_role

router = APIRouter(prefix="/api/v1/student", tags=["student"])

class StudentProfileUpdate(BaseModel):
    name: Optional[str] = None
    photo_url: Optional[str] = None
    department: Optional[str] = None
    year: Optional[int] = None
    college: Optional[str] = None
    desired_career: Optional[str] = None
    desired_domain: Optional[str] = None
    preferred_industry: Optional[str] = None
    preferred_job_role: Optional[str] = None
    preferred_location: Optional[str] = None
    mentorship_interests: Optional[List[str]] = None
    career_goal_text: Optional[str] = None
    preferred_communication: Optional[str] = None

class StudentProfileResponse(BaseModel):
    user_id: str
    name: str
    photo_url: Optional[str] = None
    department: Optional[str] = None
    year: Optional[int] = None
    college: Optional[str] = None
    desired_career: Optional[str] = None
    desired_domain: Optional[str] = None
    preferred_industry: Optional[str] = None
    preferred_job_role: Optional[str] = None
    preferred_location: Optional[str] = None
    mentorship_interests: Optional[List[str]] = None
    career_goal_text: Optional[str] = None
    preferred_communication: Optional[str] = None
    career_readiness_pct: int
    onboarding_completed: bool

    class Config:
        from_attributes = True

@router.get("/profile", response_model=StudentProfileResponse)
async def get_profile(
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db)
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")
    
    # Parse JSON text back to list for response
    profile_dict = profile.__dict__.copy()
    if profile.mentorship_interests:
        try:
            profile_dict["mentorship_interests"] = json.loads(profile.mentorship_interests)
        except json.JSONDecodeError:
            profile_dict["mentorship_interests"] = []
    else:
        profile_dict["mentorship_interests"] = []
        
    return profile_dict

@router.put("/profile", response_model=StudentProfileResponse)
async def update_profile(
    request: StudentProfileUpdate,
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db)
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    update_data = request.model_dump(exclude_unset=True)
    
    if "mentorship_interests" in update_data:
        update_data["mentorship_interests"] = json.dumps(update_data["mentorship_interests"])

    for key, value in update_data.items():
        setattr(profile, key, value)
        
    db.commit()
    db.refresh(profile)
    
    profile_dict = profile.__dict__.copy()
    if profile.mentorship_interests:
        try:
            profile_dict["mentorship_interests"] = json.loads(profile.mentorship_interests)
        except json.JSONDecodeError:
            profile_dict["mentorship_interests"] = []
    else:
        profile_dict["mentorship_interests"] = []
        
    return profile_dict

@router.post("/onboarding/complete")
async def complete_onboarding(
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db)
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    profile.onboarding_completed = True
    db.commit()
    return {"message": "Onboarding completed successfully"}
