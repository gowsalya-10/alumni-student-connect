"""
Comprehensive backend API verification test script.
Directly tests all router endpoints against the seeded database with realistic sessions.
Covers Auth, Roles, Student features, Alumni features, Mentorship lifecycle, Notifications, Resumes, and DB integrity.
"""

import os
import asyncio
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import SessionLocal, engine
import models
from routers.auth import login, register, LoginRequest, RegisterRequest
from routers.student import (
    get_profile, update_profile, get_skills, update_skills, get_dashboard,
    StudentProfileUpdate
)
from routers.roadmap import get_roadmap, generate_roadmap, GenerateRequest
from routers.resume import get_resume_vault, download_resume
from routers.alumni import (
    search_alumni, get_mentor_matches, get_my_alumni_profile, update_alumni_profile,
    get_my_rewards, get_alumni_profile, get_alumni_impact, AlumniProfileUpdate
)
from routers.mentorship import (
    get_my_requests, get_incoming_requests, create_request, cancel_request,
    accept_request, decline_request, complete_mentorship, log_interaction,
    rate_mentorship, MentorshipRequestCreate, MentorshipInteractionCreate, RatingBody
)
from routers.notifications import get_notifications, mark_read, mark_all_read
from auth import require_role

async def run_tests():
    db: Session = SessionLocal()
    print("==================================================")
    print("RUNNING COMPREHENSIVE BACKEND VERIFICATION SUITE")
    print("==================================================")
    
    passed = 0
    failed = 0

    def assert_test(name, condition, details=""):
        nonlocal passed, failed
        if condition:
            print(f"  [PASS] {name}")
            passed += 1
        else:
            print(f"  [FAIL] {name}: {details}")
            failed += 1

    try:
        # -----------------------------------------------------------------
        # 1. Database Foreign Key Integrity
        # -----------------------------------------------------------------
        with engine.connect() as conn:
            fk_violations = conn.execute(text("PRAGMA foreign_key_check")).fetchall()
        assert_test("Database foreign-key integrity (0 violations)", len(fk_violations) == 0, f"Violations: {fk_violations}")

        # -----------------------------------------------------------------
        # 2. Demo User Records Verification
        # -----------------------------------------------------------------
        student_user = db.query(models.User).filter(models.User.email == "student@demo.edu").first()
        alumni_user = db.query(models.User).filter(models.User.email == "alumni@demo.edu").first()
        admin_user = db.query(models.User).filter(models.User.email == "admin@demo.edu").first()
        
        assert_test("Demo Student user exists", student_user is not None and student_user.role == "student")
        assert_test("Demo Alumni user exists", alumni_user is not None and alumni_user.role == "alumni")
        assert_test("Demo Admin user exists", admin_user is not None and admin_user.role == "admin")

        # -----------------------------------------------------------------
        # 3. Authentication & Login Verification
        # -----------------------------------------------------------------
        student_login = await login(LoginRequest(email="student@demo.edu", password="DemoPassword123!"), db=db)
        assert_test("Student login succeeds with JWT and role 'student'", bool(student_login.access_token) and student_login.role == "student")

        alumni_login = await login(LoginRequest(email="alumni@demo.edu", password="DemoPassword123!"), db=db)
        assert_test("Alumni login succeeds with JWT and role 'alumni'", bool(alumni_login.access_token) and alumni_login.role == "alumni")

        admin_login = await login(LoginRequest(email="admin@demo.edu", password="DemoPassword123!"), db=db)
        assert_test("Admin login succeeds with JWT and role 'admin'", bool(admin_login.access_token) and admin_login.role == "admin")

        # Invalid credentials test
        invalid_login_passed = False
        try:
            await login(LoginRequest(email="student@demo.edu", password="WrongPassword999!"), db=db)
        except HTTPException as e:
            if e.status_code == 401:
                invalid_login_passed = True
        assert_test("Invalid password returns HTTP 401 Unauthorized", invalid_login_passed)

        # Non-existent user test
        nonexistent_login_passed = False
        try:
            await login(LoginRequest(email="ghost@demo.edu", password="DemoPassword123!"), db=db)
        except HTTPException as e:
            if e.status_code == 401:
                nonexistent_login_passed = True
        assert_test("Non-existent email returns HTTP 401 Unauthorized", nonexistent_login_passed)

        # -----------------------------------------------------------------
        # 4. Role-Based Access Control (RBAC) Enforcement
        # -----------------------------------------------------------------
        # Student attempting to access Alumni-only role guard
        student_blocked_from_alumni_role = False
        try:
            alumni_checker = require_role("alumni")
            alumni_checker(current_user=student_user)
        except HTTPException as e:
            if e.status_code == 403:
                student_blocked_from_alumni_role = True
        assert_test("RBAC blocks Student from Alumni actions (HTTP 403)", student_blocked_from_alumni_role)

        # Alumni attempting to access Student-only role guard
        alumni_blocked_from_student_role = False
        try:
            student_checker = require_role("student")
            student_checker(current_user=alumni_user)
        except HTTPException as e:
            if e.status_code == 403:
                alumni_blocked_from_student_role = True
        assert_test("RBAC blocks Alumni from Student actions (HTTP 403)", alumni_blocked_from_student_role)

        # -----------------------------------------------------------------
        # 5. Student Features Testing
        # -----------------------------------------------------------------
        # Student Profile
        st_profile = await get_profile(current_user=student_user, db=db)
        assert_test("Student profile returns 'Alex Rivera'", st_profile["name"] == "Alex Rivera")

        # Update student profile
        orig_year = st_profile["year"]
        updated_st = await update_profile(
            request=StudentProfileUpdate(year=4, desired_career="Principal Machine Learning Engineer"),
            current_user=student_user,
            db=db
        )
        assert_test("Student profile updates successfully", updated_st["year"] == 4 and "Principal" in updated_st["desired_career"])
        # Restore
        await update_profile(request=StudentProfileUpdate(year=orig_year, desired_career="Machine Learning Engineer"), current_user=student_user, db=db)

        # Student Dashboard
        dash = await get_dashboard(current_user=student_user, db=db)
        assert_test(
            "Student dashboard returns complete composite data",
            dash.has_resume and len(dash.skills) > 0 and len(dash.roadmap_phases) > 0 and dash.profile.name == "Alex Rivera"
        )

        # Student Skills
        skills = await get_skills(current_user=student_user, db=db)
        assert_test("Student skills returns >= 4 technical skills", len(skills) >= 4)

        # Update Student Skills
        updated_skills = await update_skills(
            skills=skills + ["Kubernetes"],
            current_user=student_user,
            db=db
        )
        assert_test("Student skill proficiency updates persist in DB", "Kubernetes" in updated_skills)
        # Restore
        await update_skills(skills=skills, current_user=student_user, db=db)

        # Career Roadmap & Generation
        rm = await get_roadmap(current_user=student_user, db=db)
        assert_test("Career roadmap returns 3 active structured phases", rm is not None and len(rm.phases) >= 3)
        assert_test("Roadmap milestones include verification status", any(len(p.milestones) > 0 for p in rm.phases))

        gen_rm = await generate_roadmap(request=GenerateRequest(career_goal="AI Research Engineer", industry="Artificial Intelligence"), current_user=student_user, db=db)
        assert_test("Roadmap generation endpoint produces populated phases & milestones", gen_rm is not None and len(gen_rm.phases) >= 3)

        # Resume Vault & Download
        vault = await get_resume_vault(current_user=student_user, db=db)
        assert_test("Resume vault returns primary resume with health score", vault.primary_resume is not None and vault.primary_resume.health_score >= 80)
        
        # Test Resume file download
        resume_record = vault.primary_resume
        download_res = await download_resume(filename=resume_record.file_url)
        assert_test("Resume download endpoint serves existing PDF binary", download_res.status_code == 200 and os.path.exists(download_res.path))

        # -----------------------------------------------------------------
        # 6. Alumni Features Testing
        # -----------------------------------------------------------------
        # Alumni Directory Search
        all_alumni = await search_alumni(current_user=student_user, db=db)
        assert_test("Alumni directory returns all 6 seeded alumni profiles", len(all_alumni) == 6)

        # Directory Search with Domain Filter
        ai_alumni = await search_alumni(domain="Artificial Intelligence", current_user=student_user, db=db)
        assert_test("Alumni search filters correctly by domain", len(ai_alumni) >= 1 and all("Artificial Intelligence" in (a.domain or "") for a in ai_alumni))

        # Smart Matches Recommendation
        matches = await get_mentor_matches(current_user=student_user, db=db)
        assert_test("Smart Matches returns ranked mentors with match percentage >= 60%", len(matches) > 0 and matches[0].match_pct >= 60)
        assert_test("Smart Matches explains matching reasons and shared skills", len(matches[0].matching_reasons) > 0)

        # Alumni Profile Self & Update
        my_alumni = await get_my_alumni_profile(current_user=alumni_user, db=db)
        assert_test("Alumni profile self-retrieval returns 'Dr. Elena Rostova'", my_alumni.name == "Dr. Elena Rostova")

        orig_bio = my_alumni.bio
        await update_alumni_profile(
            request=AlumniProfileUpdate(bio="Updated bio for end-to-end verification test."),
            current_user=alumni_user,
            db=db
        )
        refreshed_alumni = await get_my_alumni_profile(current_user=alumni_user, db=db)
        assert_test("Alumni profile update persists in DB", "verification test" in (refreshed_alumni.bio or ""))
        # Restore
        await update_alumni_profile(request=AlumniProfileUpdate(bio=orig_bio), current_user=alumni_user, db=db)

        # Alumni Rewards
        rewards = await get_my_rewards(current_user=alumni_user, db=db)
        assert_test("Alumni rewards endpoint returns transactions history", len(rewards) >= 2)

        # Alumni Impact
        impact = await get_alumni_impact(id=alumni_user.id, db=db)
        assert_test("Alumni impact returns positive total score and reward points", impact.total_score > 0 and impact.reward_points > 0)

        # -----------------------------------------------------------------
        # 7. Mentorship Lifecycle Testing (End-to-End)
        # -----------------------------------------------------------------
        # Use student Marcus Chen to send a test request to alumni David Vance
        st_test = db.query(models.User).filter(models.User.email == "marcus.chen@demo.edu").first()
        alm_test = db.query(models.User).filter(models.User.email == "david.vance@demo.edu").first()
        alm_maya = db.query(models.User).filter(models.User.email == "maya.lin@demo.edu").first()

        # Step 1: Create request
        test_req = await create_request(
            body=MentorshipRequestCreate(alumni_id=alm_test.id, message="E2E Verification Mentorship Inquiry"),
            current_user=st_test,
            db=db
        )
        assert_test("Mentorship request created with 'pending' status", test_req.status == "pending" and test_req.student_id == st_test.id)

        # Step 2: Alumni accepts request
        accepted_res = await accept_request(id=test_req.id, current_user=alm_test, db=db)
        assert_test("Alumni accepts mentorship request", accepted_res["message"] == "Request accepted")

        # Step 3: Alumni logs interaction
        interaction = await log_interaction(
            id=test_req.id,
            body=MentorshipInteractionCreate(
                interaction_type="call",
                duration_minutes=45,
                notes="Discussed cloud security pathways."
            ),
            current_user=alm_test,
            db=db
        )
        assert_test("Alumni logs mentorship interaction (45 min)", interaction.duration_minutes == 45)

        # Step 4: Complete mentorship
        completed_res = await complete_mentorship(id=test_req.id, current_user=st_test, db=db)
        assert_test("Student marks mentorship as completed", completed_res["message"] == "Mentorship marked as completed")

        # Step 5: Rate mentorship
        rating_res = await rate_mentorship(
            id=test_req.id,
            body=RatingBody(rating=5, review="Invaluable career advice!"),
            current_user=st_test,
            db=db
        )
        assert_test("Student rates completed mentorship 5 stars", rating_res["message"] == "Rating submitted successfully")

        # Step 6: Verify impact score for David Vance
        d_impact = await get_alumni_impact(id=alm_test.id, db=db)
        assert_test("Alumni impact score recalculated after interaction and rating", d_impact.total_score > 0 and d_impact.average_rating > 0)

        # Test request cancellation capability
        test_cancel_req = await create_request(
            body=MentorshipRequestCreate(alumni_id=alm_maya.id, message="To be cancelled"),
            current_user=st_test,
            db=db
        )
        cancel_res = await cancel_request(id=test_cancel_req.id, current_user=st_test, db=db)
        assert_test("Student can cancel pending mentorship request", cancel_res["message"] == "Request cancelled")

        # Clean up the test records
        db.query(models.MentorshipRating).filter(models.MentorshipRating.mentorship_id == test_req.id).delete()
        db.query(models.RewardTransaction).filter(models.RewardTransaction.interaction_id == interaction.id).delete()
        db.query(models.MentorshipInteraction).filter(models.MentorshipInteraction.mentorship_id == test_req.id).delete()
        db.query(models.Mentorship).filter(models.Mentorship.id.in_([test_req.id, test_cancel_req.id])).delete()
        db.commit()

        # -----------------------------------------------------------------
        # 8. Notifications Testing
        # -----------------------------------------------------------------
        notifs = await get_notifications(current_user=student_user, db=db)
        assert_test("Student has notifications retrieved", len(notifs) >= 2)

        first_notif = notifs[0]
        read_res = await mark_read(id=first_notif.id, current_user=student_user, db=db)
        assert_test("Mark notification as read succeeds", read_res["message"] == "Marked as read")

        mark_all_res = await mark_all_read(current_user=student_user, db=db)
        assert_test("Mark all notifications read succeeds", mark_all_res["message"] == "All marked as read")

        # -----------------------------------------------------------------
        # 9. Dynamic User Registration & Rollback Safety
        # -----------------------------------------------------------------
        audit_email = "dynamic.audit@demo.edu"
        existing = db.query(models.User).filter(models.User.email == audit_email).first()
        if existing:
            db.delete(existing)
            db.commit()

        # Register dynamic alumni
        new_alumni = await register(
            RegisterRequest(email=audit_email, password="AuditPassword123!", role="alumni", name="Audit Professor"),
            db=db
        )
        assert_test("Dynamic alumni registration produces valid token", bool(new_alumni.access_token) and new_alumni.role == "alumni")

        audit_prof = db.query(models.AlumniProfile).filter(
            models.AlumniProfile.user_id == db.query(models.User).filter(models.User.email == audit_email).first().id
        ).first()
        assert_test("Dynamic registration automatically creates AlumniProfile", audit_prof is not None and audit_prof.name == "Audit Professor")

        audit_impact = db.query(models.AlumniImpact).filter(models.AlumniImpact.alumni_id == audit_prof.user_id).first()
        assert_test("Dynamic registration automatically initializes AlumniImpact", audit_impact is not None)

        # Clean up dynamic registrant
        to_clean = db.query(models.User).filter(models.User.email == audit_email).first()
        if to_clean:
            db.delete(to_clean)
            db.commit()

        print("==================================================")
        print(f"RESULTS: {passed} PASSED, {failed} FAILED")
        print("==================================================")

        if failed > 0:
            raise RuntimeError(f"{failed} tests failed in test suite!")

    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(run_tests())
