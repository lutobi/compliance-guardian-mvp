export default interface Database {
  public: {
    Tables: {
      frameworks: {
        Row: {
          id: string
          name: string
          version: string
          created_at: string
          updated_at?: string
          user_id?: string
        }
        Insert: {
          id?: string
          name: string
          version: string
          created_at?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          id?: string
          name?: string
          version?: string
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      controls: {
        Row: {
          id: string
          framework_id: string
          control_id: string
          title: string
          description: string
          status: string
          implementation_status: string
          created_at: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          id?: string
          framework_id: string
          control_id: string
          title: string
          description: string
          status?: string
          implementation_status?: string
          created_at?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          framework_id?: string
          control_id?: string
          title?: string
          description?: string
          status?: string
          implementation_status?: string
          created_at?: string
          updated_at?: string
          user_id?: string | null
        }
      }
      assessments: {
        Row: {
          id: string
          name: string
          framework_id: string
          status: string
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          framework_id: string
          status?: string
          created_at?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          id?: string
          name?: string
          framework_id?: string
          status?: string
          created_at?: string
          updated_at?: string
          user_id?: string
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
      frameworks: {
        Row: {
          id: string
          name: string
          version: string
          created_at: string
          updated_at?: string
          user_id?: string
        }
        Insert: {
          id?: string
          name: string
          version: string
          created_at?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          id?: string
          name?: string
          version?: string
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      controls: {
        Row: {
          id: string
          framework_id: string
          control_id: string
          title: string
          description: string
          status: string
          implementation_status: string
          created_at: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          id?: string
          framework_id: string
          control_id: string
          title: string
          description: string
          status?: string
          implementation_status?: string
          created_at?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          framework_id?: string
          control_id?: string
          title?: string
          description?: string
          status?: string
          implementation_status?: string
          created_at?: string
          updated_at?: string
          user_id?: string | null
        }
      }
      assessments: {
        Row: {
          id: string
          name: string
          framework_id: string
          status: string
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          framework_id: string
          status?: string
          created_at?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          id?: string
          name?: string
          framework_id?: string
          status?: string
          created_at?: string
          updated_at?: string
          user_id?: string
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