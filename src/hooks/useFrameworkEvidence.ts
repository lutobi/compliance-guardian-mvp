import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { resolveFrameworkUuid } from '@/lib/resolveFrameworkUuid';
import { Evidence } from '@/types/evidence';
import { toast } from 'sonner';
import { useMultiTenantAuth } from '@/lib/auth/MultiTenantContext';

/**
 * Custom hook for managing framework evidence with reliable UI updates
 */
export function useFrameworkEvidence(frameworkId: string) {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [evidenceMap, setEvidenceMap] = useState<Record<string, Evidence[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);
  // Store resolved UUID for framework slug
  const [frameworkUuid, setFrameworkUuid] = useState<string | null>(null);
  const { currentWorkspace } = useMultiTenantAuth();

  // Force a refresh of evidence data
  const refreshEvidence = useCallback(() => {
    setRefreshCounter(prev => prev + 1);
  }, []);

  // Add effect to resolve slug to UUID
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        // Determine true framework UUID
        const uuid = await resolveFrameworkUuid(supabase, frameworkId);
        if (isMounted) setFrameworkUuid(uuid);
      } catch (err) {
        console.error('Error resolving frameworkId:', err);
        if (isMounted) setError(err as Error);
      }
    })();
    return () => { isMounted = false; };
  }, [frameworkId]);

  // Using Next.js API routes to avoid direct REST filter issues
  async function resolveAccessToken(): Promise<string | undefined> {
    // 1) Try mt_session in localStorage (set by app during login)
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('mt_session');
        if (raw) {
          const json = JSON.parse(raw);
          if (json?.access_token) return json.access_token as string;
        }
      } catch {}
    }
    // 2) Fallback to Supabase session
    try {
      const { data } = await supabase.auth.getSession();
      return data?.session?.access_token;
    } catch {}
    return undefined;
  }

  // Fetch evidence and build the evidence map
  useEffect(() => {
    if (!frameworkId) {
      setLoading(false);
      return;
    }

    const fetchEvidence = async () => {
      setLoading(true);
      try {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        const idParam = frameworkUuid || (uuidRegex.test(frameworkId) ? frameworkId : null);
        if (!idParam) {
          // Wait until we have a resolvable UUID to avoid 400s with slugs
          setLoading(false);
          return;
        }
        // Resolve workspace slug with robust fallback to localStorage
        let ws = currentWorkspace?.slug as string | undefined;
        if (!ws && typeof window !== 'undefined') {
          try {
            const stored = localStorage.getItem('lastWorkspace');
            if (stored) ws = stored;
          } catch {}
        }
        const url = `/api/evidence?frameworkId=${encodeURIComponent(idParam)}${ws ? `&workspace=${encodeURIComponent(ws)}` : ''}`;
        const token = await resolveAccessToken();
        const headers: Record<string, string> = {};
        if (ws) headers['x-workspace-slug'] = ws;
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(url, {
          credentials: 'include',
          headers,
        });
        const json = await res.json();
        if (!res.ok) throw new Error(typeof json.error === 'string' ? json.error : JSON.stringify(json.error));
        const data = json.data;

        // Use API-returned Evidence objects directly
        const fetchedEvidence: Evidence[] = data;
        console.log(`Fetched ${fetchedEvidence.length} evidence items`);
        setEvidence(fetchedEvidence);
        
        // Build the evidence map
        const map: Record<string, Evidence[]> = {};
        fetchedEvidence.forEach(item => {
          if (!map[item.subcontrolId]) {
            map[item.subcontrolId] = [];
          }
          map[item.subcontrolId].push(item);
        });
        
        console.log('Built evidence map with', Object.keys(map).length, 'subcontrols');
        setEvidenceMap(map);
      } catch (err: any) {
        const msg = err?.message || String(err);
        console.error('Error fetching evidence:', msg);
        setError(err as Error);
        toast.error('Failed to load evidence');
      } finally {
        setLoading(false);
      }
    };

    fetchEvidence();
    
    // Set up real-time subscription
    // const channel = supabase
    //   .channel('evidence_changes')
    //   .on(
    //     'postgres_changes',
    //     {
    //       event: '*',
    //       schema: 'public',
    //       table: 'evidence',
    //       filter: `framework_id=eq.${frameworkId}`
    //     },
    //     (payload) => {
    //       console.log('Received real-time update:', payload);
    //       refreshEvidence(); // Refresh data on any change
    //     }
    //   )
    //   .subscribe();

    // return () => {
    //   supabase.removeChannel(channel);
    // };
  }, [frameworkId, refreshCounter, frameworkUuid, currentWorkspace?.slug]);

  // Add new evidence
  const addEvidence = async (newEvidence: Omit<Evidence, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('Sending new evidence to API:', newEvidence);
      const payload = { ...newEvidence, frameworkId: frameworkUuid || newEvidence.frameworkId };
      let ws = currentWorkspace?.slug as string | undefined;
      if (!ws && typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('lastWorkspace');
          if (stored) ws = stored;
        } catch {}
      }
      const token = await resolveAccessToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (ws) headers['x-workspace-slug'] = ws;
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`/api/evidence${ws ? `?workspace=${encodeURIComponent(ws)}` : ''}`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok) {
        const errMsg = typeof json?.error === 'string' ? json.error : json?.error?.message || 'Request failed';
        throw new Error(errMsg);
      }
      const data = json.data;

      // Use API-returned Evidence object directly
      const formattedEvidence: Evidence = data;

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
      let ws = currentWorkspace?.slug as string | undefined;
      if (!ws && typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('lastWorkspace');
          if (stored) ws = stored;
        } catch {}
      }
      const token = await resolveAccessToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (ws) headers['x-workspace-slug'] = ws;
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`/api/evidence${ws ? `?workspace=${encodeURIComponent(ws)}` : ''}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
        body: JSON.stringify({ id: evidenceId }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        const errMsg = typeof json?.error === 'string' ? json.error : json?.error?.message || 'Failed to delete evidence';
        throw new Error(errMsg);
      }
      // Update local state immediately for UI responsiveness
      setEvidence(prev => prev.filter(e => e.id !== evidenceId));
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
    } catch (error: any) {
      console.error('Error deleting evidence:', error);
      toast.error('Failed to delete evidence');
      return { success: false, error };
    }
  };

  // Update evidence
  const updateEvidence = async (evidenceId: string, updates: Partial<Evidence>) => {
    try {
      let ws = currentWorkspace?.slug as string | undefined;
      if (!ws && typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('lastWorkspace');
          if (stored) ws = stored;
        } catch {}
      }
      const token = await resolveAccessToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (ws) headers['x-workspace-slug'] = ws;
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`/api/evidence${ws ? `?workspace=${encodeURIComponent(ws)}` : ''}`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify({ id: evidenceId, ...updates }),
      });
      const json = await res.json();
      if (!res.ok) {
        const errMsg = typeof json?.error === 'string' ? json.error : json?.error?.message || 'Failed to update evidence';
        throw new Error(errMsg);
      }
      const updated: Evidence = json.data;
      // Update local state immediately
      setEvidence(prev => prev.map(e => e.id === evidenceId ? updated : e));
      setEvidenceMap(prev => {
        const newMap = { ...prev };
        Object.keys(newMap).forEach(key => {
          newMap[key] = newMap[key].map(e => e.id === evidenceId ? updated : e);
        });
        return newMap;
      });
      // Refresh to ensure consistency
      setTimeout(refreshEvidence, 500);
      toast.success('Evidence updated successfully');
      return { success: true, data: updated };
    } catch (error: any) {
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
