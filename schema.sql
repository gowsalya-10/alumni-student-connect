-- ============================================================================
-- Alumni Impact Hub — Shared Database Schema (PostgreSQL)
-- ============================================================================
-- This is the SINGLE SOURCE OF TRUTH for table names, columns, and relations.
-- All three teammates build their features against this schema.
-- If you need a field it doesn't have, add it here first and tell the team
-- before using it in your own code — never invent a parallel table.
--
-- Ownership (for merge conflicts / who edits what):
--   Person A (Student Core):     student_profiles, skills, student_skills,
--                                 career_goals, career_roadmaps, roadmap_phases,
--                                 roadmap_milestones, resumes, resume_versions
--   Person B (Alumni/Networking): alumni_profiles, connections, conversations,
--                                 conversation_participants, messages,
--                                 message_attachments, questions, answers
--   Person C (Mentorship/Admin):  mentorship_requests, mentorship_sessions,
--                                 opportunities, applications, ratings,
--                                 impact_activities, impact_scores,
--                                 reward_wallets, reward_transactions, rewards,
--                                 reward_redemptions, badges, alumni_badges,
--                                 notifications, admin_actions
-- users is shared/foundational — do not modify without telling the team.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- for gen_random_uuid()

-- ---------------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('student', 'alumni', 'admin');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected', 'more_info_requested');
CREATE TYPE connection_status AS ENUM ('pending', 'accepted', 'declined');
CREATE TYPE mentorship_status AS ENUM ('pending', 'accepted', 'declined');
CREATE TYPE session_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');
CREATE TYPE opportunity_type AS ENUM ('internship', 'job', 'research', 'project', 'freelance', 'competition', 'workshop', 'referral');
CREATE TYPE application_status AS ENUM ('applied', 'under_review', 'shortlisted', 'rejected', 'accepted');
CREATE TYPE redemption_status AS ENUM ('requested', 'approved', 'rejected', 'fulfilled');
CREATE TYPE communication_method AS ENUM ('chat', 'email', 'video_call', 'phone');

-- ---------------------------------------------------------------------------
-- CORE: USERS & AUTH  (foundational — shared)
-- ---------------------------------------------------------------------------
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    role            user_role NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- PERSON A: STUDENT CORE
-- ---------------------------------------------------------------------------
CREATE TABLE student_profiles (
    user_id                 UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    name                    VARCHAR(150) NOT NULL,
    photo_url               TEXT,
    department              VARCHAR(150),
    year                    INT,
    college                 VARCHAR(200),
    desired_career          VARCHAR(200),
    desired_domain          VARCHAR(200),
    preferred_industry      VARCHAR(200),
    preferred_job_role      VARCHAR(200),
    preferred_location      VARCHAR(200),
    mentorship_interests    TEXT[],
    career_goal_text        TEXT,
    preferred_communication communication_method DEFAULT 'chat',
    career_readiness_pct    INT DEFAULT 0 CHECK (career_readiness_pct BETWEEN 0 AND 100),
    onboarding_completed    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE skills (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) UNIQUE NOT NULL,
    category    VARCHAR(100)
);

CREATE TABLE student_skills (
    student_id      UUID REFERENCES student_profiles(user_id) ON DELETE CASCADE,
    skill_id        INT REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_pct INT NOT NULL DEFAULT 0 CHECK (proficiency_pct BETWEEN 0 AND 100),
    PRIMARY KEY (student_id, skill_id)
);

