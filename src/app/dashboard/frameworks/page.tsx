'use client';

import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { frameworks as staticFrameworks, frameworkData } from '@/data/frameworks';

interface Framework {
  id: string;
  name: string;
  version: string;
  created_at: string;
  control_count?: number;
}

export default function FrameworksPage() {
  // Show static immediately so the page is never empty
  const staticList: Framework[] = staticFrameworks.map(sf => ({
    id: sf.id,
    name: sf.name,
    version: sf.version,
    created_at: new Date().toISOString(),
    control_count: (frameworkData as any)[sf.id]?.controls?.length || 0,
  }));
  // Build a case-insensitive map from framework name -> static id (slug)
  const nameToId = Object.fromEntries(staticFrameworks.map(sf => [sf.name.toLowerCase(), sf.id]));
  const [frameworks, setFrameworks] = useState<Framework[]>(staticList);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attemptedSync, setAttemptedSync] = useState(false);

  useEffect(() => {
    async function loadFrameworks() {
      try {
        const { data: frameworks, error } = await supabase
          .from('frameworks')
          .select(`
            *,
            controls (count)
          `);

        if (error) throw error;

        const frameworksWithCount = (frameworks || []).map((fw: any) => {
          // Fallback to static control count when DB relation returns 0/missing
          const slug = nameToId[fw.name?.toLowerCase?.()] ?? fw.id;
          const staticCount = (frameworkData as any)[slug]?.controls?.length || 0;
          const dbCount = fw.controls?.[0]?.count;
          return {
            ...fw,
            control_count: typeof dbCount === 'number' && dbCount > 0 ? dbCount : staticCount
          } as Framework;
        });

        // If DB returned items, use them; otherwise, attempt auto-sync once
        if (frameworksWithCount.length > 0) {
          setFrameworks(frameworksWithCount as any);
        } else {
          // Try to auto-sync once if we have no DB data
          if (!attemptedSync) {
            try {
              setAttemptedSync(true);
              const res = await fetch('/api/sync-frameworks', {
                method: 'POST',
                headers: { 'x-e2e': '1' },
                credentials: 'include',
              });
              if (res.ok) {
                // refetch from DB after successful sync
                const { data: frameworks2, error: err2 } = await supabase
                  .from('frameworks')
                  .select(`
                    *,
                    controls (count)
                  `);
                if (!err2 && Array.isArray(frameworks2) && frameworks2.length > 0) {
                  const withCount2 = frameworks2.map((fw: any) => ({
                    ...fw,
                    control_count: fw.controls?.[0]?.count || 0
                  }));
                  setFrameworks(withCount2 as any);
                  return; // success
                }
              }
            } catch {
              // ignore and keep static list
            }
          }
          // Keep showing static list
        }
      } catch (e) {
        // Keep static list, just record error
        setError(e instanceof Error ? e.message : 'Failed to load frameworks (showing offline data)');
      } finally {
        setLoading(false);
      }
    }

    loadFrameworks();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error loading from database. Showing offline data: {error}</p>
        </div>
      )}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Compliance Frameworks</h1>
        <p className="mt-2 text-sm text-gray-600">
          Select a framework to view its controls and start an assessment
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {frameworks.map((framework) => (
          <Link
            key={framework.id}
            href={`/dashboard/frameworks/${(nameToId[framework.name?.toLowerCase?.()] ?? framework.id)}`}
            className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all"
          >
            <h2 className="text-lg font-semibold text-gray-900">{framework.name}</h2>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">Version: {framework.version}</p>
                <p className="text-sm text-gray-600">{framework.control_count} Controls</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {frameworks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No frameworks available</p>
        </div>
      )}
    </div>
  );
}
