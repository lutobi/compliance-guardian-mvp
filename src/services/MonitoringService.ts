import { 
  MonitoringPoint, 
  FrameworkMonitoring, 
  CategoryMonitoring, 
  ControlMonitoring,
  Evidence,
  MonitoringStatus
} from '@/types/monitoring';

// Helper function to generate UUID that works in both browser and Node.js
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback implementation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

class MonitoringService {
  private static instance: MonitoringService;

  private constructor() {}

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  async createMonitoringPoint(point: Partial<MonitoringPoint>): Promise<MonitoringPoint> {
    // TODO: Implement API call to create monitoring point
    return {
      id: generateUUID(),
      name: point.name || '',
      description: point.description || '',
      status: 'compliant',
      lastReviewDate: new Date(),
      nextReviewDate: new Date(),
      reviewers: [],
      evidenceRequired: true,
      ...point
    };
  }

  async updateMonitoringStatus(pointId: string, status: MonitoringStatus): Promise<void> {
    // TODO: Implement API call to update status
    console.log(`Updating status for ${pointId} to ${status}`);
  }

  async addEvidence(pointId: string, evidence: Partial<Evidence>): Promise<Evidence> {
    // TODO: Implement API call to add evidence
    return {
      id: generateUUID(),
      type: evidence.type || 'document',
      title: evidence.title || '',
      description: evidence.description || '',
      uploadedBy: evidence.uploadedBy || '',
      uploadDate: new Date(),
      validUntil: new Date(),
      metadata: evidence.metadata || {},
      ...evidence
    };
  }

  async getFrameworkMonitoring(frameworkId: string): Promise<FrameworkMonitoring | null> {
    // TODO: Implement API call to get framework monitoring
    return null;
  }

  async getCategoryMonitoring(categoryId: string): Promise<CategoryMonitoring | null> {
    // TODO: Implement API call to get category monitoring
    return null;
  }

  async getControlMonitoring(controlId: string): Promise<ControlMonitoring | null> {
    // TODO: Implement API call to get control monitoring
    return null;
  }

  // Mock frameworks data
  private mockFrameworks = [
    {
      id: 'iso27001',
      name: 'ISO 27001',
      description: 'Information Security Management System standard',
      controls: [
        {
          id: 'iso-ctrl-1',
          name: 'A.5.1 Information Security Policies',
          description: 'Management direction for information security',
          category: 'Security Policies'
        },
        {
          id: 'iso-ctrl-2',
          name: 'A.6.1 Internal Organization',
          description: 'Information security roles and responsibilities',
          category: 'Organization'
        },
        {
          id: 'iso-ctrl-3',
          name: 'A.7.1 Human Resource Security',
          description: 'Security aspects for employees and contractors',
          category: 'HR Security'
        },
        {
          id: 'iso-ctrl-4',
          name: 'A.8.1 Asset Management',
          description: 'Inventory and classification of information assets',
          category: 'Asset Management'
        }
      ]
    },
    {
      id: 'gdpr',
      name: 'GDPR',
      description: 'General Data Protection Regulation compliance framework',
      controls: [
        {
          id: 'gdpr-ctrl-1',
          name: 'Article 5: Data Processing Principles',
          description: 'Principles relating to processing of personal data',
          category: 'Data Processing'
        },
        {
          id: 'gdpr-ctrl-2',
          name: 'Article 6: Lawfulness of Processing',
          description: 'Legal basis for processing personal data',
          category: 'Legal Requirements'
        },
        {
          id: 'gdpr-ctrl-3',
          name: 'Article 17: Right to Erasure',
          description: 'Right to have personal data erased',
          category: 'Data Subject Rights'
        },
        {
          id: 'gdpr-ctrl-4',
          name: 'Article 32: Security of Processing',
          description: 'Technical and organizational security measures',
          category: 'Security Measures'
        }
      ]
    },
    {
      id: 'sox',
      name: 'SOX',
      description: 'Sarbanes-Oxley Act compliance framework',
      controls: [
        {
          id: 'sox-ctrl-1',
          name: 'Section 302: Financial Responsibility',
          description: 'Corporate responsibility for financial reports',
          category: 'Financial Reporting'
        },
        {
          id: 'sox-ctrl-2',
          name: 'Section 404: Assessment of Internal Control',
          description: 'Internal controls and procedures for financial reporting',
          category: 'Internal Controls'
        },
        {
          id: 'sox-ctrl-3',
          name: 'Section 409: Real-Time Disclosure',
          description: 'Real-time disclosure of material changes',
          category: 'Disclosure'
        },
        {
          id: 'sox-ctrl-4',
          name: 'Section 802: Criminal Penalties',
          description: 'Criminal penalties for altering documents',
          category: 'Document Management'
        }
      ]
    },
    {
      id: 'hipaa',
      name: 'HIPAA',
      description: 'Health Insurance Portability and Accountability Act',
      controls: [
        {
          id: 'hipaa-ctrl-1',
          name: 'Privacy Rule: PHI Protection',
          description: 'Protection of personal health information',
          category: 'Privacy'
        },
        {
          id: 'hipaa-ctrl-2',
          name: 'Security Rule: Technical Safeguards',
          description: 'Technical security measures for electronic PHI',
          category: 'Security'
        },
        {
          id: 'hipaa-ctrl-3',
          name: 'Breach Notification Rule',
          description: 'Requirements for breach notification',
          category: 'Incident Response'
        },
        {
          id: 'hipaa-ctrl-4',
          name: 'Enforcement Rule',
          description: 'Compliance and investigation processes',
          category: 'Enforcement'
        }
      ]
    }
  ];

