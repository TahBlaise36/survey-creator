import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Survey {
  id: string
  user_id: string
  title: string
  description?: string
  questions: Question[]
  settings: any
  is_published: boolean
  share_token?: string
  allow_anonymous_responses: boolean
  require_email: boolean
  max_responses?: number
  expires_at?: string
  created_at: string
  updated_at: string
}

export interface Question {
  id: string
  type: "multiple-choice" | "text" | "rating" | "yes-no"
  question: string
  options?: string[]
  required: boolean
}

export interface SurveyResponse {
  id: string
  survey_id: string
  respondent_email?: string
  responses: { [key: string]: any }
  submitted_at: string
  ip_address?: string
  user_agent?: string
}

export interface SurveyAnalytics {
  id: string
  title: string
  user_id: string
  created_at: string
  is_published: boolean
  total_responses: number
  responses_last_7_days: number
  responses_last_30_days: number
  first_response_at?: string
  last_response_at?: string
}
