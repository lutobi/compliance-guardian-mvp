'use client';

import { FrameworkComparison } from '@/types/comparison';
import { Card } from '../ui/card';
import { CheckCircle2, Clock, FileText, Users } from 'lucide-react';

interface RequirementsComparisonProps {
  comparison: FrameworkComparison;
}

export function RequirementsComparison({ comparison }: RequirementsComparisonProps) {
  const requirements = [
    {
      category: 'Documentation',
      items: [
        {
          title: 'Policy Documents',
          source: 'Required',
          target: 'Required',
          icon: FileText,
        },
        {
          title: 'Procedures',
          source: 'Required',
          target: 'Required',
          icon: FileText,
        },
        {
          title: 'Records',
          source: 'Required',
          target: 'Optional',
          icon: FileText,
        },
      ],
    },
    {
      category: 'Implementation',
      items: [
        {
          title: 'Timeline',
          source: '3-6 months',
          target: '4-8 months',
          icon: Clock,
        },
        {
          title: 'Team Size',
          source: '3-5 people',
          target: '4-6 people',
          icon: Users,
        },
        {
          title: 'Verification',
          source: 'Self-assessment',
          target: 'Third-party audit',
          icon: CheckCircle2,
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Implementation Requirements */}
      {requirements.map((category) => (
        <Card key={category.category} className="p-6">
          <h3 className="text-lg font-semibold mb-4">{category.category} Requirements</h3>
          <div className="space-y-4">
            {category.items.map((item) => (
              <div key={item.title} className="grid md:grid-cols-3 gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <item.icon className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">{item.title}</span>
                </div>
                <div className="grid grid-cols-2 md:col-span-2 gap-4">
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="text-sm text-gray-500">{comparison.sourceFramework.name}</div>
                    <div>{item.source}</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="text-sm text-gray-500">{comparison.targetFramework.name}</div>
                    <div>{item.target}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}

      {/* Scope Differences */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Scope Differences</h3>
        <div className="space-y-3">
          {comparison.differences.scopeDifferences.map((difference) => (
            <div
              key={difference}
              className="p-3 bg-yellow-50 text-yellow-800 rounded-lg"
            >
              {difference}
            </div>
          ))}
        </div>
      </Card>

      {/* Implementation Checklist */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Implementation Checklist</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span>Review and document current controls</span>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span>Identify gaps and create action plan</span>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span>Implement new controls and procedures</span>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span>Train staff on new requirements</span>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span>Conduct internal audit</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
