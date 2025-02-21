import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MonitoringService } from '@/services/MonitoringService';
import { CloudWatchIntegration } from '@/services/integrations/CloudWatchIntegration';
import { HttpEndpointIntegration } from '@/services/integrations/HttpEndpointIntegration';
import { FileSystemIntegration } from '@/services/integrations/FileSystemIntegration';
import { toast } from 'sonner';

interface IntegrationSetupProps {
  onSetupComplete?: () => void;
}

interface IntegrationConfig {
  id: string;
  name: string;
  description: string;
  pricing: string;
  fields: Array<{
    key: string;
    label: string;
    type: 'text' | 'password' | 'select' | 'textarea';
    options?: Array<{ value: string; label: string }>;
    required?: boolean;
    placeholder?: string;
    helperText?: string;
  }>;
}

const AVAILABLE_INTEGRATIONS: IntegrationConfig[] = [
  {
    id: 'http-endpoint',
    name: 'HTTP Endpoint (Free)',
    description: 'Monitor any HTTP endpoint that returns JSON metrics. Perfect for ISO 27001 compliance monitoring.',
    pricing: 'Free',
    fields: [
      {
        key: 'endpoints',
        label: 'Endpoint Configuration',
        type: 'textarea',
        placeholder: `{
  "user.management": "http://your-api/access-control/user-management",
  "access.review": "http://your-api/access-control/access-review",
  "password.management": "http://your-api/access-control/password-management"
}`,
        helperText: 'JSON object mapping ISO 27001 control metrics to endpoint URLs',
        required: true
      }
    ]
  },
  {
    id: 'file-system',
    name: 'File System (Free)',
    description: 'Monitor log files and system files for ISO 27001 compliance evidence.',
    pricing: 'Free',
    fields: [
      {
        key: 'paths',
        label: 'Path Configuration',
        type: 'textarea',
        placeholder: `{
  "access.logs": "/var/log/auth.log",
  "privileged.access": "/var/log/auth/privileged-access.log",
  "user.activity": "/var/log/auth/user-activity.log"
}`,
        helperText: 'JSON object mapping ISO 27001 control metrics to log file paths',
        required: true
      }
    ]
  },
  {
    id: 'aws-cloudwatch',
    name: 'AWS CloudWatch',
    description: 'Monitor AWS services using CloudWatch metrics. Includes both basic and detailed monitoring options.',
    pricing: 'Free Tier: 10 metrics, 1M API requests\nPaid: $0.30 per metric/month',
    fields: [
      {
        key: 'region',
        label: 'AWS Region',
        type: 'select',
        options: [
          { value: 'us-east-1', label: 'US East (N. Virginia)' },
          { value: 'us-east-2', label: 'US East (Ohio)' },
          { value: 'us-west-1', label: 'US West (N. California)' },
          { value: 'us-west-2', label: 'US West (Oregon)' },
          { value: 'eu-west-1', label: 'EU (Ireland)' },
          { value: 'eu-central-1', label: 'EU (Frankfurt)' }
        ],
        required: true
      },
      {
        key: 'accessKeyId',
        label: 'Access Key ID',
        type: 'text',
        required: true
      },
      {
        key: 'secretAccessKey',
        label: 'Secret Access Key',
        type: 'password',
        required: true
      }
    ]
  }
];

