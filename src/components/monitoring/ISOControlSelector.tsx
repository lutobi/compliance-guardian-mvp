import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface ISOControl {
  id: string;
  name: string;
  description: string;
  category: string;
  subcontrols: {
    id: string;
    name: string;
    metrics: {
      name: string;
      type: 'percentage' | 'number';
      defaultThreshold: number;
    }[];
  }[];
}

const ISO_27001_CONTROLS: ISOControl[] = [
  {
    id: 'A.9.2',
    name: 'User Access Management',
    description: 'Ensure proper user access rights allocation and prevention of unauthorized access',
    category: 'Access Control',
    subcontrols: [
      {
        id: 'A.9.2.1',
        name: 'User Registration/De-registration',
        metrics: [
          {
            name: 'User registration process compliance',
            type: 'percentage',
            defaultThreshold: 95
          },
          {
            name: 'Inactive account detection',
            type: 'number',
            defaultThreshold: 30
          }
        ]
      },
      {
        id: 'A.9.2.2',
        name: 'User Access Provisioning',
        metrics: [
          {
            name: 'Access review completion rate',
            type: 'percentage',
            defaultThreshold: 90
          }
        ]
      }
    ]
  },
  {
    id: 'A.9.4',
    name: 'System and Application Access Control',
    description: 'Prevent unauthorized access to systems and applications',
    category: 'Access Control',
    subcontrols: [
      {
        id: 'A.9.4.1',
        name: 'Information Access Restriction',
        metrics: [
          {
            name: 'Access control compliance',
            type: 'percentage',
            defaultThreshold: 95
          }
        ]
      }
    ]
  },
  {
    id: 'A.12.6',
    name: 'Technical Vulnerability Management',
    description: 'Prevent exploitation of technical vulnerabilities',
    category: 'Operations Security',
    subcontrols: [
      {
        id: 'A.12.6.1',
        name: 'Vulnerability Management',
        metrics: [
          {
            name: 'Critical patch compliance',
            type: 'percentage',
            defaultThreshold: 98
          },
          {
            name: 'Average patch time',
            type: 'number',
            defaultThreshold: 14
          }
        ]
      }
    ]
  }
];

interface Props {
  onControlSelect: (selectedControls: string[]) => void;
}

export function ISOControlSelector({ onControlSelect }: Props) {
  const [selectedControls, setSelectedControls] = React.useState<string[]>([]);
  const [expandedControls, setExpandedControls] = React.useState<string[]>([]);

  const toggleControl = (controlId: string) => {
    setSelectedControls(current => {
      const control = ISO_27001_CONTROLS.find(c => c.id === controlId);
      if (!control) return current;

      // Get all subcontrol IDs for this control
      const subcontrolIds = control.subcontrols.map(sc => sc.id);
      
      // If all subcontrols are selected, remove them
      if (subcontrolIds.every(id => current.includes(id))) {
        return current.filter(id => !subcontrolIds.includes(id));
      }
      
      // Otherwise, add all subcontrols
      return [...current, ...subcontrolIds.filter(id => !current.includes(id))];
    });
  };

  const toggleSubControl = (subcontrolId: string) => {
    setSelectedControls(current => {
      if (current.includes(subcontrolId)) {
        return current.filter(id => id !== subcontrolId);
      }
      return [...current, subcontrolId];
    });
  };

  const toggleExpand = (controlId: string) => {
    setExpandedControls(current => {
      if (current.includes(controlId)) {
        return current.filter(id => id !== controlId);
      }
      return [...current, controlId];
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Select ISO 27001 Controls to Monitor</h2>
        <Button
          onClick={() => onControlSelect(selectedControls)}
          disabled={selectedControls.length === 0}
        >
          Set Up Monitoring ({selectedControls.length})
        </Button>
      </div>

      {ISO_27001_CONTROLS.map(control => (
        <Card key={control.id} className="p-4">
          <div className="flex items-start space-x-4">
            <Checkbox
              checked={control.subcontrols.every(sc => 
                selectedControls.includes(sc.id)
              )}
              onCheckedChange={() => toggleControl(control.id)}
            />
            <div className="flex-1">
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleExpand(control.id)}
              >
                <div>
                  <h3 className="text-lg font-medium">{control.id} - {control.name}</h3>
                  <p className="text-sm text-gray-600">{control.description}</p>
                </div>
                <Button variant="ghost">
                  {expandedControls.includes(control.id) ? '−' : '+'}
                </Button>
              </div>

              {expandedControls.includes(control.id) && (
                <div className="mt-4 ml-6 space-y-3">
                  {control.subcontrols.map(subcontrol => (
                    <div key={subcontrol.id} className="space-y-2">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={selectedControls.includes(subcontrol.id)}
                          onCheckedChange={() => toggleSubControl(subcontrol.id)}
                        />
                        <div>
                          <h4 className="font-medium">{subcontrol.id} - {subcontrol.name}</h4>
                          <div className="mt-2 text-sm text-gray-600">
                            <p className="font-medium">Metrics monitored:</p>
                            <ul className="list-disc ml-5">
                              {subcontrol.metrics.map((metric, idx) => (
                                <li key={idx}>
                                  {metric.name} 
                                  {metric.type === 'percentage' && ` (Target: ≥${metric.defaultThreshold}%)`}
                                  {metric.type === 'number' && ` (Target: ${metric.defaultThreshold} days)`}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
