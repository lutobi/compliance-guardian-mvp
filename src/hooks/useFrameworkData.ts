'use client';

import { useEffect, useState } from 'react';
import { FrameworkData } from '@/types/framework';
import { frameworkData } from '@/data/frameworks';

export function useFrameworkData(frameworkId: string) {
  const [data, setData] = useState<FrameworkData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // Simulate async data fetch to force client-side execution
      const fetchData = async () => {
        setLoading(true);
        const framework = frameworkData[frameworkId];
        if (!framework) {
          throw new Error(`Framework ${frameworkId} not found`);
        }
        setData(framework);
        setLoading(false);
      };
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setLoading(false);
    }
  }, [frameworkId]);

  return { data, error, loading };
}