export const IntegrationSetup: React.FC<IntegrationSetupProps> = ({
  onSetupComplete
}) => {
  const [selectedIntegration, setSelectedIntegration] = useState<string>('');
  const [config, setConfig] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<'none' | 'testing' | 'success' | 'failed'>('none');

  const monitoringService = MonitoringService.getInstance();

  const handleConfigChange = (key: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const parseJsonConfig = (value: string): Record<string, string> | null => {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setError(null);

    try {
      let integration;
      let parsedConfig = { ...config };

      switch (selectedIntegration) {
        case 'http-endpoint':
          integration = new HttpEndpointIntegration();
          const endpoints = parseJsonConfig(config.endpoints);
          if (!endpoints) {
            throw new Error('Invalid endpoints configuration. Must be valid JSON.');
          }
          parsedConfig = { endpoints };
          break;

        case 'file-system':
          integration = new FileSystemIntegration();
          const paths = parseJsonConfig(config.paths);
          if (!paths) {
            throw new Error('Invalid paths configuration. Must be valid JSON.');
          }
          parsedConfig = { paths };
          break;

        case 'aws-cloudwatch':
          integration = new CloudWatchIntegration();
          break;

        default:
          throw new Error('Invalid integration selected');
      }

      const { valid, errors } = await integration.validateConfig(parsedConfig);
      if (!valid) {
        throw new Error(errors?.join(', '));
      }

      // Test the connection by configuring the integration
      await integration.configure(parsedConfig);
      
      // Try to fetch some metrics to verify the connection
      await integration.getMetrics();

      setTestStatus('success');
      toast.success('Connection test successful!');
    } catch (error) {
      setTestStatus('failed');
      const message = error instanceof Error ? error.message : 'Failed to test connection';
      setError(message);
      toast.error(message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let parsedConfig = { ...config };

      // Parse JSON configurations
      if (selectedIntegration === 'http-endpoint') {
        const endpoints = parseJsonConfig(config.endpoints);
        if (!endpoints) {
          throw new Error('Invalid endpoints configuration. Must be valid JSON.');
        }
        parsedConfig = { endpoints };
      } else if (selectedIntegration === 'file-system') {
        const paths = parseJsonConfig(config.paths);
        if (!paths) {
          throw new Error('Invalid paths configuration. Must be valid JSON.');
        }
        parsedConfig = { paths };
      }

      await monitoringService.configureIntegration(selectedIntegration, parsedConfig);
      toast.success('Integration configured successfully!');
      onSetupComplete?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to configure integration';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const selectedConfig = AVAILABLE_INTEGRATIONS.find(i => i.id === selectedIntegration);

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Configure Integration</h2>
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            Integration Type
          </label>
          <select
            value={selectedIntegration}
            onChange={(e) => setSelectedIntegration(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Select an integration</option>
            {AVAILABLE_INTEGRATIONS.map(integration => (
              <option key={integration.id} value={integration.id}>
                {integration.name}
              </option>
            ))}
          </select>
        </div>

        {selectedConfig && (
          <>
            <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
              <p className="font-medium mb-1">{selectedConfig.description}</p>
              <p className="text-xs mt-2">Pricing: {selectedConfig.pricing}</p>
            </div>

            <div className="space-y-4">
              {selectedConfig.fields.map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-medium mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      value={config[field.key] || ''}
                      onChange={(e) => handleConfigChange(field.key, e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">Select {field.label}</option>
                      {field.options?.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <>
                      <textarea
                        value={config[field.key] || ''}
                        onChange={(e) => handleConfigChange(field.key, e.target.value)}
                        required={field.required}
                        placeholder={field.placeholder}
                        className="w-full min-h-[120px] px-3 py-2 border rounded-md"
                      />
                      {field.helperText && (
                        <p className="mt-1 text-sm text-gray-500">{field.helperText}</p>
                      )}
                    </>
                  ) : (
                    <Input
                      type={field.type}
                      value={config[field.key] || ''}
                      onChange={(e) => handleConfigChange(field.key, e.target.value)}
                      required={field.required}
                      placeholder={field.placeholder}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex space-x-4">
              <Button
                type="button"
                onClick={handleTestConnection}
                disabled={loading || testStatus === 'testing'}
                className={`flex-1 ${testStatus === 'testing' ? 'opacity-50 cursor-not-allowed' : ''}`}
                variant="outline"
              >
                {testStatus === 'testing' ? 'Testing...' :
                 testStatus === 'success' ? '✓ Connection Tested' :
                 testStatus === 'failed' ? 'Test Failed' :
                 'Test Connection'}
              </Button>

              <Button
                type="submit"
                disabled={loading || testStatus !== 'success'}
                className={`flex-1 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Saving...' : 'Save Configuration'}
              </Button>
            </div>
          </>
        )}
      </form>
    </Card>
  );
}
