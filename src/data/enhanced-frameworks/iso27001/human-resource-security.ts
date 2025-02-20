import { EnhancedControl } from '../../../types/enhanced-framework';

export const humanResourceSecurity: EnhancedControl = {
  id: 'A.7',
  title: 'Human resource security',
  description: 'Security controls for employment lifecycle',
  category: 'Organizational Controls',
  status: 'implemented',
  riskLevel: 'high',
  applicability: ['all-employees', 'contractors', 'third-parties'],
  references: ['ISO/IEC 27002:2022'],
  dependencies: ['A.5', 'A.6'],
  
  subControls: [
    {
      id: 'A.7.1',
      title: 'Prior to employment',
      description: 'Security responsibilities in job definitions and screening',
      requirements: [
        'Background verification checks',
        'Employment contract terms and conditions',
        'Security responsibilities in job descriptions',
        'Confidentiality agreements',
        'Access rights provisioning process'
      ],
      monitoringPoints: [
        {
          type: 'semi-automated',
          metric: 'Background check completion',
          frequency: 'per-hire',
          source: 'HR system',
          threshold: '100% completed'
        },
        {
          type: 'automated',
          metric: 'NDA signature status',
          frequency: 'per-hire',
          source: 'Document management system',
          threshold: '100% signed'
        }
      ]
    },
    {
      id: 'A.7.2',
      title: 'During employment',
      description: 'Information security awareness and training',
      requirements: [
        'Security awareness training',
        'Regular policy acknowledgments',
        'Disciplinary process',
        'Security responsibility updates',
        'Performance reviews'
      ],
      monitoringPoints: [
        {
          type: 'automated',
          metric: 'Training completion rate',
          frequency: 'monthly',
          source: 'Learning management system',
          threshold: '95% completion'
        },
        {
          type: 'automated',
          metric: 'Policy acknowledgment status',
          frequency: 'annual',
          source: 'Policy management system',
          threshold: '100% acknowledged'
        }
      ]
    },
    {
      id: 'A.7.3',
      title: 'Termination and change of employment',
      description: 'Security aspects of employment termination or change',
      requirements: [
        'Access revocation process',
        'Return of assets procedure',
        'Removal of access rights',
        'Exit interview security checklist',
        'Knowledge transfer requirements'
      ],
      monitoringPoints: [
        {
          type: 'automated',
          metric: 'Access revocation timeliness',
          frequency: 'per-termination',
          source: 'IAM system',
          threshold: '24 hours'
        },
        {
          type: 'semi-automated',
          metric: 'Asset return verification',
          frequency: 'per-termination',
          source: 'Asset management system',
          threshold: '100% returned'
        }
      ]
    }
  ],
  
  evidence: [
    {
      type: 'record',
      description: 'Background verification records',
      frequency: 'per-hire',
      retention: '7 years'
    },
    {
      type: 'document',
      description: 'Signed confidentiality agreements',
      frequency: 'per-hire',
      retention: '7 years'
    },
    {
      type: 'record',
      description: 'Security training completion records',
      frequency: 'annual',
      retention: '5 years'
    },
    {
      type: 'record',
      description: 'Termination processing records',
      frequency: 'per-termination',
      retention: '7 years'
    },
    {
      type: 'record',
      description: 'Performance review security assessments',
      frequency: 'annual',
      retention: '3 years'
    },
    {
      type: 'document',
      description: 'Exit interview security notes',
      frequency: 'per-termination',
      retention: '3 years'
    }
  ],
  
  monitoringPoints: [
    {
      type: 'automated',
      metric: 'Employment lifecycle security compliance',
      frequency: 'daily',
      source: 'HR system',
      threshold: '100% compliant'
    },
    {
      type: 'automated',
      metric: 'Security training status',
      frequency: 'monthly',
      source: 'Learning management system',
      threshold: '95% current'
    },
    {
      type: 'automated',
      metric: 'Access management compliance',
      frequency: 'daily',
      source: 'IAM system',
      threshold: '100% compliant'
    }
  ]
};
