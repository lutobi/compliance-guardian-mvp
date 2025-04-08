'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { monitoringService } from '@/services/MonitoringService';
import { DashboardData, FrameworkStatusItem, RecentActivityItem, PendingTaskItem, RiskSummaryItem, VerificationSummary } from '@/types/dashboard';
import { ComplianceChart } from '@/components/dashboard/ComplianceChart';
import { RiskSummary } from '@/components/dashboard/RiskSummary';
import { VerificationSummary as VerificationSummaryComponent } from '@/components/dashboard/VerificationSummary';
import { ActivityList } from '@/components/dashboard/ActivityList';
import { TaskList } from '@/components/dashboard/TaskList';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    frameworkStatus: [],
    recentActivity: [],
    pendingTasks: [],
    riskSummary: [],
    verificationSummary: {
      total: 0,
      passed: 0,
      pending: 0,
      failed: 0,
      completionRate: 0
    },
    lastUpdated: new Date().toISOString()
  });
  const [loadingData, setLoadingData] = useState(true);

  const loadDashboardData = async () => {
    setLoadingData(true);
    try {
      // Get active monitoring data
      const monitoringData = await monitoringService.getActiveMonitoring();
      
      // Calculate framework status
      const frameworkStats: FrameworkStatusItem[] = [];
      monitoringData.forEach(monitoring => {
        const compliantCount = monitoring.controls.filter(
          c => c.status === 'compliant'
        ).length;
        const totalControls = monitoring.controls.length;
        const complianceRate = totalControls > 0 
          ? Math.round((compliantCount / totalControls) * 100) 
          : 0;
        
        frameworkStats.push({
          id: monitoring.framework.id,
          name: monitoring.framework.name,
          complianceRate,
          totalControls,
          compliantCount,
          trend: Math.floor(Math.random() * 10) - 5 // Random trend for demo purposes
        });
      });

      // Get recent activities
      const recentActivityData = await monitoringService.getRecentActivities(10);

      // Get pending tasks
      const pendingTasksData = await monitoringService.getPendingTasks(10);

      // Get risk assessment data
      const riskData = await monitoringService.getRiskAssessment();

      // Get verification summary
      const verificationData = await monitoringService.getVerificationSummary();

      setDashboardData({
        frameworkStatus: frameworkStats,
        recentActivity: recentActivityData,
        pendingTasks: pendingTasksData,
        riskSummary: riskData,
        verificationSummary: verificationData,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Handle task completion
  const handleTaskComplete = async (taskId: string) => {
    try {
      await monitoringService.updateControlStatus(
        dashboardData.pendingTasks.find(task => task.id === taskId)?.frameworkId || '',
        taskId,
        'compliant'
      );
      // Refresh dashboard data after a short delay
      setTimeout(() => {
        loadDashboardData();
      }, 500);
    } catch (error) {
      console.error('Error completing task:', error);
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

  // Return early if loading
  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Return early if no user
  if (!user) {
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
    return null;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <DashboardHeader
          lastUpdated={dashboardData.lastUpdated}
          isLoading={loadingData}
          onRefresh={loadDashboardData}
          onExport={handleExport}
        />

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome back, {user.email}</h1>
          <p className="mt-2 text-gray-600">
            Here's an overview of your compliance status
          </p>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Compliance Chart - Takes 2 columns */}
          <ComplianceChart data={dashboardData.frameworkStatus} />

          {/* Risk Summary */}
          <RiskSummary data={dashboardData.riskSummary} />

          {/* Verification Summary */}
          <VerificationSummaryComponent data={dashboardData.verificationSummary} />
        </div>

        {/* Secondary Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Activity List */}
          <ActivityList 
            data={dashboardData.recentActivity} 
            onViewMore={() => router.push('/activity')}
          />

          {/* Task List */}
          <TaskList 
            data={dashboardData.pendingTasks} 
            onViewMore={() => router.push('/tasks')}
            onTaskComplete={handleTaskComplete}
          />
        </div>
      </div>
    </div>
  );
}
