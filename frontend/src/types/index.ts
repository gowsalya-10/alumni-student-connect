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

export interface RoadmapMilestone {
  id: string;
  skill_name: string;
  description: string;
  difficulty: string;
  estimated_time: string;
  is_completed: boolean;
}

export interface RoadmapPhase {
  id: string;
  phase_name: string;
  milestones: RoadmapMilestone[];
}

export interface CareerRoadmap {
  id: string;
  status: string;
  phases: RoadmapPhase[];
  career_goal: string;
  recommended_domain: string;
  estimated_focus: string;
  explanation: string;
}

export interface AlumniProfile {
  user_id: string;
  name: string;
  photo_url: string | null;
  current_role: string | null;
  company: string | null;
  domain: string | null;
  industry: string | null;
  location: string | null;
  skills: string[];
  mentorship_interests: string[];
  experience: string | null;
  education: string | null;
  bio: string | null;
  is_verified: boolean;
}

export interface MentorshipRequest {
  id: string;
  student_id: string;
  alumni_id: string;
  student_name: string;
  student_department: string | null;
  student_year: number | null;
  student_goal: string | null;
  alumni_name: string;
  alumni_role: string | null;
  alumni_company: string | null;
  message: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled' | 'completed';
  requested_at: string;
}

export interface MentorshipInteraction {
  id: string;
  interaction_type: string;
  duration_minutes: number;
  notes: string;
  created_at: string;
}

