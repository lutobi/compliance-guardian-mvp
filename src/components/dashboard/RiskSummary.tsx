'use client';

import React from 'react';
import { RiskSummaryItem } from '@/types/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, AlertOctagon, AlertCircle, Info } from 'lucide-react';

interface RiskSummaryProps {
  data?: RiskSummaryItem[];
}

export function RiskSummary({ data = [] }: RiskSummaryProps) {
  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return <AlertOctagon className="h-5 w-5 text-red-600" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'medium':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'low':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'high':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'low':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Risk Assessment</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="space-y-4">
            {data.map((item) => (
              <div key={`${item.category}-${item.level}`} className={`p-4 rounded-lg border ${getRiskColor(item.level)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getRiskIcon(item.level)}
                    <span className="font-medium">{item.category}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{item.count} issues</span>
                    <div className="bg-white px-2 py-1 rounded-full text-xs font-medium">
                      {item.percentage}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-60 text-gray-500">
            <AlertCircle className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium">No risk data available</p>
            <p className="text-sm">Risk assessment data will appear here once available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
