export type WorkMode = 'remote' | 'hybrid' | 'onsite';
export type ApplicationStage = 
  | 'Saved' 
  | 'Shortlisted' 
  | 'Applied' 
  | 'Assessment' 
  | 'Interview' 
  | 'Offer' 
  | 'Rejected' 
  | 'Withdrawn';

export interface UserPreference {
  target_roles: string[];
  preferred_locations: string[];
  remote_preference: WorkMode | 'any';
  min_salary: number;
  salary_currency: string;
  experience_level: string;
  skills: string[];
  preferred_companies: string[];
  employment_type: string;
  notice_period: string;
  search_frequency: 'manual' | 'daily' | 'weekly';
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
  preference: UserPreference;
}

export interface JobMatchDetails {
  overall_score: number;
  skills_score: number;
  experience_score: number;
  matched_skills: string[];
  missing_skills: string[];
  match_reasons: string[];
  concerns: string[];
  interview_topics: string[];
}

export interface JobItem {
  id: string;
  title: string;
  company: string;
  company_logo?: string;
  location: string;
  work_mode: WorkMode;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  experience_level: string;
  job_type: string;
  description: string;
  requirements: string[];
  nice_to_have: string[];
  skills: string[];
  source_code: string;
  source_url: string;
  posted_at: string;
  is_saved: boolean;
  is_dismissed: boolean;
  match?: JobMatchDetails;
}

export interface ApplicationEvent {
  id: string;
  from_stage?: string;
  to_stage: ApplicationStage;
  note?: string;
  created_at: string;
}

export interface ApplicationItem {
  id: string;
  user_id: string;
  job_id?: string;
  company: string;
  role_title: string;
  source_url?: string;
  stage: ApplicationStage;
  applied_at?: string;
  salary_offered?: string;
  recruiter_name?: string;
  recruiter_email?: string;
  interview_date?: string;
  follow_up_date?: string;
  notes?: string;
  cover_letter?: string;
  created_at: string;
  updated_at: string;
  events: ApplicationEvent[];
}

export interface AutomationItem {
  id: string;
  name: string;
  is_active: boolean;
  frequency: 'manual' | 'daily' | 'weekly';
  keywords: string[];
  locations: string[];
  min_match_score: number;
  enabled_sources: string[];
  email_notifications: boolean;
  max_jobs_per_run: number;
  last_run_at?: string;
  next_run_at?: string;
}

export interface AnalyticsOverview {
  total_jobs_discovered: number;
  new_jobs_today: number;
  strong_matches: number;
  applications_submitted: number;
  interviews_scheduled: number;
  responses_received: number;
  applications_needing_followup: number;
  pipeline: { stage: string; count: number }[];
  discovery_trends: { date: string; jobs_discovered: number; matches: number; applied: number }[];
  match_distribution: Record<string, number>;
  top_matched_skills: { skill: string; frequency: number }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  tool_calls?: {
    tool_name: string;
    parameters: any;
    result: any;
  }[];
  suggested_actions?: string[];
}
