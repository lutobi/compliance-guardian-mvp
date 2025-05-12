import * as dotenv from 'dotenv';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from './database.types';

// Load local environment variables in Node/CLI (.env.local then .env)
if (typeof window === 'undefined') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
  dotenv.config();
}

export type { Database };

// Unified Supabase client instance
export const supabase =
  typeof window === 'undefined'
    ? createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
    : createClientComponentClient<Database>();

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
