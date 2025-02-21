'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Framework } from '@/types/framework';
import { Control } from '@/types/control';
import { monitoringService } from '@/services/MonitoringService';
import { 
  MonitoringFrequency, 
  EvidenceType, 
  Priority, 
  AutomationLevel 
} from '@/types/monitoring';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface SmartMonitoringSetupProps {
  availableFrameworks: Framework[];
  onSetupComplete: (config: MonitoringConfig) => void;
}

interface MonitoringConfig {
  selectedItems: {
    frameworks: string[];
    controls: string[];
  };
  settings: {
    frequency: MonitoringFrequency;
    evidenceType: EvidenceType;
    priority: Priority;
    automationLevel: AutomationLevel;
  };
  notifications: {
    emails: string[];
    alertThreshold?: number;
    digestFrequency: 'daily' | 'weekly';
  };
}

export const SmartMonitoringSetup: React.FC<SmartMonitoringSetupProps> = ({
  availableFrameworks,
  onSetupComplete,
}) => {
  const [activeTab, setActiveTab] = useState('framework');
  const [availableControls, setAvailableControls] = useState<Control[]>([]);
  const [config, setConfig] = useState<MonitoringConfig>({
    selectedItems: {
      frameworks: [],
      controls: [],
    },
    settings: {
      frequency: 'weekly',
      evidenceType: 'document',
      priority: 'medium',
      automationLevel: 'semi',
    },
    notifications: {
      emails: [],
      digestFrequency: 'weekly',
    },
  });

  useEffect(() => {
    // Load controls for selected frameworks
    const loadControls = async () => {
      console.log('Loading controls for frameworks:', config.selectedItems.frameworks);
      if (config.selectedItems.frameworks.length > 0) {
        try {
          const controls = await monitoringService.getRelatedControls(config.selectedItems.frameworks[0]);
          console.log('Loaded controls:', controls);
          setAvailableControls(controls);
        } catch (error) {
          console.error('Failed to load controls:', error);
        }
      } else {
        console.log('No frameworks selected, clearing controls');
        setAvailableControls([]);
      }
    };
    loadControls();
  }, [config.selectedItems.frameworks]);

  const handleFrameworkSelect = (frameworkId: string) => {
    console.log('Selecting framework:', frameworkId);
    setConfig(prev => {
      const newFrameworks = prev.selectedItems.frameworks.includes(frameworkId)
        ? prev.selectedItems.frameworks.filter(id => id !== frameworkId)
        : [...prev.selectedItems.frameworks, frameworkId];
      console.log('New frameworks list:', newFrameworks);
      return {
        ...prev,
        selectedItems: {
          ...prev.selectedItems,
          frameworks: newFrameworks
        },
      };
    });
  };

  const handleControlSelect = (controlId: string) => {
    setConfig(prev => ({
      ...prev,
      selectedItems: {
        ...prev.selectedItems,
        controls: [...prev.selectedItems.controls, controlId]
      },
    }));
  };

  const handleSettingChange = (setting: keyof MonitoringConfig['settings'], value: string) => {
    setConfig(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [setting]: value,
      },
    }));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold">Compliance Monitoring Setup</h2>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="framework">Framework</TabsTrigger>
            <TabsTrigger value="controls">Controls</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="review">Review</TabsTrigger>
          </TabsList>

          <TabsContent value="framework" className="space-y-4">
            <h3 className="text-lg font-medium">Select Framework</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableFrameworks.map(framework => (
                <Card
                  key={framework.id}
                  className={`cursor-pointer transition-all ${
                    config.selectedItems.frameworks.includes(framework.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'hover:border-gray-300'
                  }`}
                  onClick={() => handleFrameworkSelect(framework.id)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{framework.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {framework.description}
                        </p>
                      </div>
                      {config.selectedItems.frameworks.includes(framework.id) && (
                        <CheckCircle2 className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="controls" className="space-y-4">
            <h3 className="text-lg font-medium">Select Controls</h3>
            <div className="space-y-4">
              {config.selectedItems.frameworks.length === 0 ? (
                <div className="text-center p-4 text-gray-500">
                  Please select a framework first to view available controls
                </div>
              ) : (
                <>
                  <Select 
                    onValueChange={handleControlSelect}
                  >
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder="Select controls to monitor" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectGroup>
                        <SelectLabel className="bg-white">Available Controls</SelectLabel>
                        {availableControls.length === 0 ? (
                          <SelectItem value="loading" disabled>Loading controls...</SelectItem>
                        ) : (
                          availableControls
                            .filter(control => !config.selectedItems.controls.includes(control.id))
                            .map(control => (
                              <SelectItem 
                                key={control.id} 
                                value={control.id}
                                className="bg-white hover:bg-gray-100"
                              >
                                {control.name}
                              </SelectItem>
                            ))
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  {/* Selected Controls */}
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Selected Controls</h4>
                    <div className="space-y-2">
                      {config.selectedItems.controls.length === 0 ? (
                        <div className="text-center p-4 text-gray-500 border rounded-md">
                          No controls selected yet
                        </div>
                      ) : (
                        config.selectedItems.controls.map(controlId => {
                          const control = availableControls.find(c => c.id === controlId);
                          return (
                            <Card key={controlId} className="p-3">
                              <div className="flex justify-between items-center">
                                <div>
                                  <span className="font-medium">{control?.name}</span>
                                  <p className="text-sm text-gray-500">{control?.description}</p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setConfig(prev => ({
                                      ...prev,
                                      selectedItems: {
                                        ...prev.selectedItems,
                                        controls: prev.selectedItems.controls.filter(id => id !== controlId)
                                      }
                                    }));
                                  }}
                                >
                                  Remove
                                </Button>
                              </div>
                            </Card>
                          );
                        })
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <h3 className="text-lg font-medium">Monitoring Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Monitoring Frequency</label>
                <Select
                  onValueChange={(value) => handleSettingChange('frequency', value)}
                  value={config.settings.frequency}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectGroup>
                      <SelectLabel className="bg-white">Frequency</SelectLabel>
                      <SelectItem value="daily" className="bg-white hover:bg-gray-100">Daily</SelectItem>
                      <SelectItem value="weekly" className="bg-white hover:bg-gray-100">Weekly</SelectItem>
                      <SelectItem value="monthly" className="bg-white hover:bg-gray-100">Monthly</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Evidence Type</label>
                <Select
                  onValueChange={(value) => handleSettingChange('evidenceType', value)}
                  value={config.settings.evidenceType}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectGroup>
                      <SelectLabel className="bg-white">Evidence Type</SelectLabel>
                      <SelectItem value="document" className="bg-white hover:bg-gray-100">Document</SelectItem>
                      <SelectItem value="metric" className="bg-white hover:bg-gray-100">Metric</SelectItem>
                      <SelectItem value="automated_check" className="bg-white hover:bg-gray-100">Automated Check</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Priority Level</label>
                <Select
                  onValueChange={(value) => handleSettingChange('priority', value)}
                  value={config.settings.priority}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectGroup>
                      <SelectLabel className="bg-white">Priority</SelectLabel>
                      <SelectItem value="high" className="bg-white hover:bg-gray-100">High</SelectItem>
                      <SelectItem value="medium" className="bg-white hover:bg-gray-100">Medium</SelectItem>
                      <SelectItem value="low" className="bg-white hover:bg-gray-100">Low</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Automation Level</label>
                <Select
                  onValueChange={(value) => handleSettingChange('automationLevel', value)}
                  value={config.settings.automationLevel}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectGroup>
                      <SelectLabel className="bg-white">Automation</SelectLabel>
                      <SelectItem value="full" className="bg-white hover:bg-gray-100">Full Automation</SelectItem>
                      <SelectItem value="semi" className="bg-white hover:bg-gray-100">Semi-Automated</SelectItem>
                      <SelectItem value="manual" className="bg-white hover:bg-gray-100">Manual</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="review" className="space-y-4">
            <h3 className="text-lg font-medium">Review Configuration</h3>
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-4">
                  <h4 className="font-medium mb-2">Selected Frameworks</h4>
                  <div className="space-y-2">
                    {config.selectedItems.frameworks.map(frameworkId => {
                      const framework = availableFrameworks.find(f => f.id === frameworkId);
                      return (
                        <div key={frameworkId} className="flex items-center text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                          {framework?.name}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <h4 className="font-medium mb-2">Selected Controls</h4>
                  <div className="space-y-2">
                    {config.selectedItems.controls.map(controlId => {
                      const control = availableControls.find(c => c.id === controlId);
                      return (
                        <div key={controlId} className="flex items-center text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                          {control?.name}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <h4 className="font-medium mb-2">Monitoring Settings</h4>
                  <div className="space-y-2 text-sm">
                    <div>Frequency: {config.settings.frequency}</div>
                    <div>Evidence Type: {config.settings.evidenceType}</div>
                    <div>Priority: {config.settings.priority}</div>
                    <div>Automation: {config.settings.automationLevel}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              const prevTab = {
                controls: 'framework',
                settings: 'controls',
                review: 'settings',
              }[activeTab];
              if (prevTab) setActiveTab(prevTab);
            }}
            disabled={activeTab === 'framework'}
          >
            Previous
          </Button>
          <Button
            onClick={() => {
              if (activeTab === 'review') {
                onSetupComplete(config);
              } else {
                const nextTab = {
                  framework: 'controls',
                  controls: 'settings',
                  settings: 'review',
                }[activeTab];
                if (nextTab) setActiveTab(nextTab);
              }
            }}
            disabled={
              (activeTab === 'framework' && config.selectedItems.frameworks.length === 0) ||
              (activeTab === 'controls' && config.selectedItems.controls.length === 0)
            }
          >
            {activeTab === 'review' ? 'Activate Monitoring' : 'Next'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
