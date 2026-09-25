export type Role = 'student' | 'alumni' | 'admin';

export interface User {
  id: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  role: Role;
}

export interface StudentProfile {
  user_id: string;
  name: string;
  photo_url: string | null;
  department: string | null;
  year: number | null;
  college: string | null;
  desired_career: string | null;
  desired_domain: string | null;
  preferred_industry: string | null;
  preferred_job_role: string | null;
  preferred_location: string | null;
  mentorship_interests: string[];
  career_goal_text: string | null;
  preferred_communication: string;
  career_readiness_pct: number;
  onboarding_completed: boolean;
}
