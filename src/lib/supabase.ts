import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

import type { Database } from './database.types'

export type { Database }

export const supabase = createClientComponentClient<Database>({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
})

// Legacy type definition - to be removed
export type LegacyDatabase = {
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
