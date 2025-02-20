import { EnhancedControl } from '../../../types/enhanced-framework';

export const accessControlDomain: EnhancedControl = {
  id: 'A.9',
  title: 'Access Control',
  description: 'Ensure authorized user access and prevent unauthorized access to systems and services',
  category: 'Technical Controls',
  status: 'implemented',
  riskLevel: 'high',
  applicability: ['all-systems', 'user-management', 'authentication'],
  references: ['ISO/IEC 27002:2022'],
  dependencies: ['A.5.1', 'A.6.2'],
  
  subControls: [
    {
      id: 'A.9.1',
      title: 'Business requirements of access control',
      description: 'Limit access to information and systems based on business requirements',
      requirements: [
        'Access control policy',
        'Role-based access model',
        'Business needs documentation'
      ],
      monitoringPoints: [
        {
          type: 'semi-automated',
          metric: 'Policy review status',
          frequency: 'quarterly',
          source: 'Policy management system'
        }
      ]
    },
    {
      id: 'A.9.2',
      title: 'User access management',
      description: 'Ensure authorized user access and prevent unauthorized access',
      requirements: [
        'User registration process',
        'Privilege management',
        'Access rights review'
      ],
      monitoringPoints: [
        {
          type: 'automated',
          metric: 'User account status',
          frequency: 'daily',
          source: 'IAM system',
          threshold: '100% compliance'
        },
        {
          type: 'automated',
          metric: 'Privilege changes',
          frequency: 'real-time',
          source: 'IAM system',
          validation: 'approval workflow'
        }
      ]
    },
    {
      id: 'A.9.3',
      title: 'User responsibilities',
      description: 'Make users accountable for safeguarding their authentication information',
      requirements: [
        'Password policy compliance',
        'Clean desk policy',
        'Secure authentication practices'
      ],
      monitoringPoints: [
        {
          type: 'automated',
          metric: 'Password policy compliance',
          frequency: 'real-time',
          source: 'IAM system'
        }
      ]
    }
  ],
  
  evidence: [
    {
      type: 'document',
      description: 'Access control policy',
      frequency: 'annual',
      retention: '3 years'
    },
    {
      type: 'report',
      description: 'Access rights review records',
      frequency: 'quarterly',
      retention: '1 year'
    },
    {
      type: 'log',
      description: 'Access attempt logs',
      frequency: 'continuous',
      retention: '6 months'
    }
  ],
  
  monitoringPoints: [
    {
      type: 'automated',
      metric: 'Overall access control compliance',
      frequency: 'daily',
      source: 'Compliance dashboard',
      threshold: '95% compliance'
    },
    {
      type: 'semi-automated',
      metric: 'Access review completion',
      frequency: 'quarterly',
      source: 'Review tracking system'
    }
  ]
};
