'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function DashboardPage() {
  const { user, loading } = useAuth();

  // Return early if loading
  if (loading) {
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
          <h1 className="text-3xl font-bold">Welcome back, {user.name || user.email}</h1>
          <p className="mt-2 text-gray-600">
            Here's an overview of your compliance status
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Framework Status Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Framework Status</h2>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>ISO 27001</span>
                <span className="px-2 py-1 text-sm rounded bg-green-100 text-green-800">
                  85% Complete
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>NIST CSF</span>
                <span className="px-2 py-1 text-sm rounded bg-yellow-100 text-yellow-800">
                  60% Complete
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="text-sm text-gray-600">Today</p>
                <p>Updated access control policy</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="text-sm text-gray-600">Yesterday</p>
                <p>Completed risk assessment</p>
              </div>
            </div>
          </div>

          {/* Tasks Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Pending Tasks</h2>
            <div className="space-y-2">
              <div className="flex items-center">
                <input type="checkbox" className="mr-3" />
                <span>Review incident response plan</span>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="mr-3" />
                <span>Update security training materials</span>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="mr-3" />
                <span>Schedule vulnerability assessment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
