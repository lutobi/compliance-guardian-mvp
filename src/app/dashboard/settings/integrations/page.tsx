"use client";

import React, { useState } from 'react';
import { useIntegrations } from '@/hooks/useIntegrations';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { IntegrationType } from '@/types/integration';

export default function IntegrationsSettingsPage() {
  const {
    integrations,
    isLoading,
    isError,
    error,
    createIntegration,
    isCreating,
    updateIntegration,
    isUpdating,
    deleteIntegration,
    isDeleting,
  } = useIntegrations();
  const [newType, setNewType] = useState<IntegrationType>('slack');
  const [newConfig, setNewConfig] = useState('{}');

  if (isLoading) return <div>Loading integrations...</div>;
  if (isError) return <div>Error: {error?.message || 'Unknown error'}</div>;

  const handleAdd = async () => {
    try {
      const config = JSON.parse(newConfig);
      await createIntegration({ type: newType, config, enabled: true });
      toast.success('Integration added');
      setNewConfig('{}');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Integrations</h1>

      <div className="space-y-2">
        <h2 className="text-xl font-medium">Add Integration</h2>
        <div className="flex space-x-2">
          <select
            value={newType}
            onChange={e => setNewType(e.target.value as IntegrationType)}
            className="border px-2 py-1 rounded"
          >
            <option value="slack">Slack</option>
            <option value="email">Email</option>
            <option value="webhook">Webhook</option>
            <option value="jira">Jira</option>
          </select>
          <input
            type="text"
            className="border px-2 py-1 rounded flex-1"
            value={newConfig}
            onChange={e => setNewConfig(e.target.value)}
            placeholder="Config JSON"
          />
          <Button onClick={handleAdd} disabled={isCreating}>
            {isCreating ? 'Adding...' : 'Add'}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-medium">Existing Integrations</h2>
        <table className="min-w-full table-auto border">
          <thead>
            <tr>
              <th className="px-2 py-1 border">Type</th>
              <th className="px-2 py-1 border">Enabled</th>
              <th className="px-2 py-1 border">Config</th>
              <th className="px-2 py-1 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {integrations.map(i => (
              <tr key={i.id}>
                <td className="px-2 py-1 border">{i.type}</td>
                <td className="px-2 py-1 border text-center">
                  <input
                    type="checkbox"
                    checked={i.enabled}
                    onChange={async e => {
                      try {
                        await updateIntegration({ id: i.id, updates: { enabled: e.target.checked } });
                        toast.success('Updated');
                      } catch (err: any) {
                        toast.error(err.message);
                      }
                    }}
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-2 py-1 border">
                  <pre className="text-xs">{JSON.stringify(i.config)}</pre>
                </td>
                <td className="px-2 py-1 border">
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      if (!confirm('Remove integration?')) return;
                      try {
                        await deleteIntegration(i.id);
                        toast.success('Deleted');
                      } catch (err: any) {
                        toast.error(err.message);
                      }
                    }}
                    disabled={isDeleting}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
