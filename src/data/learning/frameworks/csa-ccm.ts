import { FrameworkLearning } from '@/types/learning';

export const csaCcmLearning: FrameworkLearning = {
  id: 'csa-ccm',
  name: 'CSA CCM - Cloud Controls Matrix',
  overview: {
    description: 'The Cloud Security Alliance\'s Cloud Controls Matrix (CSA CCM) is a cybersecurity control framework for cloud computing. It provides organizations with detailed security concepts and principles to assess and improve their cloud security posture.',
    importance: 'As organizations increasingly move to cloud-based services, the CSA CCM provides a comprehensive framework for ensuring security controls are in place across cloud environments.',
    applicability: [
      'Cloud service providers',
      'Organizations using cloud services',
      'Security assessors and auditors',
      'Cloud security architects',
      'Compliance managers',
      'Risk management teams'
    ],
    benefits: [
      'Standardized security controls',
      'Risk management improvement',
      'Regulatory compliance',
      'Security assessment framework',
      'Cloud vendor evaluation',
      'Security program development'
    ],
    timeline: 'Implementation typically takes 6-12 months, depending on organizational complexity and cloud environment.',
    costConsiderations: [
      'Control implementation',
      'Security tool deployment',
      'Staff training',
      'Documentation development',
      'Assessment and auditing',
      'Ongoing maintenance'
    ]
  },
  keyComponents: [
    {
      name: 'Control Domains',
      description: 'Organized security control categories.',
      importance: 'Framework structure'
    },
    {
      name: 'Control Specifications',
      description: 'Detailed control requirements and guidance.',
      importance: 'Implementation details'
    },
    {
      name: 'Mapping References',
      description: 'Links to other security frameworks.',
      importance: 'Compliance alignment'
    },
    {
      name: 'Assessment Guidance',
      description: 'Control assessment methodology.',
      importance: 'Evaluation criteria'
    },
    {
      name: 'Implementation Guidance',
      description: 'Best practices for control deployment.',
      importance: 'Practical application'
    }
  ],
  implementation: {
    steps: [
      {
        name: 'Assessment',
        description: 'Evaluate current cloud security controls against CCM.',
        tasks: [
          'Review controls',
          'Identify gaps',
          'Document findings',
          'Plan remediation'
        ]
      },
      {
        name: 'Control Implementation',
        description: 'Deploy required security controls.',
        tasks: [
          'Prioritize controls',
          'Design solutions',
          'Deploy controls',
          'Test effectiveness'
        ]
      },
      {
        name: 'Documentation',
        description: 'Create required policies and procedures.',
        tasks: [
          'Write policies',
          'Create procedures',
          'Document controls',
          'Maintain records'
        ]
      },
      {
        name: 'Training',
        description: 'Train staff on CCM requirements and controls.',
        tasks: [
          'Develop materials',
          'Conduct training',
          'Assess knowledge',
          'Document completion'
        ]
      },
      {
        name: 'Monitoring',
        description: 'Establish ongoing control monitoring.',
        tasks: [
          'Define metrics',
          'Monitor controls',
          'Review effectiveness',
          'Report status'
        ]
      }
    ],
    commonChallenges: [
      {
        challenge: 'Control Complexity',
        solution: 'Break down controls into manageable components.',
        prevention: 'Develop clear implementation roadmap.'
      },
      {
        challenge: 'Cloud Provider Integration',
        solution: 'Work closely with providers on control implementation.',
        prevention: 'Early provider engagement and assessment.'
      },
      {
        challenge: 'Resource Constraints',
        solution: 'Prioritize critical controls and phase implementation.',
        prevention: 'Realistic resource planning and allocation.'
      },
      {
        challenge: 'Technical Implementation',
        solution: 'Leverage automation and security tools.',
        prevention: 'Proper tool selection and integration planning.'
      }
    ]
  },
  controls: [
    {
      id: 'AIS',
      name: 'Application & Interface Security',
      description: 'Controls for securing application interfaces and APIs.',
      examples: [
        {
          scenario: 'API Security Implementation',
          implementation: 'Deploy API gateway with security controls.',
          evidence: 'Security configurations, monitoring logs, test results',
          tips: [
            'Authentication',
            'Rate limiting',
            'Input validation'
          ]
        }
      ],
      commonChallenges: [
        'API versioning',
        'Security testing',
        'Monitoring coverage'
      ],
      bestPractices: [
        'Security by design',
        'Regular testing',
        'Monitoring'
      ]
    },
    {
      id: 'IAM',
      name: 'Identity & Access Management',
      description: 'Controls for managing identities and access in cloud environments.',
      examples: [
        {
          scenario: 'Cloud IAM Implementation',
          implementation: 'Deploy centralized IAM solution with MFA.',
          evidence: 'IAM policies, access logs, audit reports',
          tips: [
            'Least privilege',
            'Regular reviews',
            'Automation'
          ]
        }
      ],
      commonChallenges: [
        'Role management',
        'Access reviews',
        'Integration complexity'
      ],
      bestPractices: [
        'Automated provisioning',
        'Regular audits',
        'Clear procedures'
      ]
    },
    {
      id: 'IVS',
      name: 'Infrastructure & Virtualization Security',
      description: 'Controls for securing cloud infrastructure and virtualization.',
      examples: [
        {
          scenario: 'Network Segmentation',
          implementation: 'Implement virtual network segmentation.',
          evidence: 'Network diagrams, firewall rules, security groups',
          tips: [
            'Micro-segmentation',
            'Traffic monitoring',
            'Regular review'
          ]
        }
      ],
      commonChallenges: [
        'Configuration drift',
        'Performance impact',
        'Visibility'
      ],
      bestPractices: [
        'Automation',
        'Monitoring',
        'Documentation'
      ]
    }
  ],
  governingBody: {
    name: 'Cloud Security Alliance',
    description: 'The Cloud Security Alliance (CSA) is a non-profit organization dedicated to promoting best practices for securing cloud computing environments.',
    website: 'https://cloudsecurityalliance.org/',
    resources: [
      {
        title: 'CCM Framework',
        description: 'Official CCM documentation and controls.',
        url: 'https://cloudsecurityalliance.org/research/cloud-controls-matrix/'
      },
      {
        title: 'Implementation Guide',
        description: 'Guidance for implementing CCM controls.',
        url: 'https://cloudsecurityalliance.org/artifacts/ccm-implementation-guidance/'
      },
      {
        title: 'STAR Registry',
        description: 'Security, Trust, Assurance, and Risk (STAR) Registry.',
        url: 'https://cloudsecurityalliance.org/star/'
      }
    ]
  }
};
