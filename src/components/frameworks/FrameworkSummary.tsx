'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressRing } from '@/components/ui/progress-ring';
import { Control, ControlStatus } from '@/types/framework';

interface FrameworkSummaryProps {
  controls: Control[];
}

interface ControlStats {
  total: number;
  implemented: number;
  inProgress: number;
  notImplemented: number;
  subControlStats: {
    total: number;
    completed: number;
  };
}

export function FrameworkSummary({ controls }: FrameworkSummaryProps) {
  const stats = useMemo(() => {
    const initialStats: ControlStats = {
      total: 0,
      implemented: 0,
      inProgress: 0,
      notImplemented: 0,
      subControlStats: {
        total: 0,
        completed: 0
      }
    };

    return controls.reduce((acc, control) => {
      // Count main control
      acc.total++;
      switch (control.status) {
        case 'implemented':
          acc.implemented++;
          break;
        case 'in-progress':
          acc.inProgress++;
          break;
        case 'not-started':
        default:
          acc.notImplemented++;
          break;
      }

      // Count subcontrols
      if (control.subcontrols) {
        acc.subControlStats.total += control.subcontrols.length;
        acc.subControlStats.completed += control.subcontrols.filter(
          sub => sub.status === 'implemented'
        ).length;
      }

      return acc;
    }, initialStats);
  }, [controls]);

  const overallProgress = Math.round(
    ((stats.implemented + stats.inProgress * 0.5) / stats.total) * 100
  );

  const subControlProgress = Math.round(
    (stats.subControlStats.completed / stats.subControlStats.total) * 100
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
          <ProgressRing
            value={overallProgress}
            size={40}
            strokeWidth={4}
            showPercentage
          />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">Total Controls</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Implementation Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm">Implemented</div>
              <div className="font-medium">{stats.implemented}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm">In Progress</div>
              <div className="font-medium">{stats.inProgress}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm">Not Implemented</div>
              <div className="font-medium">{stats.notImplemented}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Subcontrol Progress</CardTitle>
          <ProgressRing
            value={subControlProgress}
            size={40}
            strokeWidth={4}
            showPercentage
          />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.subControlStats.completed}</div>
          <p className="text-xs text-muted-foreground">
            of {stats.subControlStats.total} Subcontrols Complete
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Evidence Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm">Controls with Evidence</div>
              <div className="font-medium">
                {controls.filter(c => (c.evidence || []).length > 0).length}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm">Total Evidence Items</div>
              <div className="font-medium">
                {controls.reduce((sum, c) => sum + ((c.evidence || []).length), 0)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
