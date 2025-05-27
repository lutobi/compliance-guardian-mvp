import { useState, useEffect, useMemo } from 'react';
import { Evidence } from '@/types/evidence';

export function useAssessmentEvidence(assessmentId: string) {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchEvidence() {
      if (!assessmentId) {
        setEvidence([]);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/evidence?assessmentId=${assessmentId}`);
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to fetch assessment evidence');
        setEvidence(result.data);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvidence();
  }, [assessmentId]);

  return { evidence, loading, error };
}
