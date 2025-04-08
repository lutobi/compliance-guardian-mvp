'use client';

import React from 'react';
import { VerificationSummary as VerificationSummaryType } from '@/types/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

interface VerificationSummaryProps {
  data?: VerificationSummaryType;
}

const defaultData: VerificationSummaryType = {
  total: 0,
  passed: 0,
  pending: 0,
  failed: 0,
  completionRate: 0
};

export function VerificationSummary({ data = defaultData }: VerificationSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Verification Status</CardTitle>
      </CardHeader>
      <CardContent>
        {data.total > 0 ? (
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Completion Progress</span>
                <span className="font-medium">{data.completionRate}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 transition-all duration-500"
                  style={{ width: `${data.completionRate}%` }}
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <p className="text-xs text-green-600">Passed</p>
                  <p className="font-medium text-green-700">{data.passed}</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                <div>
                  <p className="text-xs text-yellow-600">Pending</p>
                  <p className="font-medium text-yellow-700">{data.pending}</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-red-50 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600 mr-2" />
                <div>
                  <p className="text-xs text-red-600">Failed</p>
                  <p className="font-medium text-red-700">{data.failed}</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                <div className="h-5 w-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">
                  Σ
                </div>
                <div>
                  <p className="text-xs text-blue-600">Total</p>
                  <p className="font-medium text-blue-700">{data.total}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-60 text-gray-500">
            <AlertCircle className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium">No verification data available</p>
            <p className="text-sm">Verification status will appear here once available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
