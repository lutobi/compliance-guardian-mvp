import { EnhancedControl } from '../../../types/enhanced-framework';

export const informationSecurityPolicies: EnhancedControl = {
  id: 'A.5',
  title: 'Information Security Policies',
  description: 'Management direction for information security',
  category: 'Governance',
  status: 'implemented',
  riskLevel: 'high',
  applicability: ['organization-wide', 'all-systems', 'all-processes'],
  references: ['ISO/IEC 27002:2022'],
  dependencies: [],
  
  subControls: [
    {
      id: 'A.5.1',
      title: 'Policies for information security',
      description: 'Information security policy and topic-specific policies',
      requirements: [
        'Information security policy document',
        'Supporting topic-specific policies',
        'Regular review and updates',
        'Management approval'
      ],
      monitoringPoints: [
        {
          type: 'semi-automated',
          metric: 'Policy document status',
          frequency: 'quarterly',
          source: 'Document management system',
          threshold: '100% current'
        },
        {
          type: 'semi-automated',
          metric: 'Policy review completion',
          frequency: 'annual',
          source: 'Compliance tracking system'
        }
      ]
    },
    {
      id: 'A.5.2',
      title: 'Review of the policies for information security',
      description: 'Regular review and update of security policies',
      requirements: [
        'Review schedule',
        'Stakeholder involvement',
        'Change documentation',
        'Version control'
      ],
      monitoringPoints: [
        {
          type: 'automated',
          metric: 'Review schedule adherence',
          frequency: 'monthly',
          source: 'Compliance calendar',
          threshold: '100% on-time'
        },
        {
          type: 'semi-automated',
          metric: 'Stakeholder participation',
          frequency: 'per-review',
          source: 'Review tracking system'
        }
      ]
    }
  ],
  
  evidence: [
    {
      type: 'document',
      description: 'Information Security Policy',
      frequency: 'annual',
      retention: '5 years'
    },
    {
      type: 'record',
      description: 'Policy review records',
      frequency: 'annual',
      retention: '3 years'
    },
    {
      type: 'document',
      description: 'Topic-specific policies',
      frequency: 'annual',
      retention: '5 years'
    },
    {
      type: 'record',
      description: 'Policy distribution acknowledgments',
      frequency: 'continuous',
      retention: '2 years'
    },
    {
      type: 'record',
      description: 'Policy exception records',
      frequency: 'as-needed',
      retention: '3 years'
    }
  ],
  
  monitoringPoints: [
    {
      type: 'automated',
      metric: 'Policy documentation completeness',
      frequency: 'monthly',
      source: 'Document management system',
      threshold: '100% coverage'
    },
    {
      type: 'semi-automated',
      metric: 'Policy review status',
      frequency: 'quarterly',
      source: 'Compliance tracking system',
      threshold: '100% current'
    },
    {
      type: 'automated',
      metric: 'Policy distribution status',
      frequency: 'monthly',
      source: 'Training management system',
      threshold: '95% acknowledgment'
    }
  ]
};
