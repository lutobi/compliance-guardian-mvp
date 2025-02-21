'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { monitoringService } from '@/services/MonitoringService';
import { CheckCircle2, AlertCircle, Settings2, ArrowUpRight } from 'lucide-react';

export default function MonitoringDashboard() {
  const router = useRouter();
  const [activeMonitoring, setActiveMonitoring] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMonitoring = async () => {
      try {
        // This will be replaced with actual API call
        const monitoring = await monitoringService.getActiveMonitoring();
        setActiveMonitoring(monitoring);
      } catch (error) {
        console.error('Failed to load monitoring:', error);
      } finally {
        setLoading(false);
      }
    };
    loadMonitoring();
  }, []);

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

  if (activeMonitoring.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Active Monitoring</h1>
          <p className="text-gray-600 mb-8">
            You haven't set up any compliance monitoring yet.
          </p>
          <Button 
            onClick={() => router.push('/dashboard/monitoring/setup')}
            className="bg-primary text-white"
          >
            Set Up Monitoring
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Compliance Monitoring</h1>
        <Button 
          onClick={() => router.push('/dashboard/monitoring/setup')}
          variant="outline"
        >
          Add New Monitoring
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{activeMonitoring.length}</div>
            <div className="text-sm text-gray-500">Active Monitors</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">85%</div>
            <div className="text-sm text-gray-500">Overall Compliance Rate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-500">3</div>
            <div className="text-sm text-gray-500">Pending Reviews</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {activeMonitoring.map((item: any) => (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{item.framework.name}</h3>
                  <div className="space-y-2">
                    {item.controls.map((control: any) => (
                      <div key={control.id} className="flex items-center space-x-2">
                        {control.status === 'compliant' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-500" />
                        )}
                        <span>{control.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">
                    <Settings2 className="h-4 w-4 mr-1" />
                    Configure
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
