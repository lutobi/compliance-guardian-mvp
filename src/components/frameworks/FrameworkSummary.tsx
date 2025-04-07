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
    <Card>
      <CardHeader>
        <CardTitle>Framework Implementation Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Main Progress Ring with Stats */}
          <div className="flex items-center justify-center space-x-12">
            <div className="text-center">
              <ProgressRing
                value={overallProgress}
                size={120}
                strokeWidth={8}
                showPercentage
                className="mb-2"
              />
              <p className="text-sm text-muted-foreground">Overall Progress</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <p className="text-sm text-blue-600">Total Controls</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.implemented}</div>
                <p className="text-sm text-green-600">Implemented</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
                <p className="text-sm text-yellow-600">In Progress</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{stats.notImplemented}</div>
                <p className="text-sm text-red-600">Not Started</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Implementation Progress</span>
              <span className="font-medium">{overallProgress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>

          {/* Subcontrols and Evidence */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-4">
              <ProgressRing
                value={subControlProgress}
                size={60}
                strokeWidth={4}
                showPercentage
              />
              <div>
                <p className="font-medium">{stats.subControlStats.completed} / {stats.subControlStats.total}</p>
                <p className="text-sm text-muted-foreground">Subcontrols Complete</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-[60px] w-[60px] rounded-full bg-blue-50 flex items-center justify-center text-xl font-bold text-blue-600">
                {controls.filter(c => (c.evidence || []).length > 0).length}
              </div>
              <div>
                <p className="font-medium">{controls.reduce((sum, c) => sum + ((c.evidence || []).length), 0)} Items</p>
                <p className="text-sm text-muted-foreground">Total Evidence</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
