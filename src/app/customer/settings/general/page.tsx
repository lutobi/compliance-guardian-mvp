'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useCustomerWorkspace } from '@/lib/workspace/customer-context';
import { Button } from '@/components/ui/button';

export default function CustomerGeneralSettingsPage() {
  const router = useRouter();
  const { workspace, settings, updateSettings, updateWorkspaceName, loading } = useCustomerWorkspace();
  const [timezone, setTimezone] = useState(settings.timezone || 'UTC');
  const [dateFormat, setDateFormat] = useState(settings.dateFormat || 'MM/DD/YYYY');
  const [workspaceName, setWorkspaceName] = useState(workspace?.name || '');
  console.log('[SettingsPage] workspace →', workspace);
  console.log('[SettingsPage] workspaceName state →', workspaceName);

  useEffect(() => {
    setWorkspaceName(workspace?.name || '');
  }, [workspace?.name]);

  const handleSave = async () => {
    try {
      // Rename workspace if changed
      if (workspaceName !== workspace?.name) {
        await updateWorkspaceName(workspaceName);
        toast.success('Workspace renamed');
      }
      // Update settings
      await updateSettings({ timezone, dateFormat });
      
      toast.success('Settings saved');
    } catch (error) {
      console.error('Failed to save settings', error);
      toast.error('Failed to save settings');
    }
  };

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-semibold">General Settings</h2>
      <div className="flex flex-col space-y-2">
        <label className="flex justify-between items-center">
          <span>Workspace Name:</span>
          <input
            type="text"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            className="border p-1 rounded"
          />
        </label>
        <Button
          onClick={async () => {
            try {
              await updateWorkspaceName(workspaceName);
              toast.success('Workspace renamed');

            } catch (err) {
              toast.error('Failed to rename workspace');
            }
          }}
          disabled={loading}
        >
          {loading ? 'Renaming...' : 'Rename Workspace'}
        </Button>
      </div>
      <div className="flex flex-col space-y-2">
        <label className="flex justify-between items-center">
          <span>Timezone:</span>
          <input
            type="text"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="border p-1 rounded"
          />
        </label>
        <label className="flex justify-between items-center">
          <span>Date Format:</span>
          <input
            type="text"
            value={dateFormat}
            onChange={(e) => setDateFormat(e.target.value)}
            className="border p-1 rounded"
          />
        </label>
      </div>
      <Button onClick={handleSave} disabled={loading}>
        {loading ? 'Saving...' : 'Save Settings'}
      </Button>
    </div>
  );
}
