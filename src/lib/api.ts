import { supabase } from './supabase';
import { Database } from './database.types';
import { withCache, clearCache } from './api-wrapper';
import { cacheData } from './cache';

type Tables = Database['public']['Tables'];

export const api = {
  assessments: {
    list: async () => {
      return withCache(
        async () => {
          const { data, error } = await supabase
            .from('assessments')
            .select('*, frameworks(name)')
            .order('created_at', { ascending: false });
          if (error) throw error;
          return data;
        },
        { key: 'assessments_list' }
      );
    },
    
    get: async (id: string) => {
      return withCache(
        async () => {
          const { data, error } = await supabase
            .from('assessments')
            .select('*, frameworks(*)')
            .eq('id', id)
            .single();
          if (error) throw error;
          return data;
        },
        { key: `assessment_${id}` }
      );
    },
    
    create: async (assessment: Omit<Tables['assessments']['Insert'], 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('assessments')
        .insert(assessment)
        .select()
        .single();
      
      if (error) throw error;
      // Clear related caches
      clearCache('assessments_list');
      return data;

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
      const cached = cacheData.get<Tables['frameworks']['Row'][]>('frameworks_list');
      if (cached) return cached;

      const { data, error } = await supabase
        .from('frameworks')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    },
    
    get: async (id: string) => {
      const cached = cacheData.get<Tables['frameworks']['Row']>(`framework_${id}`);
      if (cached) return cached;

      const { data, error } = await supabase
        .from('frameworks')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    }
  },

  // Store responses in the controls table for now
  responses: {
    upsert: async (response: { assessment_id: string; control_id: string; response: string; status?: string }) => {
      const { data, error } = await supabase
        .from('controls')
        .update({
          status: response.status || 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', response.control_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    
    list: async (assessmentId: string) => {
      const { data, error } = await supabase
        .from('controls')
        .select('*')
        .eq('framework_id', assessmentId);

      if (error) throw error;
      return data;
    }
  }
};
