export type Database = {
  public: {
    Tables: {
      frameworks: {
        Row: {
          id: string
          name: string
          version: string
          description?: string
          slug?: string
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          name: string
          version: string
          description?: string
          slug?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          version?: string
          description?: string
          slug?: string
          updated_at?: string
        }
      }
      controls: {
        Row: {
          id: string
          framework_id: string
          control_id: string
          title: string
          description: string
          status?: string
          implementation_status?: string
          created_at?: string
          updated_at?: string
          user_id?: string | null
          ref?: string | null
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
          ref?: string | null
        }
        Update: {
          id?: string
          framework_id?: string
          control_id?: string
          title?: string
          description?: string
          status?: string
          implementation_status?: string
          updated_at?: string
          user_id?: string | null
          ref?: string | null
        }
      }
      evidence: {
        Row: {
          id: string
          framework_id: string
          subcontrol_id: string
          notes: string
          files?: any[] | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
          assessment_id?: string | null
        }
        Insert: {
          id?: string
          framework_id: string
          subcontrol_id: string
          notes: string
          files?: any[] | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
          assessment_id?: string | null
        }
        Update: {
          id?: string
          framework_id?: string
          subcontrol_id?: string
          notes?: string
          files?: any[] | null
          tags?: string[] | null
          updated_at?: string
          assessment_id?: string | null
        }
      }
      monitoring: {
        Row: {
          id: string
          name: string
          description?: string
          status: string
          settings?: any
          created_at?: string
          updated_at?: string
          user_id?: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          status: string
          settings?: any
          created_at?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          status?: string
          settings?: any
          updated_at?: string
          user_id?: string
        }
      }
    }
  }
}