CREATE TABLE career_goals (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id  UUID REFERENCES student_profiles(user_id) ON DELETE CASCADE,
    goal_title  VARCHAR(200) NOT NULL,   -- e.g. "Full Stack Developer"
    target_role VARCHAR(200),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE career_roadmaps (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id      UUID REFERENCES student_profiles(user_id) ON DELETE CASCADE,
    career_goal_id  UUID REFERENCES career_goals(id) ON DELETE CASCADE,
    status          VARCHAR(50) DEFAULT 'active', -- active | archived
    generated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE roadmap_phases (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roadmap_id  UUID REFERENCES career_roadmaps(id) ON DELETE CASCADE,
    phase_name  VARCHAR(150) NOT NULL,  -- e.g. "Phase 2 — Frontend"
    order_index INT NOT NULL
);

CREATE TABLE roadmap_milestones (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phase_id            UUID REFERENCES roadmap_phases(id) ON DELETE CASCADE,
    skill_name          VARCHAR(150) NOT NULL,
    description         TEXT,
    difficulty          VARCHAR(50),    -- beginner | intermediate | advanced
    estimated_time      VARCHAR(100),   -- e.g. "2 weeks"
    resources           JSONB,          -- [{title, url}]
    project_suggestion  TEXT,
    is_completed        BOOLEAN NOT NULL DEFAULT FALSE,
    progress_pct        INT NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
    order_index         INT NOT NULL
);

CREATE TABLE resumes (
    student_id          UUID PRIMARY KEY REFERENCES student_profiles(user_id) ON DELETE CASCADE,
    primary_version_id  UUID -- FK added after resume_versions exists (see below)
);

CREATE TABLE resume_versions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id      UUID REFERENCES student_profiles(user_id) ON DELETE CASCADE,
    file_url        TEXT NOT NULL,
    version_name    VARCHAR(150) NOT NULL, -- e.g. "Resume_DataAnalyst.pdf"
    health_score    INT CHECK (health_score BETWEEN 0 AND 100),
    ai_suggestions  JSONB,
    is_primary      BOOLEAN NOT NULL DEFAULT FALSE,
    uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE resumes
    ADD CONSTRAINT fk_resumes_primary_version
    FOREIGN KEY (primary_version_id) REFERENCES resume_versions(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- PERSON B: ALUMNI / NETWORKING / MESSAGING / Q&A
-- ---------------------------------------------------------------------------
CREATE TABLE alumni_profiles (
    user_id                 UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    name                    VARCHAR(150) NOT NULL,
    photo_url               TEXT,
    company                 VARCHAR(200),
    job_title               VARCHAR(200),
    industry                VARCHAR(200),
    department              VARCHAR(150),
    graduation_year         INT,
    experience_years        NUMERIC(4,1),
    location                VARCHAR(200),
    bio                     TEXT,
    is_mentor_available     BOOLEAN NOT NULL DEFAULT TRUE,
    verification_status     verification_status NOT NULL DEFAULT 'pending',
    verification_documents  JSONB, -- [{name, url}]
    career_journey          JSONB, -- [{year, title, description, skills_gained}]
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE alumni_skills (
    alumni_id       UUID REFERENCES alumni_profiles(user_id) ON DELETE CASCADE,
    skill_id        INT REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (alumni_id, skill_id)
);

CREATE TABLE connections (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id    UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient_id    UUID REFERENCES users(id) ON DELETE CASCADE,
    status          connection_status NOT NULL DEFAULT 'pending',
    message         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    responded_at    TIMESTAMPTZ,
    UNIQUE (requester_id, recipient_id)
);

CREATE TABLE conversations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE conversation_participants (
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id       UUID REFERENCES users(id) ON DELETE CASCADE,
    content         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    read_at         TIMESTAMPTZ
);

CREATE TABLE message_attachments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id  UUID REFERENCES messages(id) ON DELETE CASCADE,
    file_url    TEXT NOT NULL,
    file_name   VARCHAR(255),
    file_type   VARCHAR(100)
);

CREATE TABLE questions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id  UUID REFERENCES student_profiles(user_id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    body        TEXT,
    domain_tags TEXT[],
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE answers (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    alumni_id   UUID REFERENCES alumni_profiles(user_id) ON DELETE CASCADE,
    body        TEXT NOT NULL,
    upvotes     INT NOT NULL DEFAULT 0,
    is_helpful  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- PERSON C: MENTORSHIP / OPPORTUNITIES / IMPACT / REWARDS / ADMIN
-- ---------------------------------------------------------------------------
CREATE TABLE mentorship_requests (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id              UUID REFERENCES student_profiles(user_id) ON DELETE CASCADE,
    alumni_id               UUID REFERENCES alumni_profiles(user_id) ON DELETE CASCADE,
    reason                  TEXT,
    help_needed             TEXT,
    preferred_date          DATE,
    preferred_time          TIME,
    preferred_method        communication_method,
    topic                   VARCHAR(200),
    status                  mentorship_status NOT NULL DEFAULT 'pending',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    responded_at            TIMESTAMPTZ
);

CREATE TABLE mentorship_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id      UUID REFERENCES mentorship_requests(id) ON DELETE CASCADE,
    student_id      UUID REFERENCES student_profiles(user_id) ON DELETE CASCADE,
    alumni_id       UUID REFERENCES alumni_profiles(user_id) ON DELETE CASCADE,
    topic           VARCHAR(200),
    scheduled_at    TIMESTAMPTZ,
    status          session_status NOT NULL DEFAULT 'scheduled',
    meeting_link    TEXT,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE opportunities (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alumni_id           UUID REFERENCES alumni_profiles(user_id) ON DELETE CASCADE,
    title               VARCHAR(255) NOT NULL,
    company             VARCHAR(200),
    role                VARCHAR(200),
    description         TEXT,
    required_skills     TEXT[],
    experience_required VARCHAR(100),
    location            VARCHAR(200),
    opportunity_type    opportunity_type NOT NULL,
    application_deadline DATE,
    application_link    TEXT,
    is_approved         BOOLEAN NOT NULL DEFAULT FALSE, -- admin moderation
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE applications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id  UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    student_id      UUID REFERENCES student_profiles(user_id) ON DELETE CASCADE,
    status          application_status NOT NULL DEFAULT 'applied',
    match_pct       INT CHECK (match_pct BETWEEN 0 AND 100),
    applied_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (opportunity_id, student_id)
);

CREATE TABLE ratings (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id          UUID REFERENCES mentorship_sessions(id) ON DELETE CASCADE,
    rater_id            UUID REFERENCES users(id) ON DELETE CASCADE,
    ratee_id            UUID REFERENCES users(id) ON DELETE CASCADE,
    communication       INT CHECK (communication BETWEEN 1 AND 5),
    guidance            INT CHECK (guidance BETWEEN 1 AND 5),
    knowledge           INT CHECK (knowledge BETWEEN 1 AND 5),
    helpfulness         INT CHECK (helpfulness BETWEEN 1 AND 5),
    career_relevance    INT CHECK (career_relevance BETWEEN 1 AND 5),
    overall             NUMERIC(2,1),
    feedback_text       TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE impact_activities (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alumni_id   UUID REFERENCES alumni_profiles(user_id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL, -- mentorship_session | resume_review | referral | workshop | helpful_answer ...
    points      INT NOT NULL,
    related_id  UUID, -- points to the session/opportunity/answer etc.
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE impact_scores (
    alumni_id           UUID PRIMARY KEY REFERENCES alumni_profiles(user_id) ON DELETE CASCADE,
    total_score         INT NOT NULL DEFAULT 0,
    students_helped     INT NOT NULL DEFAULT 0,
    mentorship_hours    NUMERIC(6,1) NOT NULL DEFAULT 0,
    opportunities_shared INT NOT NULL DEFAULT 0,
    avg_rating          NUMERIC(2,1),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE reward_wallets (
    alumni_id       UUID PRIMARY KEY REFERENCES alumni_profiles(user_id) ON DELETE CASCADE,
    points_balance  INT NOT NULL DEFAULT 0,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE reward_transactions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alumni_id   UUID REFERENCES alumni_profiles(user_id) ON DELETE CASCADE,
    points_delta INT NOT NULL, -- positive = earn, negative = redeem
    reason      VARCHAR(255) NOT NULL,
    related_id  UUID,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE rewards (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    points_cost     INT NOT NULL,
    reward_type     VARCHAR(100), -- voucher | partner_reward | other (admin-configurable, never "cash")
    inventory_count INT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE reward_redemptions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alumni_id       UUID REFERENCES alumni_profiles(user_id) ON DELETE CASCADE,
    reward_id       UUID REFERENCES rewards(id) ON DELETE CASCADE,
    points_spent    INT NOT NULL,
    status          redemption_status NOT NULL DEFAULT 'requested',
    requested_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    approved_at     TIMESTAMPTZ
);

CREATE TABLE badges (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,  -- "Career Mentor", "Top Contributor"...
    icon        VARCHAR(20),            -- emoji
    description TEXT
);

CREATE TABLE alumni_badges (
    alumni_id   UUID REFERENCES alumni_profiles(user_id) ON DELETE CASCADE,
    badge_id    INT REFERENCES badges(id) ON DELETE CASCADE,
    earned_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (alumni_id, badge_id)
);

CREATE TABLE notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    type        VARCHAR(100) NOT NULL, -- connection_request | mentorship_accepted | reward_earned ...
    title       VARCHAR(255) NOT NULL,
    body        TEXT,
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    related_id  UUID,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE admin_actions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id    UUID REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL, -- verify_alumni | reject_opportunity | configure_reward ...
    target_type VARCHAR(100),
    target_id   UUID,
    notes       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- INDEXES (add more as query patterns emerge — don't over-index up front)
-- ---------------------------------------------------------------------------
CREATE INDEX idx_connections_recipient ON connections(recipient_id, status);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX idx_opportunities_approved ON opportunities(is_approved, opportunity_type);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX idx_mentorship_requests_alumni ON mentorship_requests(alumni_id, status);
CREATE INDEX idx_applications_student ON applications(student_id);
