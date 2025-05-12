'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface ComplianceMetrics {
  total: number;
  passed: number;
  failed: number;
  pending: number;
  riskLevel: 'low' | 'medium' | 'high';
  verificationStatus: {
    completed: number;
    total: number;
  };
}

interface ComplianceOverviewProps {
  frameworkId?: string;
}

export function ComplianceOverview({ frameworkId }: ComplianceOverviewProps) {
  const [metrics, setMetrics] = useState<ComplianceMetrics>({
    total: 0,
    passed: 0,
    failed: 0,
    pending: 0,
    riskLevel: 'low',
    verificationStatus: {
      completed: 0,
      total: 0
    }
  });

  useEffect(() => {
    const loadMetrics = async () => {
      const supabase = createClientComponentClient();
      const { data } = await supabase
        .from('compliance_metrics')
        .select('*')
        .single();

      if (data) {
        setMetrics(data);
      }
    };

    loadMetrics();
  }, []);

  const complianceScore = Math.round((metrics.passed / metrics.total) * 100) || 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Compliance Overview</CardTitle>
          <CardDescription>Current compliance status and metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Compliance</span>
                <span className="text-sm font-medium">{complianceScore}%</span>
              </div>
              <Progress value={complianceScore} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                <span>Passed: {metrics.passed}</span>
              </div>
              <div className="flex items-center space-x-2">
                <XCircleIcon className="w-5 h-5 text-red-500" />
                <span>Failed: {metrics.failed}</span>
              </div>
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-5 h-5 text-yellow-500" />
                <span>Pending: {metrics.pending}</span>
              </div>
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />
                <span>Risk Level: {metrics.riskLevel}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Verification Status</CardTitle>
          <CardDescription>Progress of compliance verification</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Verification Progress</span>
                <span className="text-sm font-medium">
                  {Math.round((metrics.verificationStatus.completed / metrics.verificationStatus.total) * 100)}%
                </span>
              </div>
              <Progress 
                value={(metrics.verificationStatus.completed / metrics.verificationStatus.total) * 100} 
              />
            </div>
            <div className="text-sm text-gray-500">
              {metrics.verificationStatus.completed} of {metrics.verificationStatus.total} checks verified
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
