'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { setupA92Monitoring, getA92ComplianceStatus } from '@/examples/iso27001/access-control/setup-a92-monitoring';

export default function A92Dashboard() {
  const [complianceData, setComplianceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        await setupA92Monitoring();
        const data = await getA92ComplianceStatus();
        setComplianceData(data);
      } catch (err) {
        console.error('Error fetching compliance data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">ISO 27001 A.9.2 - User Access Management</h1>
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">ISO 27001 A.9.2 - User Access Management</h1>
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">ISO 27001 A.9.2 - User Access Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {complianceData.map((control) => (
          <Card key={control.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">
                  {control.id} - {control.title}
                </h2>
              </div>
              <div className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${control.status === 'compliant' ? 'bg-green-100 text-green-800' :
                  control.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'}
              `}>
                {control.status.charAt(0).toUpperCase() + control.status.slice(1)}
              </div>
            </div>

            <div className="space-y-4">
              {control.metrics.map((metric, index) => (
                <div key={index} className="border-t pt-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">
                        {metric.metric}
                      </p>
                      <p className="text-sm text-gray-500">
                        Current: {metric.value} / Threshold: {metric.threshold}
                      </p>
                    </div>
                    <div className={`
                      ml-4 px-2 py-1 rounded text-xs font-medium
                      ${metric.status === 'passed' ? 'bg-green-100 text-green-800' :
                        metric.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'}
                    `}>
                      {metric.status.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t">
              <button className="text-sm text-blue-600 hover:text-blue-800">
                View Details
              </button>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Monitoring Configuration</h2>
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">HTTP Endpoints</h3>
              <ul className="mt-2 space-y-2 text-sm text-gray-600">
                <li>User Management: http://localhost:3002/api/access-control/user-management</li>
                <li>Access Review: http://localhost:3002/api/access-control/access-review</li>
                <li>Password Management: http://localhost:3002/api/access-control/password-management</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium">Log Files</h3>
              <ul className="mt-2 space-y-2 text-sm text-gray-600">
                <li>Privileged Access: /var/log/auth/privileged-access.log</li>
                <li>User Activity: /var/log/auth/user-activity.log</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium">Check Frequencies</h3>
              <ul className="mt-2 space-y-2 text-sm text-gray-600">
                <li>User Registration: Every 1 hour</li>
                <li>Access Review: Daily</li>
                <li>Privileged Access: Every 6 hours</li>
                <li>Password Compliance: Every 1 hour</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
