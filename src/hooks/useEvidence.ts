import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Evidence } from '@/types/evidence';
import { toast } from 'sonner';

import { getFrameworkUuid } from '@/lib/framework-sync';

export function useEvidence(frameworkSlug: string | null | undefined, subcontrolId?: string) {
  console.log('useEvidence hook called with:', { frameworkSlug, subcontrolId });
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    let mounted = true;

    if (!frameworkSlug && !subcontrolId) {
      setLoading(false);
      return;
    }

    const fetchEvidence = async () => {
      try {
        const params = new URLSearchParams();
        if (frameworkSlug) {
          const frameworkId = await getFrameworkUuid(frameworkSlug);
          if (!frameworkId) {
            throw new Error(`Framework ID not found for slug: ${frameworkSlug}`);
          }
          params.append('frameworkId', frameworkId);
        }
        if (subcontrolId) params.append('subcontrolId', subcontrolId);

        console.log('Fetching evidence with params:', params.toString());
        const response = await fetch(`/api/evidence?${params.toString()}`);
        console.log('Evidence API response:', response.status);
        const result = await response.json();

        if (!response.ok) throw new Error(result.error);

        console.log('Evidence data received:', result);
        setEvidence(result.data);
      } catch (err) {
        console.error('Error fetching evidence:', err);
        setError(err as Error);
        toast.error('Failed to load evidence');
      } finally {
        setLoading(false);
      }
    };

    if (mounted) {
      fetchEvidence();
    }

    // Set up real-time subscription
    const setupSubscription = async () => {
      console.log('Setting up real-time subscription...');
      const frameworkId = frameworkSlug ? await getFrameworkUuid(frameworkSlug) : undefined;
      
      const channel = supabase
        .channel('evidence_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'evidence',
            filter: frameworkId
              ? `framework_id=eq.${frameworkId}`
              : subcontrolId
                ? `subcontrol_id=eq.${subcontrolId}`
                : undefined
          },
          (payload: any) => {
            console.log('Received real-time update:', payload);
            if (payload.eventType === 'INSERT') {
              setEvidence(prev => [...prev, payload.new as Evidence]);
            } else if (payload.eventType === 'UPDATE') {
              setEvidence(prev => 
                prev.map(e => e.id === payload.new.id ? payload.new as Evidence : e)
              );
            } else if (payload.eventType === 'DELETE') {
              setEvidence(prev => prev.filter(e => e.id !== payload.old.id));
            }
          }
        )
        .subscribe();

      return channel;
    };

    let channel: ReturnType<typeof supabase.channel>;
    if (mounted) {
      setupSubscription().then(ch => {
        if (mounted) {
          channel = ch;
        }
      });
    }

    return () => {
      mounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [frameworkSlug, subcontrolId, supabase]);

  return { evidence, loading, error };
}
