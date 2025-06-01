'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function GeneralSettingsPage() {
  const { settings, isLoading, isError, error, updateSettings, isUpdating } = useSettings();

  const [workspaceName, setWorkspaceName] = useState('');
  const [defaultFramework, setDefaultFramework] = useState('');
  const [locale, setLocale] = useState('en-US');
  const [timezone, setTimezone] = useState('UTC');
  const [dateFormat, setDateFormat] = useState<'MM/dd/yyyy' | 'dd/MM/yyyy' | 'yyyy-MM-dd'>('MM/dd/yyyy');
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('24h');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    if (settings) {
      setWorkspaceName(settings.workspace_name ?? '');
      setDefaultFramework(settings.default_compliance_framework ?? '');
      setLocale(settings.locale ?? 'en-US');
      setTimezone(settings.timezone ?? 'UTC');
      setDateFormat(settings.date_format ?? 'MM/dd/yyyy');
      setTimeFormat(settings.time_format ?? '24h');
      setNotificationsEnabled(settings.notifications_enabled ?? true);
    }
  }, [settings]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings({
        workspace_name: workspaceName,
        default_compliance_framework: defaultFramework,
        locale,
        timezone,
        date_format: dateFormat,
        time_format: timeFormat,
        notifications_enabled: notificationsEnabled,
      });
      toast.success('General settings saved');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save general settings');
    }
  };

  if (isLoading) return <div>Loading general settings...</div>;
  if (isError) return <div>Error loading settings: {error?.message}</div>;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <h2 className="text-2xl font-semibold">General Settings</h2>
      <div>
        <label className="block font-medium">Dashboard (Company) Name</label>
        <Input value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} />
      </div>
      <div>
        <label className="block font-medium">Default Framework</label>
        <Select value={defaultFramework} onValueChange={setDefaultFramework}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select framework" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EUDR Compliance">EUDR Compliance</SelectItem>
            <SelectItem value="ISO 27001">ISO 27001</SelectItem>
            <SelectItem value="GDPR">GDPR</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block font-medium">Locale</label>
        <Select value={locale} onValueChange={setLocale}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select locale" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en-US">English (US)</SelectItem>
            <SelectItem value="fr-FR">Français (FR)</SelectItem>
            <SelectItem value="es-ES">Español (ES)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block font-medium">Timezone</label>
        <Select value={timezone} onValueChange={setTimezone}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select timezone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="UTC">UTC</SelectItem>
            <SelectItem value="Europe/Berlin">Europe/Berlin</SelectItem>
            <SelectItem value="America/New_York">America/New York</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex space-x-4">
        <div>
          <label className="block font-medium">Date Format</label>
          <Select value={dateFormat} onValueChange={setDateFormat}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Date format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MM/dd/yyyy">MM/dd/yyyy</SelectItem>
              <SelectItem value="dd/MM/yyyy">dd/MM/yyyy</SelectItem>
              <SelectItem value="yyyy-MM-dd">yyyy-MM-dd</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block font-medium">Time Format</label>
          <Select value={timeFormat} onValueChange={setTimeFormat}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Time format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12h">12h</SelectItem>
              <SelectItem value="24h">24h</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
        <span>Enable all notifications</span>
      </div>
      <div>
        <Button type="submit" disabled={isUpdating}>
          {isUpdating ? 'Saving...' : 'Save General Settings'}
        </Button>
      </div>
    </form>
  );
}
