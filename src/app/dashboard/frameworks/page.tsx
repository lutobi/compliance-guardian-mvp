'use client';

import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Framework {
  id: string;
  name: string;
  version: string;
  created_at: string;
  control_count?: number;
}

export default function FrameworksPage() {
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        const frameworksWithCount = frameworks.map(fw => ({
          ...fw,
          control_count: fw.controls?.[0]?.count || 0
        }));

        setFrameworks(frameworksWithCount);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load frameworks');
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

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
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
            href={`/dashboard/frameworks/${framework.id}`}
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
