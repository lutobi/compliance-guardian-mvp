'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { monitoringService } from '@/services/MonitoringService';
import { MonitoringStatus } from '@/types/monitoring';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [frameworkStatus, setFrameworkStatus] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Get active monitoring data
        const monitoringData = await monitoringService.getActiveMonitoring();
        
        // Calculate framework status
        const frameworkStats = {};
        monitoringData.forEach(monitoring => {
          const compliantCount = monitoring.controls.filter(
            c => c.status === 'compliant' // Using string literal instead of enum
          ).length;
          const totalControls = monitoring.controls.length;
          const complianceRate = totalControls > 0 
            ? Math.round((compliantCount / totalControls) * 100) 
            : 0;
          
          frameworkStats[monitoring.framework.id] = {
            name: monitoring.framework.name,
            complianceRate,
            totalControls,
            compliantCount
          };
        });

        // Get recent activity
        const recentActivityData = await monitoringService.getMonitoringMetrics(
          monitoringData[0]?.id || '',
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          new Date()
        );

        // Get pending tasks
        const pendingTasksData = monitoringData.flatMap(monitoring =>
          monitoring.controls
            .filter(c => c.status === 'pending') // Using string literal instead of enum
            .map(control => ({
              id: control.id,
              name: control.control.name,
              description: control.control.description,
              category: control.control.category,
              framework: monitoring.framework.name
            }))
        );

        setFrameworkStatus(Object.values(frameworkStats));
        setRecentActivity(recentActivityData.slice(0, 5));
        setPendingTasks(pendingTasksData.slice(0, 5));
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadDashboardData();
  }, []);

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
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome back, {user.email}</h1>
          <p className="mt-2 text-gray-600">
            Here's an overview of your compliance status
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Framework Status Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Framework Status</h2>
            <div className="space-y-2">
              {frameworkStatus.map((framework) => (
                <div key={framework.name} className="flex justify-between items-center">
                  <span>{framework.name}</span>
                  <span className={`px-2 py-1 text-sm rounded ${
                    framework.complianceRate >= 80 
                      ? 'bg-green-100 text-green-800'
                      : framework.complianceRate >= 60 
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                  >
                    {framework.compliantCount}/{framework.totalControls} ({framework.complianceRate}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="border-l-4 border-blue-500 pl-4">
                  <p className="text-sm text-gray-600">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </p>
                  <p>{activity.name}: {activity.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Pending Tasks</h2>
            <div className="space-y-2">
              {pendingTasks.map((task) => (
                <div key={task.id} className="flex items-center">
                  <input type="checkbox" className="mr-3" />
                  <span>{task.name}</span>
                  <span className="ml-2 text-sm text-gray-600">{task.framework}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
