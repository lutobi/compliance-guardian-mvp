'use client';

import React from 'react';
import { useFrameworks } from '@/hooks/useFrameworks';

export default function CustomerFrameworksSettingsPage() {
  const { data: frameworks = [], isLoading, isError, error } = useFrameworks();

  if (isLoading) return <div>Loading frameworks...</div>;
  if (isError) return <div>Error loading frameworks: {error?.message}</div>;

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-semibold">Frameworks</h2>
      <ul className="space-y-2">
        {frameworks.map(fw => (
          <li key={fw.id} className="p-3 border rounded hover:bg-gray-50">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{fw.name}</h3>
                <p className="text-sm text-gray-600">v{fw.version}</p>
              </div>
              <span className="text-xs text-gray-500">Last synced: {new Date(fw.last_synced_at).toLocaleDateString()}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
