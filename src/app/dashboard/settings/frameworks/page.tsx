"use client";
import React, { useState } from 'react';
import { useFrameworks, useFrameworkUpdateLogs } from '@/hooks/useFrameworks';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth/context';
import { useTeam } from '@/hooks/useTeam';
import { useRouter } from 'next/navigation';
import { frameworks as staticFrameworks } from '@/data/frameworks';

export default function FrameworksSettingsPage() {
  const router = useRouter();
  const { data: frameworks = [], isLoading, isError, error, refetch } = useFrameworks();
  const { user, isSystemUser } = useAuth();
  const { members: teamMembers = [] } = useTeam();
  const currentMember = teamMembers.find(m => m.email === user?.email);
  const isTeamAdmin = currentMember?.role === 'owner' || currentMember?.role === 'admin';
  const isAdmin = isSystemUser || isTeamAdmin;
  const [syncing, setSyncing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: logs = [], isLoading: logsLoading, isError: logsError } =
    useFrameworkUpdateLogs(selectedId || '');

  const handleSync = async () => {
    if (!confirm('Sync frameworks with official spec?')) return;
    setSyncing(true);
    try {
      const res = await fetch('/api/sync-frameworks', { method: 'POST' });
      let body: any = {};
      try {
        body = await res.json();
      } catch {
        /* ignore JSON parse errors */
      }
      if (!res.ok) throw new Error(body.error || 'Sync failed');
      toast.success('Frameworks synced');
      await refetch();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSyncing(false);
    }
  };

  if (isLoading) return <div>Loading frameworks...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Frameworks</h1>
      {(isError || (frameworks?.length ?? 0) === 0) && (
        <div className="text-sm text-gray-600 bg-gray-50 border rounded p-3">
          Showing static framework list. {isError ? `Error: ${error?.message}` : 'No frameworks found in database yet.'}
        </div>
      )}
      {/* DEBUG panel removed */}
      {isAdmin && (
        <Button onClick={handleSync} disabled={syncing}>
          {syncing ? 'Syncing...' : 'Check for updates'}
        </Button>
      )}

      <ul className="space-y-4">
        {(frameworks && frameworks.length > 0 ? frameworks : staticFrameworks).map((fw: any) => (
          <li
            key={fw.id}
            className={`p-4 border rounded cursor-pointer ${
              selectedId === fw.id ? 'bg-gray-50' : ''
            }`}
            onClick={() => setSelectedId(fw.id)}
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-medium">{fw.name} v{fw.version}</h2>
                <p className="text-sm text-gray-600">{fw.description}</p>
              </div>
              <span className="text-xs text-gray-500">
                {fw.last_synced_at
                  ? new Date(fw.last_synced_at).toLocaleString()
                  : 'Never synced'}
              </span>
            </div>

            {selectedId === fw.id && (
              <div className="mt-4 bg-gray-50 p-4 rounded">
                <h3 className="font-medium">Update History</h3>
                {logsLoading && <p>Loading history...</p>}
                {logsError && <p>Error loading history</p>}
                {!logsLoading && !logsError && (
                  <ul className="space-y-2 text-sm">
                    {logs.map((log) => (
                      <li key={log.id}>
                        <strong>{new Date(log.updated_at).toLocaleString()}</strong>: {' '}
                        {Array.isArray(log.changes)
                          ? log.changes.map((c: any) => c.action).join(', ')
                          : '—'}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
