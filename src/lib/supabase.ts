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

// Supabase URL and key
const supabaseUrl = 'https://nrfpsbbkynykubcaarpg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZnBzYmJreW55a3ViY2FhcnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwOTE3OTgsImV4cCI6MjA2MjY2Nzc5OH0.vRMYpGwZ7URyRkEUBERNeCkdcEX-BoTNAX5NDUkeU1E';

// Singleton instance
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

// Unified Supabase client instance
export const supabase = (() => {
  if (supabaseInstance) return supabaseInstance;
  
  if (typeof window === 'undefined') {
    // Server-side
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseKey);
  } else {
    // Client-side
    supabaseInstance = createClientComponentClient<Database>();
  }
  
  return supabaseInstance;
})();

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
