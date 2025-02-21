import { useState } from 'react';
import { Framework } from '@/types/framework';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { 
  MonitoringFrequency, 
  EvidenceType, 
  Priority, 
  AutomationLevel 
} from '@/types/monitoring';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface SmartMonitoringSetupProps {
  availableFrameworks?: Framework[];
  onSetupComplete?: (config: any) => void;
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

export default function SmartMonitoringSetup({
  availableFrameworks = [],
  onSetupComplete
}: SmartMonitoringSetupProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFramework, setSelectedFramework] = useState<Framework | null>(null);
  const [availableControls, setAvailableControls] = useState([]);
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

  const steps = [
    { id: 1, name: 'Select Framework' },
    { id: 2, name: 'Choose Controls' },
    { id: 3, name: 'Configure Settings' },
    { id: 4, name: 'Review' }
  ];

  const handleFrameworkSelect = (frameworkId: string) => {
    const framework = availableFrameworks.find(f => f.id === frameworkId);
    setSelectedFramework(framework);
    setConfig(prev => ({
      ...prev,
      selectedItems: {
        ...prev.selectedItems,
        frameworks: [frameworkId]
      },
    }));
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
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="hidden md:block">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-between">
            {steps.map((step, stepIdx) => (
              <li key={step.name} className={cn(
                "relative",
                stepIdx !== steps.length - 1 ? "pr-8 sm:pr-20" : "",
                "flex items-center"
              )}>
                <div className="flex items-center">
                  <div className={cn(
                    "relative flex h-8 w-8 items-center justify-center rounded-full",
                    currentStep > step.id ? "bg-blue-600" : 
                    currentStep === step.id ? "border-2 border-blue-600" : 
                    "border-2 border-gray-300"
                  )}>
                    <span className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      currentStep === step.id ? "bg-blue-600" : "bg-transparent"
                    )} />
                  </div>
                  <span className="ml-4 text-sm font-medium text-gray-900">
                    {step.name}
                  </span>
                </div>
                {stepIdx !== steps.length - 1 && (
                  <div className="absolute top-4 right-0 h-0.5 w-full bg-gray-200" />
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Mobile Progress */}
      <div className="md:hidden">
        <p className="text-sm font-medium text-gray-500">
          Step {currentStep} of {steps.length}
        </p>
        <h2 className="mt-2 text-lg font-medium text-gray-900">
          {steps[currentStep - 1].name}
        </h2>
      </div>

      {/* Content */}
      <div className="mt-8">
        <Tabs defaultValue="tab1" className="w-full">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 lg:grid-cols-4 h-auto">
            <TabsTrigger value="tab1">Framework Selection</TabsTrigger>
            <TabsTrigger value="tab2">Control Selection</TabsTrigger>
            <TabsTrigger value="tab3">Configuration</TabsTrigger>
            <TabsTrigger value="tab4" className="hidden lg:block">Review</TabsTrigger>
          </TabsList>

          <TabsContent value="tab1" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableFrameworks.map((framework) => (
                <Card
                  key={framework.id}
                  className={cn(
                    "cursor-pointer transition-all",
                    selectedFramework?.id === framework.id
                      ? "ring-2 ring-blue-500"
                      : "hover:shadow-md"
                  )}
                  onClick={() => handleFrameworkSelect(framework.id)}
                >
                  <div className="p-4">
                    <h3 className="text-lg font-medium">{framework.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {framework.description}
                    </p>
                    {framework.categories && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900">Categories:</h4>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {framework.categories.slice(0, 3).map((category) => (
                            <span
                              key={category}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {category}
                            </span>
                          ))}
                          {framework.categories.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{framework.categories.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tab2">
            <div className="p-4">
              <h3 className="text-lg font-medium mb-4">Select Controls</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableControls.map((control) => (
                  <Card
                    key={control.id}
                    className={cn(
                      "cursor-pointer transition-all",
                      config.selectedItems.controls.includes(control.id)
                        ? "ring-2 ring-blue-500"
                        : "hover:shadow-md"
                    )}
                    onClick={() => handleControlSelect(control.id)}
                  >
                    <div className="p-4">
                      <h3 className="text-lg font-medium">{control.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {control.description}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tab3">
            <div className="p-4">
              <h3 className="text-lg font-medium mb-4">Configure Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Monitoring Frequency</label>
                  <select
                    value={config.settings.frequency}
                    onChange={(e) => handleSettingChange('frequency', e.target.value)}
                    className="w-full bg-white"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Evidence Type</label>
                  <select
                    value={config.settings.evidenceType}
                    onChange={(e) => handleSettingChange('evidenceType', e.target.value)}
                    className="w-full bg-white"
                  >
                    <option value="document">Document</option>
                    <option value="metric">Metric</option>
                    <option value="automated_check">Automated Check</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Priority Level</label>
                  <select
                    value={config.settings.priority}
                    onChange={(e) => handleSettingChange('priority', e.target.value)}
                    className="w-full bg-white"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Automation Level</label>
                  <select
                    value={config.settings.automationLevel}
                    onChange={(e) => handleSettingChange('automationLevel', e.target.value)}
                    className="w-full bg-white"
                  >
                    <option value="full">Full Automation</option>
                    <option value="semi">Semi-Automated</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tab4">
            <div className="p-4">
              <h3 className="text-lg font-medium mb-4">Review Configuration</h3>
              <div className="space-y-4">
                <Card>
                  <div className="p-4">
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
                  </div>
                </Card>

                <Card>
                  <div className="p-4">
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
                  </div>
                </Card>

                <Card>
                  <div className="p-4">
                    <h4 className="font-medium mb-2">Monitoring Settings</h4>
                    <div className="space-y-2 text-sm">
                      <div>Frequency: {config.settings.frequency}</div>
                      <div>Evidence Type: {config.settings.evidenceType}</div>
                      <div>Priority: {config.settings.priority}</div>
                      <div>Automation: {config.settings.automationLevel}</div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between items-center border-t pt-4">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        <Button
          onClick={() => {
            if (currentStep < steps.length) {
              setCurrentStep(currentStep + 1);
            } else {
              onSetupComplete?.({
                framework: selectedFramework,
                controls: config.selectedItems.controls,
                settings: config.settings,
              });
            }
          }}
        >
          {currentStep === steps.length ? 'Complete Setup' : 'Next'}
        </Button>
      </div>
    </div>
  );
}
