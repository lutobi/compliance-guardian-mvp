'use client';

import React, { useEffect, useState } from 'react';
import { SmartMonitoringSetup } from '@/components/monitoring/SmartMonitoringSetup';
import { Framework } from '@/types/framework';
import { monitoringService } from '@/services/MonitoringService';
import { useRouter } from 'next/navigation';

export default function MonitoringSetupPage() {
  const router = useRouter();
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFrameworks = async () => {
      try {
        const data = await monitoringService.getFrameworks();
        setFrameworks(data);
      } catch (error) {
        console.error('Failed to load frameworks:', error);
      } finally {
        setLoading(false);
      }
    };
    loadFrameworks();
  }, []);

  const handleSetupComplete = async (config: any) => {
    try {
      await monitoringService.createMonitoring(config);
      router.push('/dashboard/monitoring');
    } catch (error) {
      console.error('Failed to create monitoring:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Setup Compliance Monitoring</h1>
      <SmartMonitoringSetup 
        availableFrameworks={frameworks}
        onSetupComplete={handleSetupComplete}
      />
    </div>
  );
}
