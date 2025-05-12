import React from 'react';
import { FrameworkMonitoring, MonitoringStatus } from '@/types/monitoring';

interface MonitoredControl {
  id: string;
  control: {
    id: string;
    name: string;
    category: string;
  };
}

interface Framework {
  id: string;
  name: string;
  description?: string;
  slug: string;
}

interface MonitoringItem {
  id: string;
  status: MonitoringStatus;
  framework: Framework;
  monitoredControls: MonitoredControl[];
}

interface MonitoringListProps {
  monitoringData: MonitoringItem[];
  onStatusUpdate: (id: string, status: MonitoringStatus) => void;
  onDelete: (id: string) => void;
}

export function MonitoringList({ monitoringData, onStatusUpdate, onDelete }: MonitoringListProps) {
  if (!monitoringData || monitoringData.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No monitoring data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {monitoringData.map((item) => (
        <div key={item.id} className="bg-white border rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">{item.framework.name}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {item.monitoredControls?.length || 0} controls being monitored
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onStatusUpdate(item.id, item.status === MonitoringStatus.Compliant ? MonitoringStatus.NonCompliant : MonitoringStatus.Compliant)}
                className={`px-3 py-1 text-sm rounded ${
                  item.status === MonitoringStatus.Compliant
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {item.status === MonitoringStatus.Compliant ? 'Compliant' : 'Non-Compliant'}
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200"
              >
                Delete
              </button>
            </div>
          </div>
          
          {item.monitoredControls && item.monitoredControls.length > 0 && (
            <div className="mt-4 border-t pt-4">
              <h4 className="text-sm font-semibold mb-2">Monitored Controls</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {item.monitoredControls.map((control) => (
                  <div key={control.id} className="text-sm bg-gray-50 p-3 rounded">
                    <div className="font-medium">{control.control.name}</div>
                    <div className="text-gray-600 mt-1">{control.control.category}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
