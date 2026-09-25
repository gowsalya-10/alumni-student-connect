from sqlalchemy import Column, String, Boolean, DateTime, Integer, Text, ForeignKey, Numeric, CheckConstraint, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class UserRole(str, enum.Enum):
    STUDENT = "student"
    ALUMNI = "alumni"
    ADMIN = "admin"

class VerificationStatus(str, enum.Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"
    MORE_INFO_REQUESTED = "more_info_requested"

class ConnectionStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    DECLINED = "declined"

class MentorshipStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    DECLINED = "declined"

class SessionStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"

class OpportunityType(str, enum.Enum):
    INTERNSHIP = "internship"
    JOB = "job"
    RESEARCH = "research"
    PROJECT = "project"
    FREELANCE = "freelance"
    COMPETITION = "competition"
    WORKSHOP = "workshop"
    REFERRAL = "referral"

class ApplicationStatus(str, enum.Enum):
    APPLIED = "applied"
    UNDER_REVIEW = "under_review"
    SHORTLISTED = "shortlisted"
    REJECTED = "rejected"
    ACCEPTED = "accepted"

class RedemptionStatus(str, enum.Enum):
    REQUESTED = "requested"
    APPROVED = "approved"
    REJECTED = "rejected"
    FULFILLED = "fulfilled"

class CommunicationMethod(str, enum.Enum):
    CHAT = "chat"
    EMAIL = "email"
    VIDEO_CALL = "video_call"
    PHONE = "phone"

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)  # UUID stored as string
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)  # Store as string for SQLite compatibility
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    name = Column(String(150), nullable=False)
    photo_url = Column(Text)
    department = Column(String(150))
    year = Column(Integer)
    college = Column(String(200))
    desired_career = Column(String(200))
    desired_domain = Column(String(200))
    preferred_industry = Column(String(200))
    preferred_job_role = Column(String(200))
    preferred_location = Column(String(200))
    mentorship_interests = Column(Text)  # JSON array stored as text
    career_goal_text = Column(Text)
    preferred_communication = Column(String(50), default="chat")
    career_readiness_pct = Column(Integer, default=0)
    __table_args__ = (
        CheckConstraint('career_readiness_pct BETWEEN 0 AND 100', name='check_career_readiness_pct'),
    )
    onboarding_completed = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

class AlumniProfile(Base):
    __tablename__ = "alumni_profiles"

    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    name = Column(String(150), nullable=False)
    photo_url = Column(Text)
    current_role = Column(String(200))
    company = Column(String(200))
    domain = Column(String(200))
    industry = Column(String(200))
    location = Column(String(200))
    skills = Column(Text)  # JSON array stored as text
    mentorship_interests = Column(Text)  # JSON array stored as text
    experience = Column(Text)
    education = Column(Text)
    bio = Column(Text)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    category = Column(String(100))

class StudentSkill(Base):
    __tablename__ = "student_skills"

    student_id = Column(String, ForeignKey("student_profiles.user_id", ondelete="CASCADE"), primary_key=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True)
    proficiency_pct = Column(Integer, nullable=False, default=0)
    __table_args__ = (
        CheckConstraint('proficiency_pct BETWEEN 0 AND 100', name='check_proficiency_pct'),
    )

class CareerGoal(Base):
    __tablename__ = "career_goals"

    id = Column(String, primary_key=True)  # UUID
    student_id = Column(String, ForeignKey("student_profiles.user_id", ondelete="CASCADE"))
    goal_title = Column(String(200), nullable=False)
    target_role = Column(String(200))
    created_at = Column(DateTime, nullable=False, server_default=func.now())

class CareerRoadmap(Base):
    __tablename__ = "career_roadmaps"

    id = Column(String, primary_key=True)  # UUID
    student_id = Column(String, ForeignKey("student_profiles.user_id", ondelete="CASCADE"))
    career_goal_id = Column(String, ForeignKey("career_goals.id", ondelete="CASCADE"))
    status = Column(String(50), default="active")
    generated_at = Column(DateTime, nullable=False, server_default=func.now())

