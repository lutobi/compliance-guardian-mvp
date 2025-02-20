import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { EnhancedControl, MonitoringPoint } from '@/types/enhanced-framework';

interface MonitoringDashboardProps {
  controls: EnhancedControl[];
}

export const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({ controls }) => {
  // Calculate compliance metrics
  const calculateCompliance = () => {
    const total = controls.length;
    const compliant = controls.filter(c => c.status === 'implemented').length;
    return Math.round((compliant / total) * 100);
  };

  // Group monitoring points by type
  const groupedMonitoringPoints = controls.reduce((acc, control) => {
    control.monitoringPoints.forEach(point => {
      if (!acc[point.type]) acc[point.type] = [];
      acc[point.type].push({ control: control.id, ...point });
    });
    return acc;
  }, {} as Record<string, (MonitoringPoint & { control: string })[]>);

  return (
    <div className="space-y-6">
      {/* Overall Compliance */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Overall Compliance</h2>
        <div className="space-y-2">
          <Progress value={calculateCompliance()} className="w-full" />
          <p className="text-sm text-gray-600">
            {calculateCompliance()}% of controls are compliant
          </p>
        </div>
      </Card>

      {/* Monitoring Status */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Monitoring Status</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium">Automated</h3>
            <p className="text-2xl font-bold">
              {groupedMonitoringPoints['automated']?.length || 0}
            </p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-medium">Semi-Automated</h3>
            <p className="text-2xl font-bold">
              {groupedMonitoringPoints['semi-automated']?.length || 0}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium">Manual</h3>
            <p className="text-2xl font-bold">
              {groupedMonitoringPoints['manual']?.length || 0}
            </p>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {controls.slice(0, 5).map(control => (
            <div key={control.id} className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="font-medium">{control.title}</p>
                <p className="text-sm text-gray-600">{control.id}</p>
              </div>
              <div className={`px-3 py-1 rounded-full ${
                control.status === 'implemented' ? 'bg-green-100 text-green-800' :
                control.status === 'not-applicable' ? 'bg-gray-100 text-gray-800' :
                control.status === 'not-started' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {control.status}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Action Items */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Required Actions</h2>
        <div className="space-y-4">
          {controls
            .filter(c => c.status !== 'implemented')
            .slice(0, 3)
            .map(control => (
              <div key={control.id} className="flex items-center justify-between py-2 border-b">
                <div>
                  <p className="font-medium">{control.title}</p>
                  <p className="text-sm text-gray-600">
                    Action required: Review and update
                  </p>
                </div>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                  Take Action
                </button>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
};
