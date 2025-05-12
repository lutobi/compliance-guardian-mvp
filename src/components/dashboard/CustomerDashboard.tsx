import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useWorkspace } from '@/lib/workspace/context';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ComplianceStatus } from './ComplianceStatus';
import { MonitoringOverview } from './MonitoringOverview';
import { TeamActivity } from './TeamActivity';
import { UpcomingTasks } from './UpcomingTasks';

export function CustomerDashboard() {
  const { user } = useAuth();
  const { workspace } = useWorkspace();
  const [stats, setStats] = useState({
    compliance_score: 0,
    total_controls: 0,
    active_tasks: 0,
    team_members: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      const response = await fetch('/api/customer/stats');
      const data = await response.json();
      setStats(data);
    };
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Welcome back, {user?.name}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Compliance Score</CardTitle>
            <CardDescription>Overall compliance status</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-500">
              {stats.compliance_score}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Controls</CardTitle>
            <CardDescription>Total compliance controls</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total_controls}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Tasks</CardTitle>
            <CardDescription>Tasks requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.active_tasks}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Active team size</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.team_members}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ComplianceStatus />
        <MonitoringOverview />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <TeamActivity />
        <UpcomingTasks />
      </div>
    </div>
  );
}
