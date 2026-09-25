from database import engine, Base
from models import User, StudentProfile, Skill, StudentSkill, CareerGoal, CareerRoadmap, RoadmapPhase, RoadmapMilestone, Resume, ResumeVersion

def init_db():
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    init_db()
