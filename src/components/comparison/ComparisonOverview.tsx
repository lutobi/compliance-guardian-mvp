'use client';

import { FrameworkComparison } from '@/types/comparison';
import { Card } from '../ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface ComparisonOverviewProps {
  comparison: FrameworkComparison;
}

export function ComparisonOverview({ comparison }: ComparisonOverviewProps) {
  const chartData = [
    {
      name: comparison.sourceFramework.name,
      total: comparison.statistics.totalControls.source,
      unique: comparison.statistics.totalControls.source - comparison.statistics.totalControls.common,
    },
    {
      name: comparison.targetFramework.name,
      total: comparison.statistics.totalControls.target,
      unique: comparison.statistics.totalControls.target - comparison.statistics.totalControls.common,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Similarity Score</h3>
          <p className="text-3xl font-bold text-blue-600">
            {Math.round(comparison.statistics.similarityScore * 100)}%
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Common Controls</h3>
          <p className="text-3xl font-bold text-green-600">
            {comparison.statistics.totalControls.common}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Implementation</h3>
          <p className="text-xl font-medium">
            {comparison.statistics.implementationEstimate.timelineMonths} months
          </p>
          <p className="text-sm text-gray-600 capitalize">
            {comparison.statistics.implementationEstimate.complexity} complexity
          </p>
        </Card>
      </div>

      {/* Visual Comparison */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Control Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#3b82f6" name="Total Controls" />
              <Bar dataKey="unique" fill="#ef4444" name="Unique Controls" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Shared Elements */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Common Categories</h3>
          <div className="space-y-2">
            {(comparison.similarities.commonCategories || []).filter(Boolean).map((category) => (
              <div
                key={category}
                className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg"
              >
                {category}
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Shared Objectives</h3>
          <div className="space-y-2">
            {(comparison.similarities.sharedObjectives || []).filter(Boolean).map((objective) => (
              <div
                key={objective}
                className="px-3 py-2 bg-green-50 text-green-700 rounded-lg"
              >
                {objective}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
