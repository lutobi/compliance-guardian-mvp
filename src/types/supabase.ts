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
      monitoring_points: {
        Row: {
          id: string
          name: string
          description: string
          status: string
          risk_level: string
          created_at: string
          updated_at: string
          location: string
          supplier_id: string
          product_id: string
          compliance_check_id: string
          verification_status: string
          last_verified_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          status: string
          risk_level: string
          created_at?: string
          updated_at?: string
          location: string
          supplier_id: string
          product_id: string
          compliance_check_id: string
          verification_status?: string
          last_verified_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          status?: string
          risk_level?: string
          created_at?: string
          updated_at?: string
          location?: string
          supplier_id?: string
          product_id?: string
          compliance_check_id?: string
          verification_status?: string
          last_verified_at?: string
        }
      }
      risk_assessments: {
        Row: {
          id: string
          monitoring_point_id: string
          risk_level: string
          risk_factors: string[]
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          monitoring_point_id: string
          risk_level: string
          risk_factors: string[]
          notes: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          monitoring_point_id?: string
          risk_level?: string
          risk_factors?: string[]
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      verifications: {
        Row: {
          id: string
          monitoring_point_id: string
          status: string
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          monitoring_point_id: string
          status: string
          notes: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          monitoring_point_id?: string
          status?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
