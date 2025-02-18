import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
