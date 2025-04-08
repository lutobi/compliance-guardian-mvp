'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { monitoringService } from '@/services/MonitoringService';
import { FileText, Edit, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect } from "@/components/MultiSelect";
import { Checkbox } from "@/components/ui/checkbox";
import type { MonitoringFrequency, ReviewCycle, Priority, AutomationLevel, EvidenceType } from '@/types/monitoring';
import { frameworks, frameworkData } from '@/data/frameworks';

// Use actual framework data from the framework data structure
// Note: frameworks and frameworkData are imported from @/data/frameworks

interface SubControl {
  id: string;
  name: string;
  progress: number;
}

interface Control {
  id: string;
  name: string;
  subcontrols: SubControl[];
}

const controls = {
  // Controls data here
} as const;

interface FrameworkSelection {
  frameworkId: string;
  categoryId: string;
  controlSelections: {
    controlId: string;
    subcontrolIds: string[];
    progress: number;
  }[];
}

interface MonitorConfigState {
  name: string;
  description: string;
  reviewCycle: ReviewCycle;
  priority: Priority;
  automationLevel: AutomationLevel;
  evidenceType: EvidenceType;
  frequency: MonitoringFrequency;
  evidenceRequired: boolean;
  alertThreshold: string;
  reviewers: string[];
}

interface SavedMonitorConfig extends MonitorConfigState {
  id: string;
  createdAt: Date;
  status: 'active' | 'inactive';
  selectedFrameworks: string[];
  controlSelections: {
    frameworkId: string;
    controlId: string;
    subcontrolIds: string[];
    progress: number;
  }[];
  overallProgress: number;
}

