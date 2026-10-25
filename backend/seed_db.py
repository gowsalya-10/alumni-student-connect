"""
Idempotent synthetic database seeder for AlumniConnect — Alumni-Student Mentorship Platform.
Populates realistic fictional demo data adhering strictly to the existing SQLAlchemy schema.
Running multiple times is safe and will not produce duplicate records or constraint errors.
"""

import os
import json
import uuid
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from database import SessionLocal, engine, Base
import models
from auth import get_password_hash

DEMO_PASSWORD = "DemoPassword123!"

def ensure_sample_resume_file():
    """Ensure a sample resume file exists in the upload directory so downloads succeed."""
    upload_dir = os.path.join(os.path.dirname(__file__), "uploads", "resumes")
    os.makedirs(upload_dir, exist_ok=True)
    sample_file = os.path.join(upload_dir, "alex_rivera_resume.pdf")
    if not os.path.exists(sample_file):
        with open(sample_file, "wb") as f:
            # Minimal valid PDF binary header
            f.write(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 53 >>\nstream\nBT\n/F1 18 Tf\n72 712 Td\n(Alex Rivera - Software Engineer Resume) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000015 00000 n \n0000000068 00000 n \n0000000125 00000 n \n0000000216 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n320\n%%EOF\n")

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        ensure_sample_resume_file()
        hashed_password = get_password_hash(DEMO_PASSWORD)

        # -------------------------------------------------------------------------
        # 1. 25 Technical Skills
        # -------------------------------------------------------------------------
        skills_data = [
            ("Python", "Programming Languages"),
            ("TypeScript", "Programming Languages"),
            ("JavaScript", "Programming Languages"),
            ("Go", "Programming Languages"),
            ("React", "Frontend"),
            ("Next.js", "Frontend"),
            ("Tailwind CSS", "Frontend"),
            ("Vue.js", "Frontend"),
            ("FastAPI", "Backend"),
            ("Node.js", "Backend"),
            ("PostgreSQL", "Databases"),
            ("MongoDB", "Databases"),
            ("Redis", "Databases"),
            ("Docker", "DevOps & Cloud"),
            ("Kubernetes", "DevOps & Cloud"),
            ("AWS", "DevOps & Cloud"),
            ("CI/CD Pipelines", "DevOps & Cloud"),
            ("PyTorch", "Machine Learning"),
            ("TensorFlow", "Machine Learning"),
            ("NLP & LLMs", "Machine Learning"),
            ("Penetration Testing", "Cybersecurity"),
            ("OWASP Security", "Cybersecurity"),
            ("Network Security", "Cybersecurity"),
            ("Figma", "Product Design"),
            ("Design Systems", "Product Design"),
        ]

        skill_map = {}
        for name, category in skills_data:
            skill = db.query(models.Skill).filter(models.Skill.name == name).first()
            if not skill:
                skill = models.Skill(name=name, category=category)
                db.add(skill)
                db.flush()
            skill_map[name] = skill

        # -------------------------------------------------------------------------
        # 2. 12 Users (5 Students, 6 Alumni, 1 Admin)
        # -------------------------------------------------------------------------
        users_config = [
            # 5 Students
            {
                "email": "student@demo.edu",
                "role": "student",
                "name": "Alex Rivera",
                "department": "Computer Science",
                "year": 3,
                "college": "Apex Institute of Technology",
                "desired_career": "Full Stack Developer",
                "desired_domain": "Web Development",
                "preferred_industry": "Software & Internet",
                "preferred_job_role": "Full Stack Engineer",
                "preferred_location": "San Francisco, CA",
                "mentorship_interests": ["Web Development", "System Architecture", "Interview Prep"],
                "career_goal_text": "To master scalable full-stack web applications and become a lead software engineer.",
                "readiness": 75,
                "skills": [("React", 80), ("TypeScript", 75), ("FastAPI", 70), ("PostgreSQL", 65), ("Docker", 55)],
            },
            {
                "email": "priya.patel@demo.edu",
                "role": "student",
                "name": "Priya Patel",
                "department": "Data Science & AI",
                "year": 4,
                "college": "Apex Institute of Technology",
                "desired_career": "Machine Learning Engineer",
                "desired_domain": "Artificial Intelligence",
                "preferred_industry": "AI & Big Data",
                "preferred_job_role": "AI Research Engineer",
                "preferred_location": "Seattle, WA",
                "mentorship_interests": ["Machine Learning", "Research", "Graduate School"],
                "career_goal_text": "Aiming to build foundation models and large-scale NLP inference pipelines.",
                "readiness": 85,
                "skills": [("Python", 90), ("PyTorch", 80), ("NLP & LLMs", 75), ("Docker", 60)],
            },
            {
                "email": "marcus.chen@demo.edu",
                "role": "student",
                "name": "Marcus Chen",
                "department": "Software Engineering",
                "year": 2,
                "college": "Apex Institute of Technology",
                "desired_career": "Cloud & DevOps Engineer",
                "desired_domain": "Cloud Computing",
                "preferred_industry": "Cloud Infrastructure",
                "preferred_job_role": "Site Reliability Engineer",
                "preferred_location": "Austin, TX",
                "mentorship_interests": ["Cloud Architecture", "Linux", "Kubernetes"],
                "career_goal_text": "Automating global multi-cloud infrastructure and high availability deployments.",
                "readiness": 60,
                "skills": [("Go", 65), ("Docker", 70), ("Kubernetes", 50), ("AWS", 55)],
            },
            {
                "email": "sarah.kim@demo.edu",
                "role": "student",
                "name": "Sarah Kim",
                "department": "Cybersecurity",
                "year": 4,
                "college": "Apex Institute of Technology",
                "desired_career": "Security Engineer",
                "desired_domain": "Cybersecurity",
                "preferred_industry": "Cyber Defense & Defense Tech",
                "preferred_job_role": "Application Security Specialist",
                "preferred_location": "Boston, MA",
                "mentorship_interests": ["Application Security", "Threat Modeling", "Certifications"],
                "career_goal_text": "Securing distributed cloud systems and advancing automated threat prevention.",
                "readiness": 80,
                "skills": [("Python", 85), ("Penetration Testing", 75), ("OWASP Security", 80), ("Network Security", 70)],
            },
            {
                "email": "jordan.taylor@demo.edu",
                "role": "student",
                "name": "Jordan Taylor",
                "department": "Human-Computer Interaction",
                "year": 3,
                "college": "Apex Institute of Technology",
                "desired_career": "UI/UX Designer",
                "desired_domain": "Product Design",
                "preferred_industry": "Consumer Tech & Media",
                "preferred_job_role": "Senior Product Designer",
                "preferred_location": "New York, NY",
                "mentorship_interests": ["Design Systems", "User Research", "Portfolio Review"],
                "career_goal_text": "Creating human-centric, accessible, and delightful design systems.",
                "readiness": 70,
                "skills": [("Figma", 90), ("Design Systems", 85), ("React", 50), ("Tailwind CSS", 70)],
            },

            # 6 Alumni
            {
                "email": "alumni@demo.edu",
                "role": "alumni",
                "name": "Dr. Elena Rostova",
                "current_role": "Staff Software Engineer",
                "company": "CloudNova Technologies",
                "domain": "Web Development",
                "industry": "Enterprise Cloud",
                "location": "San Francisco, CA",
                "skills": ["React", "TypeScript", "FastAPI", "PostgreSQL", "Docker", "Node.js"],
                "mentorship_interests": ["Web Development", "System Architecture", "Interview Prep", "Career Transitions"],
                "experience": "8+ years in distributed web systems, API design, and engineering mentorship at high-growth companies.",
                "education": "Ph.D. in Computer Science, Apex Institute of Technology ('18)",
                "bio": "Staff Engineer passionate about empowering students to bridge theoretical CS and industry best practices.",
                "is_verified": True,
            },
            {
                "email": "vikram.malhotra@demo.edu",
                "role": "alumni",
                "name": "Vikram Malhotra",
                "current_role": "Principal AI Architect",
                "company": "Synthetix Intelligence",
                "domain": "Artificial Intelligence",
                "industry": "AI & Machine Learning",
                "location": "Seattle, WA",
                "skills": ["Python", "PyTorch", "TensorFlow", "NLP & LLMs", "AWS"],
                "mentorship_interests": ["Machine Learning", "Research", "Graduate School", "AI Ethics"],
                "experience": "10 years scaling LLM architectures and production ML pipelines for Fortune 500 enterprises.",
                "education": "M.S. in Artificial Intelligence, Stanford University ('16)",
                "bio": "Active researcher and engineer guiding emerging AI engineers into cutting-edge industry applications.",
                "is_verified": True,
            },
            {
                "email": "amara.okafor@demo.edu",
                "role": "alumni",
                "name": "Amara Okafor",
                "current_role": "Lead Site Reliability Engineer",
                "company": "Skyline Infrastructure",
                "domain": "Cloud Computing",
                "industry": "FinTech Infrastructure",
                "location": "Austin, TX",
                "skills": ["Go", "Docker", "Kubernetes", "AWS", "CI/CD Pipelines"],
                "mentorship_interests": ["Cloud Architecture", "Linux", "Kubernetes", "DevOps Culture"],
                "experience": "7 years architecting zero-downtime platforms and managing resilient Kubernetes clusters.",
                "education": "B.S. in Software Engineering, Apex Institute of Technology ('19)",
                "bio": "DevOps advocate committed to helping undergraduates master infrastructure and observability.",
                "is_verified": True,
            },
            {
                "email": "david.vance@demo.edu",
                "role": "alumni",
                "name": "David Vance",
                "current_role": "Senior Application Security Engineer",
                "company": "Fortress Cyber Labs",
                "domain": "Cybersecurity",
                "industry": "Cybersecurity",
                "location": "Boston, MA",
                "skills": ["Penetration Testing", "OWASP Security", "Network Security", "Python"],
                "mentorship_interests": ["Application Security", "Threat Modeling", "Certifications", "Bug Bounties"],
                "experience": "6 years in ethical hacking, code auditing, and implementing OWASP-compliant security protocols.",
                "education": "B.S. in Cybersecurity, Apex Institute of Technology ('20)",
                "bio": "Security practitioner focused on empowering future analysts and defense engineers.",
                "is_verified": True,
            },
            {
                "email": "maya.lin@demo.edu",
                "role": "alumni",
                "name": "Maya Lin",
                "current_role": "Product Design Director",
                "company": "PixelCraft Studios",
                "domain": "Product Design",
                "industry": "Consumer Digital Products",
                "location": "New York, NY",
                "skills": ["Figma", "Design Systems", "React", "Tailwind CSS"],
                "mentorship_interests": ["Design Systems", "User Research", "Portfolio Review", "Design Leadership"],
                "experience": "9 years leading design teams and creating scalable UI component libraries.",
                "education": "B.Des in Digital Media, Rhode Island School of Design ('17)",
                "bio": "Design mentor excited to review student portfolios and teach design systems fundamentals.",
                "is_verified": True,
            },
            {
                "email": "rachel.green@demo.edu",
                "role": "alumni",
                "name": "Rachel Green",
                "current_role": "Engineering Manager - Full Stack",
                "company": "Vanguard Systems",
                "domain": "Web Development",
                "industry": "E-Commerce Tech",
                "location": "Chicago, IL",
                "skills": ["React", "Next.js", "Node.js", "MongoDB", "Redis"],
                "mentorship_interests": ["Web Development", "Interview Prep", "Management Tracks"],
                "experience": "5 years managing agile engineering teams building high-throughput consumer web platforms.",
                "education": "B.S. in Computer Science, Apex Institute of Technology ('21)",
                "bio": "Engineering manager eager to support early-career engineers with technical interview prep.",
                "is_verified": False,
            },

            # 1 Admin
            {
                "email": "admin@demo.edu",
                "role": "admin",
                "name": "Platform Administrator",
            }
        ]

        user_records = {}

        for u in users_config:
            user = db.query(models.User).filter(models.User.email == u["email"]).first()
            if not user:
                user = models.User(
                    id=str(uuid.uuid4()),
                    email=u["email"],
                    password_hash=hashed_password,
                    role=u["role"],
                    is_active=True
                )
                db.add(user)
                db.flush()
            user_records[u["email"]] = user

            # Student Profile
            if u["role"] == "student":
                sp = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == user.id).first()
                if not sp:
                    sp = models.StudentProfile(
                        user_id=user.id,
                        name=u["name"],
                        department=u["department"],
                        year=u["year"],
                        college=u["college"],
                        desired_career=u["desired_career"],
                        desired_domain=u["desired_domain"],
                        preferred_industry=u["preferred_industry"],
                        preferred_job_role=u["preferred_job_role"],
                        preferred_location=u["preferred_location"],
                        mentorship_interests=json.dumps(u["mentorship_interests"]),
                        career_goal_text=u["career_goal_text"],
                        preferred_communication="chat",
                        career_readiness_pct=u["readiness"],
                        onboarding_completed=True
                    )
                    db.add(sp)
                    db.flush()

                # Student Skills
                for skill_name, proficiency in u.get("skills", []):
                    sk = skill_map.get(skill_name)
                    if sk:
                        existing_ss = db.query(models.StudentSkill).filter(
                            models.StudentSkill.student_id == user.id,
                            models.StudentSkill.skill_id == sk.id
                        ).first()
                        if not existing_ss:
                            db.add(models.StudentSkill(
                                student_id=user.id,
                                skill_id=sk.id,
                                proficiency_pct=proficiency
                            ))

            # Alumni Profile
            elif u["role"] == "alumni":
                ap = db.query(models.AlumniProfile).filter(models.AlumniProfile.user_id == user.id).first()
                if not ap:
                    ap = models.AlumniProfile(
                        user_id=user.id,
                        name=u["name"],
                        current_role=u["current_role"],
                        company=u["company"],
                        domain=u["domain"],
                        industry=u["industry"],
                        location=u["location"],
                        skills=json.dumps(u["skills"]),
                        mentorship_interests=json.dumps(u["mentorship_interests"]),
                        experience=u["experience"],
                        education=u["education"],
                        bio=u["bio"],
                        is_verified=u["is_verified"]
                    )
                    db.add(ap)
                    db.flush()

                # Alumni Impact record
                impact = db.query(models.AlumniImpact).filter(models.AlumniImpact.alumni_id == user.id).first()
                if not impact:
                    impact = models.AlumniImpact(
                        alumni_id=user.id,
                        total_score=60 if u["is_verified"] else 15,
                        total_interactions=4 if u["is_verified"] else 1,
                        students_helped=3 if u["is_verified"] else 1,
                        completed_mentorships=2 if u["is_verified"] else 0,
                        average_rating=4.9 if u["is_verified"] else 4.0,
                        reward_points=120 if u["is_verified"] else 25
                    )
                    db.add(impact)
                    db.flush()

        db.commit()

        # -------------------------------------------------------------------------
        # 3. Career Goals & Career Roadmaps with Phases & Milestones
        # -------------------------------------------------------------------------
        alex = user_records["student@demo.edu"]
        existing_goal = db.query(models.CareerGoal).filter(models.CareerGoal.student_id == alex.id).first()
        if not existing_goal:
            career_goal = models.CareerGoal(
                id=str(uuid.uuid4()),
                student_id=alex.id,
                goal_title="Full Stack Web Architect",
                target_role="Full Stack Engineer"
            )
            db.add(career_goal)
            db.flush()

            roadmap = models.CareerRoadmap(
                id=str(uuid.uuid4()),
                student_id=alex.id,
                career_goal_id=career_goal.id,
                status="active"
            )
            db.add(roadmap)
            db.flush()

            phases_data = [
                (
                    "Phase 1: Modern Frontend Foundations",
                    0,
                    [
                        ("React 19 & TypeScript Deep Dive", "Master hooks, concurrent rendering, and strict type safety.", "Intermediate", "4 Weeks", True, 100),
                        ("Next.js App Router Architecture", "Server components, server actions, and streaming SSR.", "Intermediate", "3 Weeks", True, 100),
                    ]
                ),
                (
                    "Phase 2: Scalable Backend & Data Systems",
                    1,
                    [
                        ("FastAPI & Asynchronous Python", "High-performance async REST APIs, dependency injection, and Pydantic validation.", "Advanced", "4 Weeks", True, 80),
                        ("PostgreSQL Schema & Query Optimization", "Relational indexing, connection pooling, and ACID transactions.", "Intermediate", "3 Weeks", False, 45),
                    ]
                ),
                (
                    "Phase 3: Production DevOps & Cloud",
                    2,
                    [
                        ("Containerization with Docker", "Multi-stage builds, local dev orchestration, and production images.", "Intermediate", "2 Weeks", False, 20),
                        ("CI/CD Automation & Cloud Deployment", "Automated GitHub Actions pipelines, cloud hosting, and SSL setup.", "Advanced", "3 Weeks", False, 0),
                    ]
                )
            ]

            for phase_name, p_idx, milestones in phases_data:
                phase = models.RoadmapPhase(
                    id=str(uuid.uuid4()),
                    roadmap_id=roadmap.id,
                    phase_name=phase_name,
                    order_index=p_idx
                )
                db.add(phase)
                db.flush()

                for m_idx, (skill_name, desc, diff, duration, completed, prog) in enumerate(milestones):
                    milestone = models.RoadmapMilestone(
                        id=str(uuid.uuid4()),
                        phase_id=phase.id,
                        skill_name=skill_name,
                        description=desc,
                        difficulty=diff,
                        estimated_time=duration,
                        is_completed=completed,
                        progress_pct=prog,
                        order_index=m_idx
                    )
                    db.add(milestone)

            db.commit()

        # -------------------------------------------------------------------------
        # 4. Resume Vault & Resume Versions (for student@demo.edu)
        # -------------------------------------------------------------------------
        existing_resume = db.query(models.Resume).filter(models.Resume.student_id == alex.id).first()
        if not existing_resume:
            version_id_primary = str(uuid.uuid4())
            version_id_v1 = str(uuid.uuid4())

            resume = models.Resume(
                student_id=alex.id,
                primary_version_id=version_id_primary
            )
            db.add(resume)

            suggestions = {
                "strengths": ["Clear technical stack", "Quantified project impact", "Active GitHub profile"],
                "improvements": ["Add more metrics on backend throughput", "Mention experience with Docker and CI/CD"],
                "formatting_score": 92
            }

            ver1 = models.ResumeVersion(
                id=version_id_v1,
                student_id=alex.id,
                file_url="/api/v1/resumes/download/alex_rivera_resume.pdf",
                version_name="Alex_Rivera_Resume_v1.pdf",
                health_score=76,
                ai_suggestions=json.dumps(suggestions),
                is_primary=False,
                uploaded_at=datetime.utcnow() - timedelta(days=20)
            )
            db.add(ver1)

            ver2 = models.ResumeVersion(
                id=version_id_primary,
                student_id=alex.id,
                file_url="/api/v1/resumes/download/alex_rivera_resume.pdf",
                version_name="Alex_Rivera_Resume_v2_Targeted.pdf",
                health_score=88,
                ai_suggestions=json.dumps(suggestions),
                is_primary=True,
                uploaded_at=datetime.utcnow() - timedelta(days=3)
            )
            db.add(ver2)
            db.commit()

        # -------------------------------------------------------------------------
        # 5. 8 Mentorship Records (Pending, Accepted, Completed)
        # -------------------------------------------------------------------------
        priya = user_records["priya.patel@demo.edu"]
        marcus = user_records["marcus.chen@demo.edu"]
        sarah = user_records["sarah.kim@demo.edu"]
        jordan = user_records["jordan.taylor@demo.edu"]

        elena = user_records["alumni@demo.edu"]
        vikram = user_records["vikram.malhotra@demo.edu"]
        amara = user_records["amara.okafor@demo.edu"]
        david = user_records["david.vance@demo.edu"]
        maya = user_records["maya.lin@demo.edu"]

        mentorship_specs = [
            # 1. Alex -> Elena (Accepted)
            (alex.id, elena.id, "accepted", "Hi Elena, I'd love your mentorship on building scalable web backends with FastAPI and system architecture.", 14, 13),
            # 2. Alex -> Vikram (Completed)
            (alex.id, vikram.id, "completed", "Hello Vikram, I'm exploring machine learning integration in web apps and would appreciate guidance.", 30, 29),
            # 3. Alex -> Amara (Pending)
            (alex.id, amara.id, "pending", "Hi Amara, would love to learn more about cloud deployment and DevOps best practices.", 2, None),
            # 4. Priya -> Vikram (Accepted)
            (priya.id, vikram.id, "accepted", "Dear Vikram, I am preparing for AI research roles and would value your feedback on my LLM project.", 10, 9),
            # 5. Priya -> Elena (Completed)
            (priya.id, elena.id, "completed", "Hello Dr. Elena, hoping to get your advice on production software engineering practices for data scientists.", 25, 24),
            # 6. Marcus -> Amara (Accepted)
            (marcus.id, amara.id, "accepted", "Hi Amara, I am studying Kubernetes and would appreciate mentorship on SRE workflows.", 7, 6),
            # 7. Sarah -> David (Accepted)
            (sarah.id, david.id, "accepted", "Hello David, seeking mentorship on application security threat modeling and penetration testing.", 12, 11),
            # 8. Jordan -> Maya (Pending)
            (jordan.id, maya.id, "pending", "Hi Maya, I'm refining my UX design portfolio and would love your review and guidance on design systems.", 1, None),
        ]

        mentorship_records = []
        for s_id, a_id, status, msg, days_req, days_resp in mentorship_specs:
            m = db.query(models.Mentorship).filter(
                models.Mentorship.student_id == s_id,
                models.Mentorship.alumni_id == a_id
            ).first()
            if not m:
                m_id = str(uuid.uuid4())
                m = models.Mentorship(
                    id=m_id,
                    student_id=s_id,
                    alumni_id=a_id,
                    message=msg,
                    status=status,
                    requested_at=datetime.utcnow() - timedelta(days=days_req),
                    responded_at=datetime.utcnow() - timedelta(days=days_resp) if days_resp else None
                )
                db.add(m)
                db.flush()
            mentorship_records.append(m)

        db.commit()

        # -------------------------------------------------------------------------
        # 6. Mentorship Interactions & Ratings
        # -------------------------------------------------------------------------
        # Interaction 1: Alex & Elena (Accepted mentorship)
        m_alex_elena = mentorship_records[0]
        i1 = db.query(models.MentorshipInteraction).filter(models.MentorshipInteraction.mentorship_id == m_alex_elena.id).first()
        if not i1:
            i1 = models.MentorshipInteraction(
                id=str(uuid.uuid4()),
                mentorship_id=m_alex_elena.id,
                interaction_type="1:1 Architecture Discussion",
                duration_minutes=45,
                notes="Discussed RESTful design principles, database connection pooling, and token-based authentication.",
                created_at=datetime.utcnow() - timedelta(days=7)
            )
            db.add(i1)

        # Interaction 2: Alex & Vikram (Completed mentorship)
        m_alex_vikram = mentorship_records[1]
        i2 = db.query(models.MentorshipInteraction).filter(models.MentorshipInteraction.mentorship_id == m_alex_vikram.id).first()
        if not i2:
            i2 = models.MentorshipInteraction(
                id=str(uuid.uuid4()),
                mentorship_id=m_alex_vikram.id,
                interaction_type="Career Strategy Session",
                duration_minutes=60,
                notes="Reviewed machine learning fundamentals and portfolio projects. Discussed transition from student to engineer.",
                created_at=datetime.utcnow() - timedelta(days=20)
            )
            db.add(i2)

        # Interaction 3: Priya & Elena (Completed mentorship)
        m_priya_elena = mentorship_records[4]
        i3 = db.query(models.MentorshipInteraction).filter(models.MentorshipInteraction.mentorship_id == m_priya_elena.id).first()
        if not i3:
            i3 = models.MentorshipInteraction(
                id=str(uuid.uuid4()),
                mentorship_id=m_priya_elena.id,
                interaction_type="Code Review & Best Practices",
                duration_minutes=30,
                notes="Detailed walkthrough of clean code modularity and Python typing standards in data pipelines.",
                created_at=datetime.utcnow() - timedelta(days=15)
            )
            db.add(i3)

        # Interaction 4: Sarah & David (Accepted mentorship)
        m_sarah_david = mentorship_records[6]
        i4 = db.query(models.MentorshipInteraction).filter(models.MentorshipInteraction.mentorship_id == m_sarah_david.id).first()
        if not i4:
            i4 = models.MentorshipInteraction(
                id=str(uuid.uuid4()),
                mentorship_id=m_sarah_david.id,
                interaction_type="Security Threat Modeling",
                duration_minutes=50,
                notes="Explored STRIDE methodology and automated vulnerability scanning in CI/CD.",
                created_at=datetime.utcnow() - timedelta(days=5)
            )
            db.add(i4)

        db.commit()

        # Ratings for completed mentorships
        r1 = db.query(models.MentorshipRating).filter(models.MentorshipRating.mentorship_id == m_alex_vikram.id).first()
        if not r1:
            r1 = models.MentorshipRating(
                id=str(uuid.uuid4()),
                mentorship_id=m_alex_vikram.id,
                student_id=alex.id,
                alumni_id=vikram.id,
                rating=5,
                review="Vikram was extraordinarily helpful in demystifying real-world ML deployment and career paths.",
                created_at=datetime.utcnow() - timedelta(days=18)
            )
            db.add(r1)

        r2 = db.query(models.MentorshipRating).filter(models.MentorshipRating.mentorship_id == m_priya_elena.id).first()
        if not r2:
            r2 = models.MentorshipRating(
                id=str(uuid.uuid4()),
                mentorship_id=m_priya_elena.id,
                student_id=priya.id,
                alumni_id=elena.id,
                rating=5,
                review="Elena shared invaluable advice on enterprise software engineering and high standards for clean architecture.",
                created_at=datetime.utcnow() - timedelta(days=12)
            )
            db.add(r2)

        db.commit()

        # -------------------------------------------------------------------------
        # 7. Reward Transactions for Alumni
        # -------------------------------------------------------------------------
        elena_rewards = db.query(models.RewardTransaction).filter(models.RewardTransaction.alumni_id == elena.id).all()
        if not elena_rewards:
            rt1 = models.RewardTransaction(
                id=str(uuid.uuid4()),
                alumni_id=elena.id,
                points=30,
                reason="Logged 1:1 Architecture Discussion with Alex Rivera",
                interaction_id=i1.id if i1 else None,
                created_at=datetime.utcnow() - timedelta(days=7)
            )
            rt2 = models.RewardTransaction(
                id=str(uuid.uuid4()),
                alumni_id=elena.id,
                points=50,
                reason="Completed mentorship milestone with Priya Patel",
                interaction_id=i3.id if i3 else None,
                created_at=datetime.utcnow() - timedelta(days=12)
            )
            rt3 = models.RewardTransaction(
                id=str(uuid.uuid4()),
                alumni_id=elena.id,
                points=40,
                reason="Platform mentor badge bonus",
                created_at=datetime.utcnow() - timedelta(days=2)
            )
            db.add_all([rt1, rt2, rt3])

        # -------------------------------------------------------------------------
        # 8. Notifications for Relevant Platform Activities
        # -------------------------------------------------------------------------
        notifs_data = [
            (
                alex.id,
                "Mentorship Accepted",
                "Dr. Elena Rostova has accepted your mentorship request.",
                "mentorship_accepted",
                13,
                True
            ),
            (
                alex.id,
                "Mentorship Completed",
                "Your mentorship session with Vikram Malhotra is complete. Please rate your experience!",
                "rating_reminder",
                19,
                True
            ),
            (
                alex.id,
                "Career Roadmap Updated",
                "Your career roadmap for Full Stack Web Architect has 2 newly completed milestones.",
                "roadmap_update",
                3,
                False
            ),
            (
                elena.id,
                "New Mentorship Request",
                "Alex Rivera requested mentorship regarding Web Development.",
                "mentorship_request",
                14,
                True
            ),
            (
                elena.id,
                "Reward Points Earned",
                "You earned 50 points for completing a student mentorship milestone.",
                "reward_earned",
                12,
                False
            ),
            (
                elena.id,
                "New 5-Star Rating Received",
                "Priya Patel left a 5-star review for your recent mentorship session.",
                "new_rating",
                12,
                False
            ),
        ]

        for user_id, title, message, n_type, days_ago, is_read in notifs_data:
            existing_notif = db.query(models.Notification).filter(
                models.Notification.user_id == user_id,
                models.Notification.title == title
            ).first()
            if not existing_notif:
                notif = models.Notification(
                    id=str(uuid.uuid4()),
                    user_id=user_id,
                    title=title,
                    message=message,
                    type=n_type,
                    is_read=is_read,
                    created_at=datetime.utcnow() - timedelta(days=days_ago)
                )
                db.add(notif)

        db.commit()

        # Update alumni impacts to ensure calculated totals are 100% accurate
        from routers.mentorship import update_alumni_impact
        for a_email in ["alumni@demo.edu", "vikram.malhotra@demo.edu", "amara.okafor@demo.edu", "david.vance@demo.edu"]:
            alumni_user = user_records.get(a_email)
            if alumni_user:
                update_alumni_impact(db, alumni_user.id)

        print("Synthetic database seeding completed successfully!")
        print(f"Total Users: {db.query(models.User).count()}")
        print(f"Total Students: {db.query(models.StudentProfile).count()}")
        print(f"Total Alumni: {db.query(models.AlumniProfile).count()}")
        print(f"Total Skills: {db.query(models.Skill).count()}")
        print(f"Total Mentorships: {db.query(models.Mentorship).count()}")
        print(f"Total Notifications: {db.query(models.Notification).count()}")

    except Exception as e:
        db.rollback()
        print(f"Error during database seeding: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
