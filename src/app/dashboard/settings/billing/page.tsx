import React from 'react';
import { SettingsSkeleton } from '@/components/SettingsSkeleton';

export default function BillingSettingsPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Billing Settings</h2>
      <SettingsSkeleton />
    </div>
  );
}
