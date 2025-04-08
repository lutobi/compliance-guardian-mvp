'use client';

import React from 'react';
import { FrameworkStatusItem } from '@/types/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertCircle } from 'lucide-react';

interface ComplianceChartProps {
  data?: FrameworkStatusItem[];
}

export function ComplianceChart({ data = [] }: ComplianceChartProps) {
  const chartData = data?.map(item => ({
    name: item.name,
    rate: item.complianceRate,
    trend: item.trend || 0,
  })) || [];

  const getBarColor = (rate: number) => {
    if (rate >= 80) return '#22c55e'; // green-500
    if (rate >= 60) return '#eab308'; // yellow-500
    return '#ef4444'; // red-500
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Framework Compliance</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 60,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={60}
                  interval={0}
                />
                <YAxis 
                  label={{ value: 'Compliance Rate (%)', angle: -90, position: 'insideLeft' }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, 'Compliance Rate']}
                  labelFormatter={(name) => `Framework: ${name}`}
                />
                <Bar dataKey="rate" name="Compliance Rate">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.rate)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-80 text-gray-500">
            <AlertCircle className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium">No compliance data available</p>
            <p className="text-sm">Framework data will appear here once available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
