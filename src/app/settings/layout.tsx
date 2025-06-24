'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';

const tabItems = [
  { value: 'general', label: 'General' },
  { value: 'team', label: 'Team' },
  { value: 'notifications', label: 'Notifications' },
  { value: 'integrations', label: 'Integrations' },
  { value: 'frameworks', label: 'Frameworks' },
  { value: 'billing', label: 'Billing' },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const base = '/settings';
  const { isSystemUser } = useAuth();
  const allowedTabs = tabItems;
  const segments = pathname?.split('/') || [];
  const current = segments[2] || 'general';
  const [value, setValue] = useState<string>(current);

  useEffect(() => setValue(current), [current]);

  const onTabChange = (v: string) => {
    setValue(v);
    router.push(`${base}/${v}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <Tabs value={value} onValueChange={onTabChange}>
        <TabsList>
          {allowedTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="mt-6">{children}</div>
    </div>
  );
}
