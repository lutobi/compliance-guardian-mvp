import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ComplianceStatusProps {
  control: {
    id: string;
    title: string;
    status: 'implemented' | 'in-progress' | 'not-started' | 'not-applicable';
    evidenceCount: number;
    requiredEvidenceCount: number;
    lastReviewDate?: string;
    nextReviewDate?: string;
    assignedTo?: string;
  };
}

export const ComplianceStatus: React.FC<ComplianceStatusProps> = ({ control }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'implemented':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'not-started':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const evidenceProgress = Math.round(
    (control.evidenceCount / control.requiredEvidenceCount) * 100
  );

  return (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-medium">{control.id}</h3>
          <p className="text-sm text-gray-600">{control.title}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(control.status)}`}>
          {control.status.replace('-', ' ')}
        </span>
      </div>

      <div className="space-y-4">
        {/* Evidence Progress */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Evidence Collection</span>
            <span>{control.evidenceCount} / {control.requiredEvidenceCount}</span>
          </div>
          <Progress value={evidenceProgress} className="w-full" />
        </div>

        {/* Review Dates */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {control.lastReviewDate && (
            <div>
              <p className="text-gray-600">Last Review</p>
              <p>{new Date(control.lastReviewDate).toLocaleDateString()}</p>
            </div>
          )}
          {control.nextReviewDate && (
            <div>
              <p className="text-gray-600">Next Review</p>
              <p>{new Date(control.nextReviewDate).toLocaleDateString()}</p>
            </div>
          )}
        </div>

        {/* Assigned To */}
        {control.assignedTo && (
          <div className="text-sm">
            <p className="text-gray-600">Assigned To</p>
            <p>{control.assignedTo}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <button className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            Update Status
          </button>
          <button className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Add Evidence
          </button>
        </div>
      </div>
    </Card>
  );
};
