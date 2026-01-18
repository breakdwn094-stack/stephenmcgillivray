import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface CandidateProfile {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  email: string;
  title: string;
  target_titles: string[];
  target_company_stages: string[];
  elevator_pitch: string;
  career_narrative: string;
  looking_for: string;
  not_looking_for: string;
  management_style: string;
  work_style: string;
  salary_min: number;
  salary_max: number;
  availability_status: string;
  availability_date: string | null;
  location: string;
  remote_preference: string;
  github_url: string;
  linkedin_url: string;
  twitter_url: string | null;
}

export interface Experience {
  id: string;
  candidate_id: string;
  created_at: string;
  company_name: string;
  title: string;
  title_progression: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  bullet_points: string[];
  why_joined: string;
  why_left: string;
  actual_contributions: string;
  proudest_achievement: string;
  would_do_differently: string;
  challenges_faced: string;
  lessons_learned: string;
  manager_would_say: string;
  reports_would_say: string;
  quantified_impact: any;
  display_order: number;
}

export interface Skill {
  id: string;
  candidate_id: string;
  created_at: string;
  skill_name: string;
  category: 'strong' | 'moderate' | 'gap';
  self_rating: number | null;
  evidence: string;
  honest_notes: string;
  years_experience: number | null;
  last_used: string | null;
  display_order: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  session_id: string;
  created_at: string;
}
