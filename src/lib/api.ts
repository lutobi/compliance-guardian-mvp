import { Database } from './database.types';
import { withCache, clearCache } from './api-wrapper';
import { cacheData } from './cache';
import { supabase } from './supabase';

type Tables = Database['public']['Tables'];

export const api = {
  assessments: {
    /** List assessments filtered by optional workspaceId */
    list: async (workspaceId?: string) => {
      // Fetch assessments with full framework controls and subcontrols
      let query = supabase
        .from('assessments')
        .select('*, framework:framework_id(*,controls(*,subcontrols(*)))')
        .order('created_at', { ascending: false });
      if (workspaceId) query = query.eq('workspace_id', workspaceId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    
    get: async (id: string) => {
      return withCache(
        async () => {
          const { data, error } = await supabase
            .from('assessments')
            .select(`
              *,
              framework:framework_id(
                *,
                controls(*,subcontrols(*))
              )
            `)
            .eq('id', id)
            .single();
          if (error) throw error;
          return data;
        },
        { key: `assessment_full_${id}` }
      );
    },
    
    create: async (assessment: Omit<Tables['assessments']['Insert'], 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('assessments')
        .insert(assessment)
        .select()
        .single();
 
      if (error) throw error;
      // Assign all controls of the selected framework to this assessment
      const { data: ctrlRows, error: ctrlError } = await supabase
        .from('controls')
        .select('id')
        .eq('framework_id', data.framework_id as string);
      if (ctrlError) throw ctrlError;
      if (ctrlRows && ctrlRows.length > 0) {
        const acRows = ctrlRows.map(c => ({ assessment_id: data.id, control_id: c.id }));
        const { error: acError } = await supabase
          .from('assessment_controls')
          .insert(acRows);
        if (acError) throw acError;
      }
      clearCache();
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
      clearCache();
      return data;
    },
    
    delete: async (id: string) => {
      const { error } = await supabase
        .from('assessments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      clearCache();
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
    },
    
    getFull: async (id: string) => {
      const { data, error } = await supabase
        .from('frameworks')
        .select(`
          *,
          controls(*,subcontrols(*))
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    
    /** Fetch all frameworks with their controls & subcontrols */
    listFull: async () => {
      const { data, error } = await supabase
        .from('frameworks')
        .select(
          `
            id,
            controls(*,subcontrols(*))
          `
        );
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
