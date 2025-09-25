'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMultiTenantAuth } from '@/lib/auth/MultiTenantContext';
import { MonitoringService } from '@/services/MonitoringService';
import { DashboardData, RecentActivityItem, PendingTaskItem, RiskSummaryItem, VerificationSummary, FrameworkStatusItem } from '@/types/dashboard';
import { MonitoringItem, MonitoringStatus } from '@/types/monitoring';
import { ComplianceChart } from '@/components/dashboard/ComplianceChart';
import { RiskSummary } from '@/components/dashboard/RiskSummary';
import { VerificationSummary as VerificationSummaryComponent } from '@/components/dashboard/VerificationSummary';
import { MonitoringList } from '@/components/monitoring/MonitoringList';
import { ActivityList } from '@/components/dashboard/ActivityList';
import { TaskList } from '@/components/dashboard/TaskList';
import { Button } from '@/components/ui/button';
import { ProgressRing } from '@/components/ui/progress-ring';
import { api } from '@/lib/api';

type MonitoringData = {
  id: string;
  status: MonitoringStatus;
  framework: {
    id: string;
    name: string;
    description: string;
    slug: string;
  };
  monitoredControls: Array<{
    id: string;
    control: {
      id: string;
      name: string;
      category: string;
    };
  }>;
};

import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import React, { Suspense } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

