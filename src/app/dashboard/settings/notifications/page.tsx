'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { Frequency } from '@/types/settings';

export default function NotificationsSettingsPage() {
  const { settings, isLoading, isError, error, updateSettings, isUpdating } = useSettings();
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [threshold, setThreshold] = useState<number>(0);

  useEffect(() => {
    if (settings) {
      setFrequency(settings.compliance_frequency);
      setThreshold(settings.notification_threshold);
    }
  }, [settings]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings({ compliance_frequency: frequency, notification_threshold: threshold });
      toast.success('Settings saved');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings');
    }
  };

  if (isLoading) return <div>Loading settings...</div>;
  if (isError) return <div>Error loading settings: {error?.message}</div>;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium">Compliance Frequency</label>
        <Select value={frequency} onValueChange={(value) => setFrequency(value as Frequency)}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block text-sm font-medium">Notification Threshold (days)</label>
        <Input
          type="number"
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          min={0}
        />
      </div>
      <div>
        <Button type="submit" disabled={isUpdating}>
          {isUpdating ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </form>
  );
}