class RoadmapPhase(Base):
    __tablename__ = "roadmap_phases"

    id = Column(String, primary_key=True)  # UUID
    roadmap_id = Column(String, ForeignKey("career_roadmaps.id", ondelete="CASCADE"))
    phase_name = Column(String(150), nullable=False)
    order_index = Column(Integer, nullable=False)

class RoadmapMilestone(Base):
    __tablename__ = "roadmap_milestones"

    id = Column(String, primary_key=True)  # UUID
    phase_id = Column(String, ForeignKey("roadmap_phases.id", ondelete="CASCADE"))
    skill_name = Column(String(150), nullable=False)
    description = Column(Text)
    difficulty = Column(String(50))
    estimated_time = Column(String(100))
    resources = Column(Text)  # JSONB stored as text
    project_suggestion = Column(Text)
    is_completed = Column(Boolean, nullable=False, default=False)
    progress_pct = Column(Integer, nullable=False, default=0)
    order_index = Column(Integer, nullable=False)
    __table_args__ = (
        CheckConstraint('progress_pct BETWEEN 0 AND 100', name='check_milestone_progress_pct'),
    )

class Resume(Base):
    __tablename__ = "resumes"

    student_id = Column(String, ForeignKey("student_profiles.user_id", ondelete="CASCADE"), primary_key=True)
    primary_version_id = Column(String)  # Will be FK after resume_versions is created

class ResumeVersion(Base):
    __tablename__ = "resume_versions"

    id = Column(String, primary_key=True)  # UUID
    student_id = Column(String, ForeignKey("student_profiles.user_id", ondelete="CASCADE"))
    file_url = Column(Text, nullable=False)
    version_name = Column(String(150), nullable=False)
    health_score = Column(Integer)
    ai_suggestions = Column(Text)  # JSONB stored as text
    is_primary = Column(Boolean, nullable=False, default=False)
    uploaded_at = Column(DateTime, nullable=False, server_default=func.now())
    __table_args__ = (
        CheckConstraint('health_score BETWEEN 0 AND 100', name='check_health_score'),
    )

class Mentorship(Base):
    __tablename__ = "mentorships"
    id = Column(String, primary_key=True)
    student_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    alumni_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    message = Column(Text)
    status = Column(String(50), default="pending")  # pending, accepted, declined, cancelled, completed
    requested_at = Column(DateTime, nullable=False, server_default=func.now())
    responded_at = Column(DateTime)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

class MentorshipInteraction(Base):
    __tablename__ = "mentorship_interactions"
    id = Column(String, primary_key=True)
    mentorship_id = Column(String, ForeignKey("mentorships.id", ondelete="CASCADE"))
    interaction_type = Column(String(100))
    duration_minutes = Column(Integer)
    notes = Column(Text)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

class MentorshipRating(Base):
    __tablename__ = "mentorship_ratings"
    id = Column(String, primary_key=True)
    mentorship_id = Column(String, ForeignKey("mentorships.id", ondelete="CASCADE"), unique=True)
    student_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    alumni_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    rating = Column(Integer, nullable=False)
    review = Column(Text)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    __table_args__ = (
        CheckConstraint('rating >= 1 AND rating <= 5', name='check_rating'),
    )

class AlumniImpact(Base):
    __tablename__ = "alumni_impact"
    alumni_id = Column(String, ForeignKey("alumni_profiles.user_id", ondelete="CASCADE"), primary_key=True)
    total_score = Column(Integer, default=0)
    total_interactions = Column(Integer, default=0)
    students_helped = Column(Integer, default=0)
    completed_mentorships = Column(Integer, default=0)
    average_rating = Column(Numeric(3, 2), default=0.0)
    reward_points = Column(Integer, default=0)
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

class RewardTransaction(Base):
    __tablename__ = "reward_transactions"
    id = Column(String, primary_key=True)
    alumni_id = Column(String, ForeignKey("alumni_profiles.user_id", ondelete="CASCADE"))
    points = Column(Integer, nullable=False)
    reason = Column(String(200))
    interaction_id = Column(String, ForeignKey("mentorship_interactions.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    title = Column(String(200), nullable=False)
    message = Column(Text)
    type = Column(String(100))
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
