import { Suspense } from 'react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CustomerStats } from './components/CustomerStats';
import { FrameworkUsage } from './components/FrameworkUsage';
import { SystemHealth } from './components/SystemHealth';
import { RecentActivity } from './components/RecentActivity';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SystemDashboard() {
  const supabase = createServerComponentClient({ cookies });

  const { data: stats } = await supabase
    .from('system_stats')
    .select('*')
    .single();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">System Dashboard</h1>
        <Link href="/system/workspaces/new">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Create Workspace
          </button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Customers</CardTitle>
            <CardDescription>Active organizations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.total_customers || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Users</CardTitle>
            <CardDescription>Across all customers</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.active_users || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Frameworks</CardTitle>
            <CardDescription>Total compliance frameworks</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.total_frameworks || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Overall system status</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-500">98.5%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<div>Loading customer stats...</div>}>
          <CustomerStats />
        </Suspense>
        <Suspense fallback={<div>Loading framework usage...</div>}>
          <FrameworkUsage />
        </Suspense>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<div>Loading system health...</div>}>
          <SystemHealth />
        </Suspense>
        <Suspense fallback={<div>Loading recent activity...</div>}>
          <RecentActivity />
        </Suspense>
      </div>
    </div>
  );
}
