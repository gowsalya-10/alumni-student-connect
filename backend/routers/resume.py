import uuid
import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from database import get_db
from models import User, Resume, ResumeVersion
from auth import require_role
from services.storage_service import StorageService

router = APIRouter(prefix="/api/v1/resumes", tags=["resumes"])
storage_service = StorageService()

class ResumeVersionResponse(BaseModel):
    id: str
    file_url: str
    version_name: str
    health_score: Optional[int]
    ai_suggestions: Optional[dict]
    is_primary: bool

class ResumeHealthCheck(BaseModel):
    score: int
    checks: List[dict]

class ResumeVaultResponse(BaseModel):
    primary_resume: Optional[ResumeVersionResponse]
    versions: List[ResumeVersionResponse]
    health: Optional[ResumeHealthCheck]

@router.get("", response_model=ResumeVaultResponse)
async def get_resume_vault(
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.student_id == current_user.id).first()
    
    versions = db.query(ResumeVersion).filter(ResumeVersion.student_id == current_user.id).order_by(ResumeVersion.uploaded_at.desc()).all()
    
    version_responses = []
    primary = None
    
    for v in versions:
        suggestions = {}
        if v.ai_suggestions:
            try:
                suggestions = json.loads(v.ai_suggestions)
            except:
                pass
                
        resp = ResumeVersionResponse(
            id=v.id,
            file_url=v.file_url,
            version_name=v.version_name,
            health_score=v.health_score,
            ai_suggestions=suggestions,
            is_primary=v.is_primary
        )
        version_responses.append(resp)
        if v.is_primary:
            primary = resp
            
    # Mock health for MVP, deterministically based on whether a resume exists
    health = None
    if primary:
        health = ResumeHealthCheck(
            score=primary.health_score or 82,
            checks=[
                {"name": "Resume uploaded", "status": "pass"},
                {"name": "Contact information present", "status": "pass"},
                {"name": "Skills section present", "status": "pass"},
                {"name": "Education section present", "status": "pass"},
                {"name": "Projects section could be stronger", "status": "warning"}
            ]
        )
            
    return ResumeVaultResponse(
        primary_resume=primary,
        versions=version_responses,
        health=health
    )

@router.post("", response_model=ResumeVersionResponse)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db)
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF resumes are supported.")
        
    file_url = await storage_service.save_file(file)
    version_id = str(uuid.uuid4())
    
    resume = db.query(Resume).filter(Resume.student_id == current_user.id).first()
    if not resume:
        resume = Resume(student_id=current_user.id, primary_version_id=version_id)
        db.add(resume)
        is_first = True
    else:
        is_first = False
        if not resume.primary_version_id:
            resume.primary_version_id = version_id
            is_first = True
            
    # MVP deterministic health score based on filename length
    score = min(100, 70 + len(file.filename))
    
    version = ResumeVersion(
        id=version_id,
        student_id=current_user.id,
        file_url=file_url,
        version_name=file.filename,
        health_score=score,
        is_primary=is_first
    )
    db.add(version)
    db.commit()
    
    return ResumeVersionResponse(
        id=version.id,
        file_url=version.file_url,
        version_name=version.version_name,
        health_score=version.health_score,
        ai_suggestions={},
        is_primary=version.is_primary
    )

@router.put("/{version_id}/primary")
async def set_primary_resume(
    version_id: str,
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db)
):
    version = db.query(ResumeVersion).filter(
        ResumeVersion.id == version_id,
        ResumeVersion.student_id == current_user.id
    ).first()
    
    if not version:
        raise HTTPException(status_code=404, detail="Resume version not found")
        
    resume = db.query(Resume).filter(Resume.student_id == current_user.id).first()
    if resume:
        resume.primary_version_id = version_id
        
    # Unset all
    db.query(ResumeVersion).filter(ResumeVersion.student_id == current_user.id).update({"is_primary": False})
    # Set this one
    version.is_primary = True
    db.commit()
    
    return {"message": "Primary resume updated"}

@router.delete("/{version_id}")
async def delete_resume(
    version_id: str,
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db)
):
    version = db.query(ResumeVersion).filter(
        ResumeVersion.id == version_id,
        ResumeVersion.student_id == current_user.id
    ).first()
    
    if not version:
        raise HTTPException(status_code=404, detail="Resume version not found")
        
    storage_service.delete_file(version.file_url)
    
    was_primary = version.is_primary
    db.delete(version)
    
    resume = db.query(Resume).filter(Resume.student_id == current_user.id).first()
    if resume and was_primary:
        # Find next one
        next_ver = db.query(ResumeVersion).filter(ResumeVersion.student_id == current_user.id).first()
        if next_ver:
            next_ver.is_primary = True
            resume.primary_version_id = next_ver.id
        else:
            resume.primary_version_id = None
            
    db.commit()
    return {"message": "Resume deleted"}

@router.get("/download/{filename}")
async def download_resume(filename: str):
    filepath = storage_service.get_filepath(filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(filepath, filename=filename)
