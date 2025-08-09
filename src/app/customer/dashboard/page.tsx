'use client';

import { useAuth } from '@/lib/auth/context';
import { useCustomerWorkspace } from '@/lib/workspace/customer-context';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { updateMonitoringPointStatusAction, deleteMonitoringPointAction } from './actions'; // removed getCustomerDashboardData
// Removed direct supabase import - using API routes instead to avoid CORS issues
import type { MonitoringItem } from '@/types/monitoring';
import { MonitoringStatus } from '@/types/monitoring';
// import { api } from '@/lib/api'; // using server-mounted API route for assessments
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
  console.log('[Dashboard]', { authLoading, workspaceLoading, workspace });

  const [dashboardData, setDashboardData] = useState<{ frameworkStatus: FrameworkStatusItem[]; recentActivities: RecentActivityItem[]; pendingTasks: PendingTaskItem[]; riskSummary: RiskSummaryItem[]; verificationSummary: VerificationSummary | null; }>({ frameworkStatus: [], recentActivities: [], pendingTasks: [], riskSummary: [], verificationSummary: null });
  const [loadingData, setLoadingData] = useState(true);
  const [assessmentStats, setAssessmentStats] = useState<{ count: number; completionRate: number }>({ count: 0, completionRate: 0 });
  const [monitoringItems, setMonitoringItems] = useState<MonitoringItem[]>([]);

  const loadDashboardData = async () => {
    const wsId = workspace?.id;
    console.log('[Dashboard] ==> WORKSPACE DEBUG <==');
    console.log('[Dashboard] workspace object:', workspace);
    console.log('[Dashboard] workspace.id:', wsId);
    console.log('[Dashboard] workspace.customerId:', workspace?.customerId);
    console.log('[Dashboard] user:', user);
    console.log('[Dashboard] ==> END WORKSPACE DEBUG <==');
    
    if (!wsId) {
      console.error('[Dashboard] No workspace ID available, cannot load assessments');
      setLoadingData(false);
      return;
    }
    
    setLoadingData(true);
    try {
      // Fetch dashboard data via API route (now includes assessments)
      console.log('[Dashboard] Fetching dashboard data for workspace:', wsId);
      const dashboardRes = await fetch(`/api/dashboard?workspaceId=${wsId}`, { credentials: 'include' });
      
      if (!dashboardRes.ok) {
        const errorText = await dashboardRes.text();
        console.error('[Dashboard] API error response:', errorText);
        throw new Error(`Dashboard fetch error ${dashboardRes.status}`);
      }
      
      const dashboardJson = await dashboardRes.json();
      console.log('[Dashboard] dashboard API response:', dashboardJson);

      // Extract assessment stats from the API response
      const stats = dashboardJson.stats || { totalAssessments: 0, completedAssessments: 0, completionRate: 0 };
      console.log('[Dashboard] Assessment stats from API:', stats);
      
      setAssessmentStats({ 
        count: stats.totalAssessments, 
        completionRate: stats.completionRate 
      });

      // Transform dashboard data for other components
      const frameworkStatus = dashboardJson.frameworks?.map((f: any) => ({
        id: f.id,
        name: f.name,
        status: f.status || 'pending',
        progress: f.progress || 0,
        lastUpdated: f.lastUpdated || new Date().toISOString(),
      })) || [];

      const recentActivities = dashboardJson.recentActivities?.map((a: any) => ({
        id: a.id,
        type: a.type || 'assessment',
        title: a.title || 'Activity',
        description: a.description || '',
        timestamp: a.timestamp || new Date().toISOString(),
        status: a.status || 'pending',
      })) || [];

      const pendingTasks = dashboardJson.pendingTasks?.map((t: any) => ({
        id: t.id,
        title: t.title || 'Task',
        description: t.description || '',
        priority: t.priority || 'medium',
        dueDate: t.dueDate || new Date().toISOString(),
        assignee: t.assignee || 'Unassigned',
      })) || [];

      const riskSummary = dashboardJson.riskSummary?.map((r: any) => ({
        id: r.id,
        category: r.category || 'General',
        level: r.level || 'medium',
        count: r.count || 0,
        trend: 0,
      })) || [];

      const verificationSummary = dashboardJson.verificationSummary || {
        total: 0,
        completed: 0,
        pending: 0,
        failed: 0,
        completionRate: 0,
        trend: 0,
      };
      
      setDashboardData({ frameworkStatus, recentActivities, pendingTasks, riskSummary, verificationSummary });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setAssessmentStats({ count: 0, completionRate: 0 });
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
      await updateMonitoringPointStatusAction(taskId, MonitoringStatus.Compliant);
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
        <div 
          className="bg-white rounded-lg shadow p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200 border-l-4 border-blue-500" 
          onClick={() => router.push('/customer/assessments')}
          title="View all ongoing assessments"
        >
          <h3 className="text-sm font-medium text-gray-500">Total Assessments</h3>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold">{assessmentStats.count}</p>
            <span className="text-blue-500 text-sm">View all →</span>
          </div>
        </div>
        <div 
          className="bg-white rounded-lg shadow p-4 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors duration-200 border-l-4 border-green-500" 
          onClick={() => router.push('/customer/assessments')}
          title="View ongoing assessments"
        >
          <div className="mr-3">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Completion Rate</h3>
            <span className="text-blue-500 text-sm">View details →</span>
          </div>
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
            onStatusUpdate={async (id, status) => { try { await updateMonitoringPointStatusAction(id, status); await loadDashboardData(); } catch {} }}
            onDelete={async (id) => { try { await deleteMonitoringPointAction(id); await loadDashboardData(); } catch {} }}
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
