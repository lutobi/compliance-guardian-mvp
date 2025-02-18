import { supabase } from './supabase';
import { Database } from './database.types';

type Tables = Database['public']['Tables'];

export const api = {
  assessments: {
    list: async () => {
      const { data, error } = await supabase
        .from('assessments')
        .select('*, frameworks(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    
    get: async (id: string) => {
      const { data, error } = await supabase
        .from('assessments')
        .select('*, frameworks(*, assessment_responses(*))')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    
    create: async (assessment: Omit<Tables['assessments']['Insert'], 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('assessments')
        .insert(assessment)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    
    update: async (id: string, assessment: Partial<Tables['assessments']['Update']>) => {
      const { data, error } = await supabase
        .from('assessments')
        .update({ ...assessment, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    
    delete: async (id: string) => {
      const { error } = await supabase
        .from('assessments')
        .delete()
        .eq('id', id);

      if (error) throw error;
    }
  },

  frameworks: {
    list: async () => {
      const { data, error } = await supabase
        .from('frameworks')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    },
    
    get: async (id: string) => {
      const { data, error } = await supabase
        .from('frameworks')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    }
  },

  responses: {
    upsert: async (response: Omit<Tables['assessment_responses']['Insert'], 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('assessment_responses')
        .upsert(
          { 
            ...response,
            updated_at: new Date().toISOString()
          },
          { 
            onConflict: 'assessment_id,control_id',
            ignoreDuplicates: false
          }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    
    list: async (assessmentId: string) => {
      const { data, error } = await supabase
        .from('assessment_responses')
        .select('*')
        .eq('assessment_id', assessmentId);

      if (error) throw error;
      return data;
    }
  }
};
