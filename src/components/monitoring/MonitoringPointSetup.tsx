'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EnhancedControl } from '@/types/enhanced-framework';
import { MonitoringPoint, MonitoringPointType } from '@/types/monitoring';
import { monitoringService } from '@/services/MonitoringService';

interface MonitoringPointSetupProps {
  control: EnhancedControl;
  onSetupComplete?: () => void;
}

interface MetricOption {
  id: string;
  name: string;
  description: string;
  type: 'number' | 'percentage' | 'boolean' | 'string';
  thresholdType?: 'min' | 'max' | 'range' | 'equals';
}

export const MonitoringPointSetup: React.FC<MonitoringPointSetupProps> = ({
  control,
  onSetupComplete
}) => {
  const [availableMetrics, setAvailableMetrics] = useState<MetricOption[]>([
    // A.9.2.1 User registration and de-registration
    {
      id: 'user.management',
      name: 'User Registration Compliance',
      description: 'Monitor user registration and de-registration process (ISO 27001 A.9.2.1)',
      type: 'percentage',
      thresholdType: 'min'
    },
    {
      id: 'user.activity',
      name: 'User Activity Monitoring',
      description: 'Monitor user account activity and inactive accounts (ISO 27001 A.9.2.1)',
      type: 'number',
      thresholdType: 'max'
    },
    
    // A.9.2.2 User access provisioning
    {
      id: 'access.review',
      name: 'Access Review Status',
      description: 'Monitor access review completion status (ISO 27001 A.9.2.2)',
      type: 'percentage',
      thresholdType: 'min'
    },
    
    // A.9.2.3 Privileged access rights
    {
      id: 'privileged.access',
      name: 'Privileged Access Monitoring',
      description: 'Monitor privileged account usage and reviews (ISO 27001 A.9.2.3)',
      type: 'number',
      thresholdType: 'max'
    },
    
    // A.9.2.4 Password management
    {
      id: 'password.management',
      name: 'Password Policy Compliance',
      description: 'Monitor password policy compliance (ISO 27001 A.9.2.4)',
      type: 'percentage',
      thresholdType: 'min'
    }
  ]);

  const [suggestedThresholds] = useState({
    'user.management': '95', // 95% compliance required
    'user.activity': '30',   // Alert if accounts inactive for 30 days
    'access.review': '90',   // 90% of reviews must be completed
    'privileged.access': '5', // Alert if more than 5 privileged access attempts
    'password.management': '95' // 95% password policy compliance required
  });

  const [selectedMetric, setSelectedMetric] = useState<string>('');
  const [monitoringType, setMonitoringType] = useState<MonitoringPointType>('automated');
  const [frequency, setFrequency] = useState('1h');
  const [threshold, setThreshold] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAvailableMetrics();
  }, []);

  useEffect(() => {
    if (selectedMetric) {
      setThreshold(suggestedThresholds[selectedMetric] || '');
    }
  }, [selectedMetric]);

  const loadAvailableMetrics = async () => {
    try {
      const metrics = [];
      
      // Load metrics from all available integrations
      try {
        const metrics = await monitoringService.getAvailableMetrics();
        setAvailableMetrics([...availableMetrics, ...metrics]);
      } catch (error) {
        setError('Failed to load available metrics');
        console.error('Error loading metrics:', error);
      }
    } catch (error) {
      setError('Failed to load available metrics');
      console.error('Error loading metrics:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const metric = availableMetrics.find(m => m.id === selectedMetric);
      if (!metric) {
        throw new Error('Invalid metric selected');
      }

      const monitoringPoint: Omit<MonitoringPoint, 'id' | 'created_at' | 'updated_at'> = {
        control_id: control.id,
        metric: selectedMetric,
        type: monitoringType,
        frequency,
        threshold,
        user_id: '', // This will be set by the backend
        last_check: null
      };

      await monitoringService.createMonitoringPoint(monitoringPoint);
      onSetupComplete?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create monitoring point');
      console.error('Error creating monitoring point:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Configure Monitoring Point</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Monitoring Type
          </label>
          <select
            value={monitoringType}
            onChange={(e) => setMonitoringType(e.target.value as MonitoringPointType)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="automated">Automated</option>
            <option value="semi-automated">Semi-Automated</option>
            <option value="manual">Manual</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Metric
          </label>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Select a metric</option>
            {availableMetrics.map(metric => (
              <option key={metric.id} value={metric.id}>
                {metric.name}
              </option>
            ))}
          </select>
          {selectedMetric && (
            <p className="mt-1 text-sm text-gray-600">
              {availableMetrics.find(m => m.id === selectedMetric)?.description}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Check Frequency
          </label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="5m">Every 5 minutes</option>
            <option value="15m">Every 15 minutes</option>
            <option value="30m">Every 30 minutes</option>
            <option value="1h">Every hour</option>
            <option value="6h">Every 6 hours</option>
            <option value="12h">Every 12 hours</option>
            <option value="24h">Every 24 hours</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Threshold
          </label>
          <Input
            type="text"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            placeholder="e.g., 90 for 90% CPU utilization"
          />
          {selectedMetric && (
            <p className="mt-1 text-sm text-gray-600">
              {availableMetrics.find(m => m.id === selectedMetric)?.thresholdType === 'max' ?
                'Maximum allowed value' :
                availableMetrics.find(m => m.id === selectedMetric)?.thresholdType === 'min' ?
                'Minimum required value' :
                'Target value'
              }
            </p>
          )}
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            disabled={loading || !selectedMetric}
            className={`w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Creating...' : 'Create Monitoring Point'}
          </Button>
        </div>
      </form>
    </Card>
  );
};
