import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ControlVerification } from '@/utils/control-verification';
import { EnhancedControl } from '@/types/enhanced-framework';

interface CoverageAnalysisProps {
  implementedControls: EnhancedControl[];
  frameworkName: string;
}

export const CoverageAnalysis: React.FC<CoverageAnalysisProps> = ({
  implementedControls,
  frameworkName
}) => {
  if (!implementedControls || !frameworkName) {
    return (
      <Card className="p-6">
        <p className="text-gray-600">No framework data available for analysis.</p>
      </Card>
    );
  }

  let coverage;
  try {
    coverage = ControlVerification.verifyFrameworkCoverage(
    implementedControls,
    frameworkName
  );
  } catch (error) {
    console.error('Coverage analysis error:', error);
    return (
      <Card className="p-6">
        <p className="text-red-600">Unable to analyze framework coverage. Please ensure the framework data is correctly formatted.</p>
      </Card>
    );
  }

  const priorities = ControlVerification.getImplementationPriorities(coverage);

  return (
    <div className="space-y-6">
      {/* Overall Coverage */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Framework Coverage</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span>Overall Coverage</span>
              <span>{coverage.coverage.toFixed(2)}%</span>
            </div>
            <Progress value={Math.max(0, Math.min(100, coverage.coverage ?? 0))} className="w-full" />
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium">Total Controls</h3>
              <p className="text-2xl font-bold">{coverage.totalControls ?? 0}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium">Implemented</h3>
              <p className="text-2xl font-bold">{coverage.implementedControls ?? 0}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <h3 className="font-medium">Missing</h3>
              <p className="text-2xl font-bold">{coverage.missingControls?.length ?? 0}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Missing Controls */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Missing Controls</h2>
        <div className="space-y-2">
          {(coverage.missingControls ?? []).map(controlId => (
            <div 
              key={controlId}
              className="p-3 bg-red-50 text-red-700 rounded-lg"
            >
              {controlId}
            </div>
          ))}
        </div>
      </Card>

      {/* Control Details */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Control Details</h2>
        <div className="space-y-4">
          {Object.entries(coverage.details ?? {}).map(([controlId, detail]) => (
            <div key={controlId} className="border-b pb-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">{controlId}</h3>
                  <p className="text-sm text-gray-600">
                    Sub-Controls Coverage: {detail.subControlsCoverage.toFixed(2)}%
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full ${
                  detail.implemented ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {detail.implemented ? 'Implemented' : 'Missing'}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <p className="text-sm text-gray-600">Monitoring Points</p>
                  <p className="font-medium">{detail.monitoringPoints}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Evidence Requirements</p>
                  <p className="font-medium">{detail.evidenceRequirements}</p>
                </div>
              </div>

              {detail.missingSubControls.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-red-600">Missing Sub-Controls:</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {detail.missingSubControls.map(subId => (
                      <span 
                        key={subId}
                        className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-sm"
                      >
                        {subId}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Implementation Priorities */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Implementation Priorities</h2>
        <div className="space-y-2">
          {(priorities ?? []).map((priority, index) => (
            <div 
              key={index}
              className="p-3 bg-yellow-50 text-yellow-700 rounded-lg"
            >
              {priority}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