export default function MonitoringPage() {
  const [isConfigureOpen, setIsConfigureOpen] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [selectedFrameworks, setSelectedFrameworks] = useState<FrameworkSelection[]>([]);
  const [monitorConfig, setMonitorConfig] = useState<MonitorConfigState>({
    name: '',
    description: '',
    reviewCycle: 'monthly',
    priority: 'medium',
    automationLevel: 'semi_automated',
    evidenceType: 'document',
    frequency: 'weekly',
    evidenceRequired: false,
    alertThreshold: '80',
    reviewers: [],
  });
  const [savedConfigurations, setSavedConfigurations] = useState<SavedMonitorConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [subcontrolSearch, setSubcontrolSearch] = useState<string>('');
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);

  // Helper function to get progress color class based on percentage
  const getProgressColorClass = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    if (progress >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  return (
    <div className="container mx-auto py-6 px-4">
      {saveMessage && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
          {saveMessage}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Compliance Monitoring</h1>
        <Button onClick={() => setIsConfigureOpen(true)}>
          Configure Monitoring
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading monitoring configurations...</p>
        </div>
      ) : savedConfigurations.length === 0 ? (
        <div className="bg-gray-50 p-8 text-center rounded-lg border border-gray-200">
          <h2 className="text-xl font-medium mb-2">No Monitoring Configurations</h2>
          <p className="text-gray-600 mb-4">
            Create your first monitoring configuration to start tracking compliance
          </p>
          <Button onClick={() => setIsConfigureOpen(true)}>
            Configure Monitoring
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedConfigurations.map((config) => (
            <Card key={config.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{config.name}</CardTitle>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => {
                      setEditingConfigId(config.id);
                      setIsConfigureOpen(true);
                    }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription className="line-clamp-2">
                  {config.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Status</span>
                    <span className={`font-medium ${config.status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>
                      {config.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Priority</span>
                    <span className="font-medium">{config.priority}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Review Cycle</span>
                    <span className="font-medium">{config.reviewCycle}</span>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Overall Progress</span>
                      <span className="font-medium">{config.overallProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${getProgressColorClass(config.overallProgress)}`} 
                        style={{ width: `${config.overallProgress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between">
                <Button variant="outline" size="sm" onClick={() => {
                  // Toggle status
                  const newStatus = config.status === 'active' ? 'inactive' : 'active';
                  monitoringService.updateMonitoringConfigurationStatus(config.id, newStatus)
                    .then(() => {
                      setSaveMessage(`Configuration ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
                      setTimeout(() => setSaveMessage(''), 3000);
                      // Refresh configurations
                      monitoringService.getMonitoringConfigurations().then(configs => {
                        setSavedConfigurations(configs);
                      });
                    });
                }}>
                  {config.status === 'active' ? 'Deactivate' : 'Activate'}
                </Button>
                <Link href={`/monitoring/${config.id}`} passHref>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <span>View Details</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isConfigureOpen} onOpenChange={setIsConfigureOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingConfigId ? 'Edit Monitoring Configuration' : 'Configure Monitoring'}</DialogTitle>
            <DialogDescription>
              Set up which frameworks and controls you want to monitor for compliance
            </DialogDescription>
          </DialogHeader>
          
          <form className="space-y-6" onSubmit={(e) => {
            e.preventDefault();
            
            // Validate form
            if (!monitorConfig.name) {
              alert('Please enter a name for this configuration');
              return;
            }
            
            if (selectedFrameworks.length === 0) {
              alert('Please select at least one framework');
              return;
            }
            
            // Calculate overall progress
            let totalControls = 0;
            let totalProgress = 0;
            
            selectedFrameworks.forEach(framework => {
              framework.controlSelections.forEach(control => {
                totalControls++;
                totalProgress += control.progress;
              });
            });
            
            const overallProgress = totalControls > 0 
              ? Math.round(totalProgress / totalControls) 
              : 0;
            
            // Create config object
            const config: MonitoringConfiguration = {
              ...monitorConfig,
              id: editingConfigId || undefined,
              selectedFrameworks: selectedFrameworks.map(f => f.frameworkId),
              controlSelections: selectedFrameworks.flatMap(f => 
                f.controlSelections.map(c => ({
                  frameworkId: f.frameworkId,
                  controlId: c.controlId,
                  subcontrolIds: c.subcontrolIds,
                  progress: c.progress
                }))
              ),
              overallProgress,
              status: 'active'
            };
            
            // Save configuration
            monitoringService.saveMonitoringConfiguration(config)
              .then((savedConfig) => {
                setSaveMessage('Monitoring configuration saved successfully');
                setTimeout(() => setSaveMessage(''), 3000);
                setIsConfigureOpen(false);
                
                // Reset form
                setMonitorConfig({
                  name: '',
                  description: '',
                  reviewCycle: 'monthly',
                  priority: 'medium',
                  automationLevel: 'semi_automated',
                  evidenceType: 'document',
                  frequency: 'weekly',
                  evidenceRequired: false,
                  alertThreshold: '80',
                  reviewers: [],
                });
                setSelectedFrameworks([]);
                setEditingConfigId(null);
                
                // Refresh configurations
                monitoringService.getMonitoringConfigurations().then(configs => {
                  setSavedConfigurations(configs);
                });
              })
              .catch(error => {
                console.error('Error saving configuration:', error);
                alert('Error saving configuration. Please try again.');
              });
          }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Configuration Name</Label>
                  <Input 
                    id="name" 
                    value={monitorConfig.name} 
                    onChange={(e) => setMonitorConfig({...monitorConfig, name: e.target.value})}
                    placeholder="e.g., Monthly SOC 2 Monitoring"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    value={monitorConfig.description} 
                    onChange={(e) => setMonitorConfig({...monitorConfig, description: e.target.value})}
                    placeholder="Describe the purpose of this monitoring configuration"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reviewCycle">Review Cycle</Label>
                    <Select 
                      value={monitorConfig.reviewCycle} 
                      onValueChange={(value) => setMonitorConfig({...monitorConfig, reviewCycle: value as ReviewCycle})}
                    >
                      <SelectTrigger id="reviewCycle">
                        <SelectValue placeholder="Select review cycle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select 
                      value={monitorConfig.priority} 
                      onValueChange={(value) => setMonitorConfig({...monitorConfig, priority: value as Priority})}
                    >
                      <SelectTrigger id="priority">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="frequency">Check Frequency</Label>
                    <Select 
                      value={monitorConfig.frequency} 
                      onValueChange={(value) => setMonitorConfig({...monitorConfig, frequency: value as MonitoringFrequency})}
                    >
                      <SelectTrigger id="frequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="evidenceType">Evidence Type</Label>
                    <Select 
                      value={monitorConfig.evidenceType} 
                      onValueChange={(value) => setMonitorConfig({...monitorConfig, evidenceType: value as EvidenceType})}
                    >
                      <SelectTrigger id="evidenceType">
                        <SelectValue placeholder="Select evidence type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="document">Document</SelectItem>
                        <SelectItem value="test_result">Test Result</SelectItem>
                        <SelectItem value="audit_report">Audit Report</SelectItem>
                        <SelectItem value="screen_capture">Screen Capture</SelectItem>
                        <SelectItem value="log_file">Log File</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="automationLevel">Automation Level</Label>
                    <Select 
                      value={monitorConfig.automationLevel} 
                      onValueChange={(value) => setMonitorConfig({...monitorConfig, automationLevel: value as AutomationLevel})}
                    >
                      <SelectTrigger id="automationLevel">
                        <SelectValue placeholder="Select automation level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="semi_automated">Semi-Automated</SelectItem>
                        <SelectItem value="fully_automated">Fully Automated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="alertThreshold">Alert Threshold (%)</Label>
                    <Input 
                      id="alertThreshold" 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={monitorConfig.alertThreshold} 
                      onChange={(e) => setMonitorConfig({...monitorConfig, alertThreshold: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="evidenceRequired" 
                    checked={monitorConfig.evidenceRequired} 
                    onCheckedChange={(checked) => 
                      setMonitorConfig({...monitorConfig, evidenceRequired: checked as boolean})
                    }
                  />
                  <Label htmlFor="evidenceRequired">Evidence Required</Label>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label>Select Frameworks & Controls</Label>
                  <div className="border rounded-md p-4 space-y-4 max-h-[400px] overflow-y-auto">
                    {frameworks.map((framework) => (
                      <div key={framework.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{framework.name}</span>
                          <Checkbox 
                            checked={selectedFrameworks.some(f => f.frameworkId === framework.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                // Add framework if not already selected
                                if (!selectedFrameworks.some(f => f.frameworkId === framework.id)) {
                                  setSelectedFrameworks([
                                    ...selectedFrameworks,
                                    {
                                      frameworkId: framework.id,
                                      categoryId: '',
                                      controlSelections: []
                                    }
                                  ]);
                                }
                              } else {
                                // Remove framework
                                setSelectedFrameworks(
                                  selectedFrameworks.filter(f => f.frameworkId !== framework.id)
                                );
                              }
                            }}
                          />
                        </div>
                        
                        {selectedFrameworks.some(f => f.frameworkId === framework.id) && (
                          <div className="pl-4 space-y-2">
                            <div className="mb-2">
                              <Input
                                placeholder="Search subcontrols..."
                                value={subcontrolSearch}
                                onChange={(e) => setSubcontrolSearch(e.target.value)}
                                className="mb-2"
                              />
                              <div className="flex space-x-2 mb-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    // Select all subcontrols for this framework
                                    const updatedFrameworks = selectedFrameworks.map(f => {
                                      if (f.frameworkId === framework.id) {
                                        const allControls = [];
                                        // This is where you'd get all controls for the framework
                                        // For now, using placeholder data
                                        for (const control of Object.values(controls)) {
                                          allControls.push({
                                            controlId: control.id,
                                            subcontrolIds: control.subcontrols.map(sc => sc.id),
                                            progress: 0
                                          });
                                        }
                                        return { ...f, controlSelections: allControls };
                                      }
                                      return f;
                                    });
                                    setSelectedFrameworks(updatedFrameworks);
                                  }}
                                >
                                  Select All
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    // Clear all subcontrols for this framework
                                    const updatedFrameworks = selectedFrameworks.map(f => {
                                      if (f.frameworkId === framework.id) {
                                        return { ...f, controlSelections: [] };
                                      }
                                      return f;
                                    });
                                    setSelectedFrameworks(updatedFrameworks);
                                  }}
                                >
                                  Clear All
                                </Button>
                              </div>
                            </div>
                            
                            {/* Display selected subcontrols */}
                            <div className="space-y-2">
                              {Object.entries(controls).map(([controlId, control]) => {
                                // Filter subcontrols based on search
                                const filteredSubcontrols = control.subcontrols.filter(sc => 
                                  subcontrolSearch === '' || 
                                  sc.name.toLowerCase().includes(subcontrolSearch.toLowerCase())
                                );
                                
                                if (filteredSubcontrols.length === 0) return null;
                                
                                return (
                                  <div key={controlId} className="border rounded p-2">
                                    <div className="font-medium mb-1">{control.name}</div>
                                    <div className="pl-2 space-y-1">
                                      {filteredSubcontrols.map(subcontrol => {
                                        const frameworkIndex = selectedFrameworks.findIndex(
                                          f => f.frameworkId === framework.id
                                        );
                                        
                                        const controlIndex = frameworkIndex !== -1 
                                          ? selectedFrameworks[frameworkIndex].controlSelections.findIndex(
                                              c => c.controlId === controlId
                                            )
                                          : -1;
                                          
                                        const isSelected = controlIndex !== -1 && 
                                          selectedFrameworks[frameworkIndex].controlSelections[controlIndex].subcontrolIds.includes(subcontrol.id);
                                          
                                        return (
                                          <div key={subcontrol.id} className="flex items-center justify-between">
                                            <div className="flex items-center">
                                              <Checkbox 
                                                checked={isSelected}
                                                onCheckedChange={(checked) => {
                                                  const updatedFrameworks = [...selectedFrameworks];
                                                  
                                                  if (frameworkIndex === -1) return;
                                                  
                                                  if (controlIndex === -1) {
                                                    // Control not yet in selections, add it with this subcontrol
                                                    if (checked) {
                                                      updatedFrameworks[frameworkIndex].controlSelections.push({
                                                        controlId,
                                                        subcontrolIds: [subcontrol.id],
                                                        progress: 0
                                                      });
                                                    }
                                                  } else {
                                                    // Control exists, update its subcontrolIds
                                                    if (checked) {
                                                      // Add subcontrol if not already included
                                                      if (!updatedFrameworks[frameworkIndex].controlSelections[controlIndex].subcontrolIds.includes(subcontrol.id)) {
                                                        updatedFrameworks[frameworkIndex].controlSelections[controlIndex].subcontrolIds.push(subcontrol.id);
                                                      }
                                                    } else {
                                                      // Remove subcontrol
                                                      updatedFrameworks[frameworkIndex].controlSelections[controlIndex].subcontrolIds = 
                                                        updatedFrameworks[frameworkIndex].controlSelections[controlIndex].subcontrolIds.filter(
                                                          id => id !== subcontrol.id
                                                        );
                                                        
                                                      // If no subcontrols left, remove the control
                                                      if (updatedFrameworks[frameworkIndex].controlSelections[controlIndex].subcontrolIds.length === 0) {
                                                        updatedFrameworks[frameworkIndex].controlSelections = 
                                                          updatedFrameworks[frameworkIndex].controlSelections.filter(
                                                            (_, i) => i !== controlIndex
                                                          );
                                                      }
                                                    }
                                                  }
                                                  
                                                  setSelectedFrameworks(updatedFrameworks);
                                                }}
                                              />
                                              <span className="ml-2 text-sm">{subcontrol.name}</span>
                                            </div>
                                            <div className="flex items-center">
                                              <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                                                <div 
                                                  className={`h-2 rounded-full ${getProgressColorClass(subcontrol.progress)}`} 
                                                  style={{ width: `${subcontrol.progress}%` }}
                                                ></div>
                                              </div>
                                              <span className="text-xs text-gray-500">{subcontrol.progress}%</span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={() => {
                setIsConfigureOpen(false);
                setEditingConfigId(null);
              }}>
                Cancel
              </Button>
              <Button type="submit">
                {editingConfigId ? 'Update' : 'Save'} Configuration
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
