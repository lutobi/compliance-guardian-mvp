'use client';

import React, { useState } from 'react';
import { useCustomerWorkspace } from '@/lib/workspace/customer-context';
import { Button } from '@/components/ui/button';

export default function CustomerGeneralSettingsPage() {
  const { settings, updateSettings, loading } = useCustomerWorkspace();
  const [timezone, setTimezone] = useState(settings.timezone || 'UTC');
  const [dateFormat, setDateFormat] = useState(settings.dateFormat || 'MM/DD/YYYY');

  const handleSave = async () => {
    try {
      await updateSettings({ timezone, dateFormat });
    } catch (error) {
      console.error('Failed to update settings', error);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-semibold">General Settings</h2>
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
        Save
      </Button>
    </div>
  );
}
