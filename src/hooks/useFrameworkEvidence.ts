import { useState, useEffect } from 'react';
import { Evidence } from '@/types/evidence';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

/**
 * Custom hook for managing framework evidence with reliable UI updates
 */
export function useFrameworkEvidence(frameworkId: string) {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [evidenceMap, setEvidenceMap] = useState<Record<string, Evidence[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Force a refresh of evidence data
  const refreshEvidence = () => {
    setRefreshCounter(prev => prev + 1);
  };

  // Using the shared Supabase client from lib/supabase

  // Fetch evidence and build the evidence map
  useEffect(() => {
    if (!frameworkId) {
      setLoading(false);
      return;
    }

    const fetchEvidence = async () => {
      setLoading(true);
      try {
        console.log('Fetching evidence for framework:', frameworkId);
        
        const { data, error } = await supabase
          .from('evidence')
          .select('*')
          .eq('framework_id', frameworkId);
          
        if (error) throw error;
        
        // Format the evidence data
        const formattedEvidence = (data || []).map(item => ({
          id: item.id,
          frameworkId: item.framework_id,
          subcontrolId: item.subcontrol_id,
          notes: item.notes,
          files: item.files || [],
          tags: item.tags || [],
          createdAt: item.created_at,
          updatedAt: item.updated_at
        }));
        
        console.log(`Fetched ${formattedEvidence.length} evidence items`);
        setEvidence(formattedEvidence);
        
        // Build the evidence map
        const map: Record<string, Evidence[]> = {};
        formattedEvidence.forEach(item => {
          if (!map[item.subcontrolId]) {
            map[item.subcontrolId] = [];
          }
          map[item.subcontrolId].push(item);
        });
        
        console.log('Built evidence map with', Object.keys(map).length, 'subcontrols');
        setEvidenceMap(map);
      } catch (err) {
        console.error('Error fetching evidence:', err);
        setError(err as Error);
        toast.error('Failed to load evidence');
      } finally {
        setLoading(false);
      }
    };

    fetchEvidence();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('evidence_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'evidence',
          filter: `framework_id=eq.${frameworkId}`
        },
        (payload) => {
          console.log('Received real-time update:', payload);
          refreshEvidence(); // Refresh data on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [frameworkId, refreshCounter, supabase]);

  // Add new evidence
  const addEvidence = async (newEvidence: Omit<Evidence, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('evidence')
        .insert({
          framework_id: frameworkId,
          subcontrol_id: newEvidence.subcontrolId,
          notes: newEvidence.notes,
          files: newEvidence.files || [],
          tags: newEvidence.tags || []
        })
        .select()
        .single();

      if (error) throw error;

      const formattedEvidence: Evidence = {
        id: data.id,
        frameworkId: data.framework_id,
        subcontrolId: data.subcontrol_id,
        notes: data.notes,
        files: data.files || [],
        tags: data.tags || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      // Update local state immediately for UI responsiveness
      setEvidence(prev => [...prev, formattedEvidence]);
      
      // Update the evidence map
      setEvidenceMap(prev => {
        const newMap = { ...prev };
        if (!newMap[formattedEvidence.subcontrolId]) {
          newMap[formattedEvidence.subcontrolId] = [];
        }
        newMap[formattedEvidence.subcontrolId].push(formattedEvidence);
        return newMap;
      });
      
      // Force a refresh to ensure consistency
      setTimeout(refreshEvidence, 500);
      
      toast.success('Evidence added successfully');
      return { success: true, data: formattedEvidence };
    } catch (error) {
      console.error('Error adding evidence:', error);
      toast.error('Failed to add evidence');
      return { success: false, error };
    }
  };

  // Delete evidence
  const deleteEvidence = async (evidenceId: string) => {
    try {
      const { error } = await supabase
        .from('evidence')
        .delete()
        .eq('id', evidenceId);

      if (error) throw error;

      // Update local state immediately for UI responsiveness
      setEvidence(prev => prev.filter(e => e.id !== evidenceId));
      
      // Update the evidence map
      setEvidenceMap(prev => {
        const newMap = { ...prev };
        Object.keys(newMap).forEach(key => {
          newMap[key] = newMap[key].filter(e => e.id !== evidenceId);
        });
        return newMap;
      });
      
      // Force a refresh to ensure consistency
      setTimeout(refreshEvidence, 500);
      
      toast.success('Evidence deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('Error deleting evidence:', error);
      toast.error('Failed to delete evidence');
      return { success: false, error };
    }
  };

  // Update evidence
  const updateEvidence = async (evidenceId: string, updates: Partial<Evidence>) => {
    try {
      const { data, error } = await supabase
        .from('evidence')
        .update({
          notes: updates.notes,
          files: updates.files,
          tags: updates.tags,
          updated_at: new Date().toISOString()
        })
        .eq('id', evidenceId)
        .select()
        .single();

      if (error) throw error;

      const formattedEvidence: Evidence = {
        id: data.id,
        frameworkId: data.framework_id,
        subcontrolId: data.subcontrol_id,
        notes: data.notes,
        files: data.files || [],
        tags: data.tags || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      // Update local state immediately for UI responsiveness
      setEvidence(prev => prev.map(e => e.id === evidenceId ? formattedEvidence : e));
      
      // Update the evidence map
      setEvidenceMap(prev => {
        const newMap = { ...prev };
        Object.keys(newMap).forEach(key => {
          newMap[key] = newMap[key].map(e => e.id === evidenceId ? formattedEvidence : e);
        });
        return newMap;
      });
      
      // Force a refresh to ensure consistency
      setTimeout(refreshEvidence, 500);
      
      toast.success('Evidence updated successfully');
      return { success: true, data: formattedEvidence };
    } catch (error) {
      console.error('Error updating evidence:', error);
      toast.error('Failed to update evidence');
      return { success: false, error };
    }
  };

  return {
    evidence,
    evidenceMap,
    loading,
    error,
    refreshEvidence,
    addEvidence,
    deleteEvidence,
    updateEvidence
  };
}
