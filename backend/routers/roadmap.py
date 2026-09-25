import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from database import get_db
from models import User, StudentProfile, CareerGoal, CareerRoadmap, RoadmapPhase, RoadmapMilestone
from auth import require_role
from services.ai_service import AIService

router = APIRouter(prefix="/api/v1/roadmap", tags=["roadmap"])
ai_service = AIService()

class GenerateRequest(BaseModel):
    # Optional explicitly provided overrides, else we use the profile
    career_goal: Optional[str] = None
    industry: Optional[str] = None

class MilestoneResponse(BaseModel):
    id: str
    skill_name: str
    description: str
    difficulty: str
    estimated_time: str
    is_completed: bool

class PhaseResponse(BaseModel):
    id: str
    phase_name: str
    milestones: List[MilestoneResponse]

class RoadmapResponse(BaseModel):
    id: str
    status: str
    phases: List[PhaseResponse]
    career_goal: str
    recommended_domain: str
    estimated_focus: str
    explanation: str

@router.get("", response_model=Optional[RoadmapResponse])
async def get_roadmap(
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db)
):
    roadmap = db.query(CareerRoadmap).filter(
        CareerRoadmap.student_id == current_user.id,
        CareerRoadmap.status == "active"
    ).first()
    
    if not roadmap:
        return None
        
    career_goal = db.query(CareerGoal).filter(CareerGoal.id == roadmap.career_goal_id).first()
    
    phases = db.query(RoadmapPhase).filter(RoadmapPhase.roadmap_id == roadmap.id).order_by(RoadmapPhase.order_index).all()
    
    response_phases = []
    for p in phases:
        milestones = db.query(RoadmapMilestone).filter(RoadmapMilestone.phase_id == p.id).order_by(RoadmapMilestone.order_index).all()
        m_responses = [
            MilestoneResponse(
                id=m.id,
                skill_name=m.skill_name,
                description=m.description or "",
                difficulty=m.difficulty or "",
                estimated_time=m.estimated_time or "",
                is_completed=m.is_completed
            ) for m in milestones
        ]
        response_phases.append(
            PhaseResponse(
                id=p.id,
                phase_name=p.phase_name,
                milestones=m_responses
            )
        )
        
    return RoadmapResponse(
        id=roadmap.id,
        status=roadmap.status,
        phases=response_phases,
        career_goal=career_goal.goal_title if career_goal else "",
        recommended_domain=career_goal.target_role if career_goal else "",
        estimated_focus="Self-paced",  # We could store this in CareerRoadmap model, but avoiding schema migration
        explanation="Your active career roadmap."
    )

@router.post("/generate", response_model=RoadmapResponse)
async def generate_roadmap(
    request: GenerateRequest,
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db)
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    # Gather input data
    input_data = {
        "career_goal_text": request.career_goal or profile.career_goal_text,
        "desired_career": profile.desired_career,
        "desired_domain": request.industry or profile.desired_domain,
    }
    
    # 1. Generate via AI Service
    try:
        ai_result = await ai_service.generate_career_roadmap(input_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to generate roadmap via AI service")
        
    # 2. Deactivate old roadmaps
    old_roadmaps = db.query(CareerRoadmap).filter(CareerRoadmap.student_id == current_user.id).all()
    for rm in old_roadmaps:
        rm.status = "archived"
    
    # 3. Create CareerGoal
    goal_id = str(uuid.uuid4())
    career_goal = CareerGoal(
        id=goal_id,
        student_id=current_user.id,
        goal_title=ai_result.career_goal,
        target_role=ai_result.recommended_domain
    )
    db.add(career_goal)
    
    # 4. Create CareerRoadmap
    roadmap_id = str(uuid.uuid4())
    roadmap = CareerRoadmap(
        id=roadmap_id,
        student_id=current_user.id,
        career_goal_id=goal_id,
        status="active"
    )
    db.add(roadmap)
    db.flush() # flush to get IDs
    
    # 5. Create Phases & Milestones
    response_phases = []
    
    for phase_idx, phase_data in enumerate(ai_result.phases):
        phase_id = str(uuid.uuid4())
        phase = RoadmapPhase(
            id=phase_id,
            roadmap_id=roadmap.id,
            phase_name=phase_data.phase_name,
            order_index=phase_idx
        )
        db.add(phase)
        db.flush()
        
        m_responses = []
        for m_idx, m_data in enumerate(phase_data.milestones):
            m_id = str(uuid.uuid4())
            milestone = RoadmapMilestone(
                id=m_id,
                phase_id=phase.id,
                skill_name=m_data.skill_name,
                description=m_data.description,
                difficulty=m_data.difficulty,
                estimated_time=m_data.estimated_time,
                is_completed=False,
                progress_pct=0,
                order_index=m_idx
            )
            db.add(milestone)
            
            m_responses.append(
                MilestoneResponse(
                    id=m_id,
                    skill_name=m_data.skill_name,
                    description=m_data.description,
                    difficulty=m_data.difficulty,
                    estimated_time=m_data.estimated_time,
                    is_completed=False
                )
            )
            
        response_phases.append(
            PhaseResponse(
                id=phase_id,
                phase_name=phase_data.phase_name,
                milestones=m_responses
            )
        )
        
    db.commit()
    
    return RoadmapResponse(
        id=roadmap.id,
        status=roadmap.status,
        phases=response_phases,
        career_goal=ai_result.career_goal,
        recommended_domain=ai_result.recommended_domain,
        estimated_focus=ai_result.estimated_focus,
        explanation=ai_result.explanation
    )
