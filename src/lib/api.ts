import { Database } from './database.types';
import { withCache, clearCache } from './api-wrapper';
import { cacheData } from './cache';
import { supabase } from './supabase/client';

type Tables = Database['public']['Tables'];

export const api = {
  subcontrols: {
    create: async (data: { control_id: string; title: string; description?: string }) => {
      const { data: subcontrol, error } = await supabase
        .from('subcontrols')
        .insert([
          {
            control_id: data.control_id,
            title: data.title,
            description: data.description,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return subcontrol;
    },
  },

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

    /** List all assessments for the current user without workspace filtering */
    listAll: async () => {
      // Fetch all user assessments without workspace filtering
      // Uses the bypassFilter query param to tell our API route to ignore workspace filtering
      const response = await fetch('/api/assessments?bypassFilter=true');
      if (!response.ok) {
        throw new Error(`Failed to fetch assessments: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    },
    
    get: async (id: string) => {
      return withCache(
        async () => {
          console.log('Fetching assessment:', id);
          // First get the assessment and its framework
          const { data: assessment, error: assessmentError } = await supabase
            .from('assessments')
            .select(`
              *,
              framework:framework_id!inner(*)
            `)
            .eq('id', id)
            .single();

          if (assessmentError) throw assessmentError;
          if (!assessment?.framework?.id) throw new Error('No framework found for assessment');

          console.log('Getting controls for framework:', assessment.framework.id);
          
          // First get all controls for this framework
          const { data: controls, error: controlsError } = await supabase
            .from('controls')
            .select('*')
            .eq('framework_id', assessment.framework.id)
            .order('control_id');

          if (controlsError) throw controlsError;
          console.log('Found controls:', controls);

          // Then get subcontrols for these controls
          const controlIds = controls?.map(c => c.id) || [];
          console.log('Getting subcontrols for control IDs:', controlIds);

          const { data: subcontrols, error: subcontrolsError } = await supabase
            .from('subcontrols')
            .select('*')
            .in('control_id', controlIds);

          if (subcontrolsError) throw subcontrolsError;
          console.log('Found subcontrols:', subcontrols);

          // Map subcontrols to their controls and add hardcoded ones for A.5
          const controlsWithSubs = controls?.map(control => {
            if (control.control_id === 'A.5') {
              // Update title to match ISO standard
              control.title = 'A.5 Information security policies';
              // Add hardcoded subcontrols for A.5
              return {
                ...control,
                subcontrols: [
                  {
                    id: 'a5-1',
                    title: 'A.5.1 Policies for information security',
                    description: 'Information security policies and rules shall be defined, approved by management, published, communicated to and acknowledged by relevant personnel and relevant interested parties, and reviewed at planned intervals and if significant changes occur.',
                    control_id: control.id
                  },
                  {
                    id: 'a5-2',
                    title: 'A.5.2 Information security roles and responsibilities',
                    description: 'Information security roles and responsibilities shall be defined and allocated according to the organization\'s needs.',
                    control_id: control.id
                  },
                  {
                    id: 'a5-3',
                    title: 'A.5.3 Segregation of duties',
                    description: 'Conflicting duties and areas of responsibility shall be segregated.',
                    control_id: control.id
                  },
                  {
                    id: 'a5-4',
                    title: 'A.5.4 Management responsibilities',
                    description: 'Management shall require all personnel to apply information security in accordance with the established policies and procedures of the organization.',
                    control_id: control.id
                  },
                  {
                    id: 'a5-5',
                    title: 'A.5.5 Contact with authorities',
                    description: 'The organization shall establish and maintain contact with relevant authorities.',
                    control_id: control.id
                  }
                ]
              };
            }
            return {
              ...control,
              subcontrols: subcontrols?.filter(sub => sub.control_id === control.id) || []
            };
          }) || [];

          if (controlsError) throw controlsError;

          // Combine the data
          const data = {
            ...assessment,
            framework: {
              ...assessment.framework,
              controls: controlsWithSubs
            }
          };

          console.log('Combined assessment data:', data);
          

          
          console.log('Raw Supabase response:', data);
          if (!data?.framework?.controls) {
            console.warn('Missing framework or controls in response:', data);
          }
          return data;
        },
        { key: `assessment_full_${id}` }
      );
    },
    
    create: async (
      assessment: Partial<
        Omit<Tables['assessments']['Insert'], 'id' | 'created_at' | 'updated_at'>
      > & { name?: string }
    ) => {
      // Map various client payload shapes to server API expectations
      const body = {
        title: (assessment as any).title || (assessment as any).name,
        framework_id: assessment.framework_id,
        control_id: (assessment as any).control_id,
        status: assessment.status || 'in_progress',
      } as any;

      const res = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Failed to create assessment: ${res.statusText}`);
      }
      const payload = await res.json();
      clearCache();
      // Return the assessment object from server response for compatibility
      return payload.assessment ?? payload;
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
