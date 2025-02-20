import { EnhancedControl } from '../../../types/enhanced-framework';

export const organizationSecurity: EnhancedControl = {
  id: 'A.6',
  title: 'Organization of information security',
  description: 'Internal organization and mobile devices/teleworking',
  category: 'Organizational Controls',
  status: 'implemented',
  riskLevel: 'high',
  applicability: ['organization-wide'],
  references: ['ISO/IEC 27002:2022'],
  dependencies: ['A.5'],
  
  subControls: [
    {
      id: 'A.6.1',
      title: 'Internal organization',
      description: 'Framework for management to initiate and control information security implementation',
      requirements: [
        'Information security roles and responsibilities',
        'Segregation of duties',
        'Contact with authorities',
        'Contact with special interest groups',
        'Information security in project management'
      ],
      monitoringPoints: [
        {
          type: 'semi-automated',
          metric: 'Role assignment coverage',
          frequency: 'monthly',
          source: 'HR system',
          threshold: '100% assigned'
        },
        {
          type: 'automated',
          metric: 'Duty segregation conflicts',
          frequency: 'daily',
          source: 'Access control system',
          threshold: '0 conflicts'
        }
      ]
    },
    {
      id: 'A.6.2',
      title: 'Mobile devices and teleworking',
      description: 'Security of mobile devices and teleworking',
      requirements: [
        'Mobile device policy',
        'Remote access controls',
        'Device encryption',
        'Secure communication channels',
        'Data protection measures'
      ],
      monitoringPoints: [
        {
          type: 'automated',
          metric: 'Device encryption status',
          frequency: 'daily',
          source: 'MDM system',
          threshold: '100% encrypted'
        },
        {
          type: 'automated',
          metric: 'VPN usage compliance',
          frequency: 'continuous',
          source: 'Network monitoring',
          threshold: '100% compliant'
        }
      ]
    }
  ],
  
  evidence: [
    {
      type: 'document',
      description: 'Information security roles and responsibilities matrix',
      frequency: 'annual',
      retention: '5 years'
    },
    {
      type: 'report',
      description: 'Segregation of duties analysis',
      frequency: 'quarterly',
      retention: '3 years'
    },
    {
      type: 'document',
      description: 'Mobile device and teleworking policy',
      frequency: 'annual',
      retention: '5 years'
    },
    {
      type: 'record',
      description: 'Special interest group participation records',
      frequency: 'ongoing',
      retention: '2 years'
    },
    {
      type: 'report',
      description: 'Project security assessment reports',
      frequency: 'per-project',
      retention: '3 years'
    }
  ],
  
  monitoringPoints: [
    {
      type: 'automated',
      metric: 'Role coverage',
      frequency: 'monthly',
      source: 'HR system',
      threshold: '100% assigned'
    },
    {
      type: 'automated',
      metric: 'Mobile device compliance',
      frequency: 'daily',
      source: 'MDM system',
      threshold: '95% compliant'
    },
    {
      type: 'semi-automated',
      metric: 'Project security assessment completion',
      frequency: 'quarterly',
      source: 'Project management system',
      threshold: '100% assessed'
    }
  ]
};