export default function DashboardPage() {
  const { user, loading, currentWorkspace, currentMembership } = useMultiTenantAuth();
  const router = useRouter();
  const [error, setError] = useState<Error | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [dashboardData, setDashboardData] = useState<{
    frameworkStatus: FrameworkStatusItem[];
    recentActivities: RecentActivityItem[];
    pendingTasks: PendingTaskItem[];
    riskSummary: RiskSummaryItem[];
    verificationSummary: VerificationSummary | null;
  }>({
    frameworkStatus: [],
    recentActivities: [],
    pendingTasks: [],
    riskSummary: [],
    verificationSummary: null
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [assessmentStats, setAssessmentStats] = useState<{count:number;completionRate:number}>({count:0,completionRate:0});

  const loadDashboardData = async () => {
    setError(null);
    setLoadingData(true);
    try {
      // Get active monitoring data
      const monitoringData = await MonitoringService.getActiveMonitoring();
      
              // Use mock data for framework status
      const frameworkStats: FrameworkStatusItem[] = [
        {
          id: '1',
          name: 'GDPR',
          complianceRate: 85,
          totalControls: 100,
          compliantCount: 85,
          trend: 5
        },
        {
          id: '2',
          name: 'HIPAA',
          complianceRate: 72,
          totalControls: 75,
          compliantCount: 54,
          trend: -2
        },
        {
          id: '3',
          name: 'SOC 2',
          complianceRate: 91,
          totalControls: 120,
          compliantCount: 109,
          trend: 8
        }
      ];

      // Get recent activities
      const recentActivitiesData = await MonitoringService.getRecentActivities(10);

      // Get pending tasks
      const pendingTasksData = await MonitoringService.getPendingTasks(10);

      // Get risk assessment data
      const riskData = await MonitoringService.getRiskAssessment();

      // Get verification summary
      const verificationData = await MonitoringService.getVerificationSummary();

      setDashboardData({
        frameworkStatus: frameworkStats,
        recentActivities: recentActivitiesData,
        pendingTasks: pendingTasksData,
        riskSummary: riskData,
        verificationSummary: verificationData
      });

      // fetch assessment overview
      const assessments = await api.assessments.list();
      const total = assessments.length;
      const done = assessments.filter((a: any) => a.status === 'completed').length;
      setAssessmentStats({ count: total, completionRate: total>0?Math.round((done/total)*100):0 });
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Failed to load dashboard data'));
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      loadDashboardData();
      const intervalId = setInterval(loadDashboardData, 30000);
      return () => clearInterval(intervalId);
    }
  }, [loading, user]);

  useEffect(() => {
    if (!loading && user) {
      if (currentWorkspace && currentMembership) {
        // User has a workspace, redirect to workspace dashboard
        router.push(`/workspace/${currentWorkspace.slug}/dashboard`);
        return;
      }
      // No workspace found, redirect to workspace selection
      router.push('/workspace/select');
    }
  }, [loading, user, currentWorkspace, currentMembership, router]);

  // Handle task completion
  const handleTaskComplete = async (taskId: string) => {
    try {
      const task = dashboardData.pendingTasks.find(t => t.id === taskId);
      if (task) {
        await MonitoringService.updatePointStatus(task.id, MonitoringStatus.Compliant);
        await loadDashboardData();
      }
    } catch (error) {
      console.error('Failed to complete task:', error);
      setError(error instanceof Error ? error : new Error('Failed to complete task'));
    }
  };

  // Handle export
  const handleExport = () => {
    const dataStr = JSON.stringify(dashboardData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-600 text-xl mb-4">Error: {error.message}</div>
        <button
          onClick={() => loadDashboardData()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Actions & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <input
            type="text"
            className="border rounded p-2 w-full sm:w-64"
            placeholder="Search frameworks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex space-x-2 mt-4 sm:mt-0">
            <Button onClick={() => router.push('/dashboard/assessments/new')}>New Assessment</Button>
            <Button variant="secondary" onClick={() => router.push('/dashboard/assessments/new')}>Upload Evidence</Button>
          </div>
        </div>
        {/* Assessments Overview */}
        {!loadingData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-500">Total Assessments</h3>
              <p className="text-2xl font-bold">{assessmentStats.count}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 flex items-center justify-center">
              <ProgressRing value={assessmentStats.completionRate} size={64} strokeWidth={6} textClassName="text-lg" />
            </div>
          </div>
        )}
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-500">Monitored Frameworks</h3>
            <p className="text-2xl font-bold">{dashboardData.frameworkStatus.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-500">Pending Tasks</h3>
            <p className="text-2xl font-bold">{dashboardData.pendingTasks.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-500">Recent Activities</h3>
            <p className="text-2xl font-bold">{dashboardData.recentActivities.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-500">Completion Rate</h3>
            <p className="text-2xl font-bold">{dashboardData.verificationSummary?.completionRate}%</p>
          </div>
        </div>
        {/* Compliance Chart */}
        <div className="mb-8">
          <ComplianceChart data={dashboardData.frameworkStatus} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Active Monitoring</h2>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Framework Compliance</h3>
              {dashboardData.frameworkStatus.length > 0 ? (
                <div className="space-y-2">
                  {dashboardData.frameworkStatus
                    .filter(item => 
                      item.name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map(framework => (
                      <div key={framework.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{framework.name}</h4>
                            <div className="text-sm text-gray-500">
                              {framework.compliantCount} of {framework.totalControls} controls compliant
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">{framework.complianceRate}%</div>
                            {typeof framework.trend === 'number' && (
                              <div className="text-sm text-gray-500">
                                {framework.trend >= 0 ? '↑' : '↓'} {Math.abs(framework.trend)}%
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              framework.complianceRate >= 80 ? 'bg-green-500' : 
                              framework.complianceRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${framework.complianceRate}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No framework data available</p>
                  <p className="text-sm">Configure monitoring for your compliance frameworks</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <ActivityList 
              data={dashboardData.recentActivities} 
              onViewMore={() => router.push('/activity')}
            />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Pending Tasks</h2>
            <TaskList
              data={dashboardData.pendingTasks}
              onTaskComplete={handleTaskComplete}
              onViewMore={() => router.push('/tasks')}
            />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Risk Assessment</h2>
            {dashboardData.riskSummary.length > 0 && (
              <RiskSummary data={dashboardData.riskSummary} />
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Verification Status</h2>
            {dashboardData.verificationSummary && (
              <VerificationSummaryComponent data={dashboardData.verificationSummary} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
