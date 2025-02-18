export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      assessments: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          description: string | null
          status: 'draft' | 'in_progress' | 'completed'
          due_date: string | null
          user_id: string
          framework_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          description?: string | null
          status?: 'draft' | 'in_progress' | 'completed'
          due_date?: string | null
          user_id: string
          framework_id: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          description?: string | null
          status?: 'draft' | 'in_progress' | 'completed'
          due_date?: string | null
          user_id?: string
          framework_id?: string
        }
      }
      frameworks: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string | null
          version: string
          controls: Json[]
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string | null
          version: string
          controls: Json[]
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
          version?: string
          controls?: Json[]
        }
      }
      assessment_responses: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          assessment_id: string
          control_id: string
          status: 'not_started' | 'in_progress' | 'implemented' | 'not_applicable'
          evidence: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          assessment_id: string
          control_id: string
          status?: 'not_started' | 'in_progress' | 'implemented' | 'not_applicable'
          evidence?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          assessment_id?: string
          control_id?: string
          status?: 'not_started' | 'in_progress' | 'implemented' | 'not_applicable'
          evidence?: string | null
          notes?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
