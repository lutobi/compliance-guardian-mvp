import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { EnhancedControl, MonitoringPoint } from '@/types/enhanced-framework';
import { MonitoringService } from '@/services/monitoring';

interface ControlMonitoringProps {
  control: EnhancedControl;
}

export const ControlMonitoring: React.FC<ControlMonitoringProps> = ({ control }) => {
  const [monitoringStatus, setMonitoringStatus] = useState<any[]>([]);
  const monitoringService = MonitoringService.getInstance();

  useEffect(() => {
    // Start monitoring when component mounts
    monitoringService.startMonitoring(control);

    // Set up status update interval
    const interval = setInterval(() => {
      const status = monitoringService.getStatus(control);
      setMonitoringStatus(status);
    }, 60000); // Update every minute

    return () => {
      // Clean up when component unmounts
      monitoringService.stopMonitoring(control);
      clearInterval(interval);
    };
  }, [control]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-800';
      case 'non-compliant':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Header */}
      <Card className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold">{control.title}</h2>
            <p className="text-sm text-gray-600">{control.id}</p>
          </div>
          <div className={`px-3 py-1 rounded-full ${getStatusColor(control.status)}`}>
            {control.status}
          </div>
        </div>
        <p className="mt-4 text-gray-700">{control.description}</p>
      </Card>

      {/* Monitoring Points */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Monitoring Status</h3>
        <div className="space-y-4">
          {control.monitoringPoints.map((point, index) => {
            const status = monitoringStatus.find(s => s.metric === point.metric);
            return (
              <div key={index} className="border-b pb-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">{point.metric}</p>
                    <p className="text-sm text-gray-600">
                      {point.type} • {point.frequency}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full ${
                    getStatusColor(status?.status || 'unknown')
                  }`}>
                    {status?.status || 'Unknown'}
                  </div>
                </div>
                {point.threshold && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-1">
                      Target: {point.threshold}
                    </p>
                    <Progress 
                      value={
                        status?.value ? 
                        parseInt(status.value.replace('%', '')) : 
                        0
                      } 
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Evidence Requirements */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Evidence Collection</h3>
        <div className="space-y-4">
          {control.evidenceRequirements?.required?.map((evidence, index) => (
            <div key={index} className="flex justify-between items-center border-b pb-4">
              <div>
                <p className="font-medium">{evidence.description}</p>
                <p className="text-sm text-gray-600">
                  {evidence.type} • {evidence.frequency}
                </p>
              </div>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                Upload Evidence
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Sub-Controls */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Sub-Controls</h3>
        <div className="space-y-4">
          {control.subControls.map((subControl, index) => (
            <div key={index} className="border-b pb-4">
              <p className="font-medium">{subControl.title}</p>
              <p className="text-sm text-gray-600 mb-2">{subControl.description}</p>
              <div className="flex flex-wrap gap-2">
                {subControl.requirements.map((req, reqIndex) => (
                  <span 
                    key={reqIndex}
                    className="px-2 py-1 bg-gray-100 rounded-full text-sm"
                  >
                    {req}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