  // Mock controls data for testing
  private mockControls = [
    {
      id: 'ctrl-1',
      name: 'Access Control Policy',
      description: 'Ensure proper access control policies are in place',
      category: 'Access Control',
      framework: 'iso27001'
    },
    {
      id: 'ctrl-2',
      name: 'Password Requirements',
      description: 'Enforce strong password requirements',
      category: 'Access Control',
      framework: 'iso27001'
    },
    {
      id: 'ctrl-3',
      name: 'Data Encryption',
      description: 'Implement data encryption at rest and in transit',
      category: 'Data Protection',
      framework: 'gdpr'
    },
    {
      id: 'ctrl-4',
      name: 'Incident Response',
      description: 'Have an incident response plan in place',
      category: 'Security Operations',
      framework: 'sox'
    },
    {
      id: 'ctrl-5',
      name: 'Security Training',
      description: 'Regular security awareness training for employees',
      category: 'Training',
      framework: 'iso27001'
    }
  ];

  // Mock monitoring data
  private mockMonitoring: any[] = [];

  async getFrameworks() {
    return this.mockFrameworks;
  }

  async getRelatedControls(frameworkId: string) {
    const framework = this.mockFrameworks.find(f => f.id === frameworkId);
    return framework ? framework.controls : [];
  }

  async createMonitoring(config: any) {
    const newMonitoring = {
      id: `mon-${Date.now()}`,
      framework: this.mockFrameworks.find(f => f.id === config.selectedItems.frameworks[0]),
      controls: config.selectedItems.controls.map((controlId: string) => {
        const framework = this.mockFrameworks.find(f => 
          f.controls.some(c => c.id === controlId)
        );
        const control = framework?.controls.find(c => c.id === controlId);
        return {
          id: controlId,
          name: control?.name,
          description: control?.description,
          status: 'pending',
          lastChecked: null,
          nextCheck: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          settings: {
            frequency: config.settings.frequency,
            evidenceType: config.settings.evidenceType,
            priority: config.settings.priority,
            automationLevel: config.settings.automationLevel
          }
        };
      })
    };
    
    this.mockMonitoring.push(newMonitoring);
    return newMonitoring;
  }

  async getActiveMonitoring() {
    return this.mockMonitoring.map(item => ({
      ...item,
      controls: item.controls.map((control: any) => ({
        ...control,
        status: Math.random() > 0.7 ? 'at_risk' : 'compliant' // Randomly set some controls as at risk
      }))
    }));
  }

  async updateMonitoringStatus(monitoringId: string, controlId: string, status: string) {
    const monitoring = this.mockMonitoring.find(m => m.id === monitoringId);
    if (monitoring) {
      const control = monitoring.controls.find((c: any) => c.id === controlId);
      if (control) {
        control.status = status;
        control.lastChecked = new Date();
      }
    }
  }

  async getMonitoringMetrics(pointId: string, startDate: Date, endDate: Date): Promise<any[]> {
    // TODO: Implement API call to get metrics
    return [];
  }
}

export const monitoringService = MonitoringService.getInstance();
