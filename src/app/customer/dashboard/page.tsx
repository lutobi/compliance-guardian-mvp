'use client';

import { useAuth } from '@/lib/auth/context';
import { useCustomerWorkspace } from '@/lib/workspace/customer-context';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { MonitoringService } from '@/services/MonitoringService';
import type { MonitoringItem } from '@/types/monitoring';
import { MonitoringStatus } from '@/types/monitoring';
import { api } from '@/lib/api';
import { ProgressRing } from '@/components/ui/progress-ring';
import { FrameworkStatusItem, RecentActivityItem, PendingTaskItem, RiskSummaryItem, VerificationSummary } from '@/types/dashboard';
import { ComplianceChart } from '@/components/dashboard/ComplianceChart';
import { MonitoringList } from '@/components/monitoring/MonitoringList';
import { ActivityList } from '@/components/dashboard/ActivityList';
import { TaskList } from '@/components/dashboard/TaskList';
import { RiskSummary } from '@/components/dashboard/RiskSummary';
import { VerificationSummary as VerificationSummaryComponent } from '@/components/dashboard/VerificationSummary';

export default function CustomerDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, isCustomerUser, isSystemUser } = useAuth();
  const { workspace, loading: workspaceLoading } = useCustomerWorkspace();

  const [dashboardData, setDashboardData] = useState<{ frameworkStatus: FrameworkStatusItem[]; recentActivities: RecentActivityItem[]; pendingTasks: PendingTaskItem[]; riskSummary: RiskSummaryItem[]; verificationSummary: VerificationSummary | null; }>({ frameworkStatus: [], recentActivities: [], pendingTasks: [], riskSummary: [], verificationSummary: null });
  const [loadingData, setLoadingData] = useState(true);
  const [assessmentStats, setAssessmentStats] = useState<{ count: number; completionRate: number }>({ count: 0, completionRate: 0 });
  const [monitoringItems, setMonitoringItems] = useState<MonitoringItem[]>([]);

  const loadDashboardData = async () => {
    try {
      setLoadingData(true);
      const monitoringData = await MonitoringService.getActiveMonitoring();
      setMonitoringItems(monitoringData);
      const frameworkStatus: FrameworkStatusItem[] = (monitoringData as any[]).map(item => {
        const totalControls = item.monitoredControls?.length ?? 0;
        const compliantCount = item.status === 'compliant' ? totalControls : 0;
        const complianceRate = totalControls > 0 ? Math.round((compliantCount / totalControls) * 100) : 0;
        return {
          id: item.framework.id,
          name: item.framework.name,
          complianceRate,
          totalControls,
          compliantCount,
          trend: 0,
        };
      });
      const recentActivities = await MonitoringService.getRecentActivities(10);
      const pendingTasks = await MonitoringService.getPendingTasks(10);
      const riskSummary = await MonitoringService.getRiskAssessment();
      const verificationSummary = await MonitoringService.getVerificationSummary();
      setDashboardData({ frameworkStatus, recentActivities, pendingTasks, riskSummary, verificationSummary });

      // Compute assessment metrics
      const assessments = await api.assessments.list(workspace.id);
      const totalAssessments = assessments.length;
      const completedAssessments = assessments.filter(a => a.status === 'completed').length;
      const assessmentCompletionRate = totalAssessments > 0 ? Math.round((completedAssessments / totalAssessments) * 100) : 0;
      setAssessmentStats({ count: totalAssessments, completionRate: assessmentCompletionRate });
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !workspaceLoading && workspace) loadDashboardData();
  }, [authLoading, workspaceLoading, workspace]);

  useEffect(() => {
    if (!authLoading && !workspaceLoading) {
      if (!isCustomerUser && !isSystemUser) {
        router.replace('/auth/login');
      } else if (!workspace && isCustomerUser) {
        router.replace('/customer/select-workspace');
      }
    }
  }, [authLoading, workspaceLoading, isCustomerUser, isSystemUser, workspace, router]);

  // Handle task completion
  const handleTaskComplete = async (taskId: string) => {
    try {
      await MonitoringService.updatePointStatus(taskId, MonitoringStatus.Compliant);
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  if (authLoading || workspaceLoading || loadingData) return <div>Loading...</div>;
  if (!(isCustomerUser || isSystemUser) || !workspace) {
    return null;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        {workspace.name} Dashboard
      </h1>

      {/* Assessments Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Assessments</h3>
          <p className="text-2xl font-bold">{assessmentStats.count}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex items-center justify-center">
          <ProgressRing value={assessmentStats.completionRate} size={80} strokeWidth={8} textClassName="text-lg" />
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

      {/* Original Sections */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <ul className="space-y-2">
            <li><a href="/customer/assessments/new" className="text-blue-600 hover:underline">Start New Assessment</a></li>
            <li><a href="/settings" className="text-blue-600 hover:underline">Settings</a></li>
            <li><a href="/customer/assessments" className="text-blue-600 hover:underline">View Ongoing Assessments</a></li>
            <li><a href="/monitoring" className="text-blue-600 hover:underline">View Monitoring Status</a></li>
          </ul>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Active Monitoring</h2>
          <MonitoringList
            monitoringData={monitoringItems}
            onStatusUpdate={async (id, status) => { try { await MonitoringService.updatePointStatus(id, status); await loadDashboardData(); } catch {} }}
            onDelete={async (id) => { try { await MonitoringService.deleteMonitoringPoint(id); await loadDashboardData(); } catch {} }}
          />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <ActivityList data={dashboardData.recentActivities} onViewMore={() => router.push('/activity')} />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Pending Tasks</h2>
          <TaskList data={dashboardData.pendingTasks} onTaskComplete={handleTaskComplete} onViewMore={() => router.push('/tasks')} />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Risk Assessment</h2>
          {dashboardData.riskSummary.length > 0 && <RiskSummary data={dashboardData.riskSummary} />}
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Verification Status</h2>
          {dashboardData.verificationSummary && <VerificationSummaryComponent data={dashboardData.verificationSummary} />}
        </div>
      </div>
    </div>
  );
}
