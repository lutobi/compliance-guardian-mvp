'use client';

import { useEffect, useState } from 'react';
import { FrameworkData } from '@/types/framework';
import { frameworkData } from '@/data/frameworks';

export function useFrameworkData(frameworkId: string) {
  const [data, setData] = useState<FrameworkData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const framework = frameworkData[frameworkId];
        if (!framework) {
          setError(new Error(`Framework ${frameworkId} not found`));
          return;
        }
        
        setData(framework);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [frameworkId]);

  return { data, error, loading };
}
