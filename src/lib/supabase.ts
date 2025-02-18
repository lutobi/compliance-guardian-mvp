import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nrfpsbbkynykubcaarpg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZnBzYmJreW55a3ViY2FhcnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIyMzA0MjMsImV4cCI6MjA0NzgwNjQyM30.OkcS6Q-4fGKwpAoYfG3UTjK4UDQEisXTT-YSq1Ny_kE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      frameworks: {
        Row: {
          id: string
          name: string
          version: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          version: string
          created_at?: string
        }
      }
      controls: {
        Row: {
          id: string
          framework_id: string
          control_id: string
          title: string
          description: string
        }
        Insert: {
          id?: string
          framework_id: string
          control_id: string
          title: string
          description: string
        }
      }
      assessments: {
        Row: {
          id: string
          user_id: string
          framework_id: string
          name: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          framework_id: string
          name: string
          status: string
          created_at?: string
        }
      }
      responses: {
        Row: {
          id: string
          assessment_id: string
          control_id: string
          status: string
          notes: string
          created_at: string
        }
        Insert: {
          id?: string
          assessment_id: string
          control_id: string
          status: string
          notes: string
          created_at?: string
        }
      }
    }
  }
}
