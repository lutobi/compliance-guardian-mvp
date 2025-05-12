'use client';

import { useAuth } from '@/lib/auth/context';
import { useCustomerWorkspace } from '@/lib/workspace/customer-context';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function CustomerDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, isCustomerUser, isSystemUser } = useAuth();
  const { workspace, loading: workspaceLoading } = useCustomerWorkspace();

  useEffect(() => {
    if (!authLoading && !workspaceLoading) {
      if (!isCustomerUser && !isSystemUser) {
        router.replace('/auth/login');
      } else if (!workspace && isCustomerUser) {
        router.replace('/customer/select-workspace');
      }
    }
  }, [authLoading, workspaceLoading, isCustomerUser, isSystemUser, workspace, router]);

  if (authLoading || workspaceLoading) {
    return <div>Loading...</div>;
  }
  if (!(isCustomerUser || isSystemUser) || !workspace) {
    return null;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        {workspace.name} Dashboard
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <ul className="space-y-2">
            <li>
              <a href="/dashboard/assessments/new" className="text-blue-600 hover:underline">
                Start New Assessment
              </a>
            </li>
            <li>
              <a href="/customer/documents" className="text-blue-600 hover:underline">
                Upload Documents
              </a>
            </li>
            <li>
              <a href="/dashboard/assessments" className="text-blue-600 hover:underline">
                View Ongoing Assessments
              </a>
            </li>
            <li>
              <a href="/monitoring" className="text-blue-600 hover:underline">
                View Monitoring Status
              </a>
            </li>
          </ul>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {/* Add recent activity items here */}
            <p className="text-gray-600">No recent activity</p>
          </div>
        </div>

        {/* Compliance Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Compliance Status</h2>
          <div className="space-y-4">
            {/* Add compliance status items here */}
            <p className="text-gray-600">No active compliance frameworks</p>
          </div>
        </div>
      </div>
    </div>
  );
}
