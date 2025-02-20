import { FrameworkLearning } from '@/types/learning';

export const ccpaLearning: FrameworkLearning = {
  id: 'ccpa',
  name: 'CCPA - California Consumer Privacy Act',
  version: '2020',
  overview: {
    description: 'The California Consumer Privacy Act (CCPA) is a state law that enhances privacy rights and consumer protection for residents of California. It establishes requirements for businesses to protect consumer data and provides California residents with specific data privacy rights.',
    importance: 'With increasing focus on consumer privacy rights and data protection, CCPA compliance is crucial for businesses handling California residents\' personal information. Non-compliance can result in significant fines and legal consequences.',
    applicability: [
      'For-profit businesses operating in California',
      'Companies collecting California residents\' data',
      'Businesses with annual revenue over $25 million',
      'Companies handling data of 50,000+ consumers',
      'Businesses deriving 50%+ revenue from data sales',
      'Service providers processing California data'
    ],
    benefits: [
      'Enhanced consumer trust',
      'Improved data governance',
      'Risk mitigation',
      'Competitive advantage',
      'Legal compliance',
      'Better data management'
    ],
    timeline: 'Implementation typically takes 4-8 months, depending on organizational complexity and current privacy practices.',
    costConsiderations: [
      'Privacy program development',
      'Technology implementation',
      'Staff training',
      'Documentation updates',
      'Legal consultation',
      'Ongoing compliance monitoring'
    ]
  },
  keyComponents: [
    {
      name: 'Consumer Rights',
      description: 'Core consumer privacy rights under CCPA.',
      importance: 'Foundation of compliance'
    },
    {
      name: 'Notice Requirements',
      description: 'Privacy notice and disclosure obligations.',
      importance: 'Transparency requirement'
    },
    {
      name: 'Data Inventory',
      description: 'Tracking personal information collection and use.',
      importance: 'Critical for compliance'
    },
    {
      name: 'Response Procedures',
      description: 'Processes for handling consumer requests.',
      importance: 'Operational requirement'
    },
    {
      name: 'Opt-Out Mechanisms',
      description: 'Systems for data sale opt-out.',
      importance: 'Consumer choice'
    }
  ],
  implementation: {
    steps: [
      {
        name: 'Assessment',
        description: 'Evaluate current privacy practices and CCPA obligations.',
        tasks: [
          'Review data practices',
          'Identify data sources',
          'Map data flows',
          'Document findings'
        ]
      },
      {
        name: 'Policy Development',
        description: 'Create or update privacy policies and procedures.',
        tasks: [
          'Update privacy notice',
          'Create response procedures',
          'Develop training materials',
          'Document processes'
        ]
      },
      {
        name: 'System Implementation',
        description: 'Implement technical solutions for compliance.',
        tasks: [
          'Deploy opt-out mechanism',
          'Create request portal',
          'Configure tracking',
          'Test systems'
        ]
      },
      {
        name: 'Training',
        description: 'Train staff on CCPA requirements and procedures.',
        tasks: [
          'Develop materials',
          'Conduct sessions',
          'Document training',
          'Assess understanding'
        ]
      },
      {
        name: 'Monitoring',
        description: 'Establish ongoing compliance monitoring.',
        tasks: [
          'Set up metrics',
          'Create reports',
          'Review effectiveness',
          'Update procedures'
        ]
      }
    ],
    commonChallenges: [
      {
        challenge: 'Data Discovery',
        solution: 'Implement data discovery and mapping tools.',
        prevention: 'Maintain current data inventory and flow diagrams.'
      },
      {
        challenge: 'Request Management',
        solution: 'Deploy automated request handling system.',
        prevention: 'Establish clear procedures and response workflows.'
      },
      {
        challenge: 'Third-Party Management',
        solution: 'Review and update vendor contracts.',
        prevention: 'Include CCPA requirements in vendor assessment.'
      },
      {
        challenge: 'Technical Implementation',
        solution: 'Phase implementation by priority.',
        prevention: 'Plan technical requirements early.'
      }
    ]
  },
  controls: [
    {
      id: 'CR-1',
      name: 'Right to Know',
      description: 'Consumer right to know what personal information is collected and how it is used.',
      examples: [
        {
          scenario: 'Information Request Response',
          implementation: 'Implement system to collect and provide personal information upon request.',
          evidence: 'Request logs, response documentation, data inventory',
          tips: [
            'Verify identity',
            'Track response time',
            'Document process'
          ]
        }
      ],
      commonChallenges: [
        'Identity verification',
        'Data collection',
        'Response timing'
      ],
      bestPractices: [
        'Automated systems',
        'Clear procedures',
        'Staff training'
      ]
    },
    {
      id: 'CR-2',
      name: 'Right to Delete',
      description: 'Consumer right to request deletion of personal information.',
      examples: [
        {
          scenario: 'Deletion Request Handling',
          implementation: 'Create process for verifying and executing deletion requests.',
          evidence: 'Deletion logs, verification records, exception documentation',
          tips: [
            'Document exceptions',
            'Verify completeness',
            'Track requests'
          ]
        }
      ],
      commonChallenges: [
        'System limitations',
        'Data dependencies',
        'Exception handling'
      ],
      bestPractices: [
        'Clear procedures',
        'Technical controls',
        'Documentation'
      ]
    },
    {
      id: 'CR-3',
      name: 'Right to Opt-Out',
      description: 'Consumer right to opt-out of personal information sales.',
      examples: [
        {
          scenario: 'Opt-Out Implementation',
          implementation: 'Deploy "Do Not Sell My Personal Information" functionality.',
          evidence: 'Opt-out mechanism, request logs, implementation documentation',
          tips: [
            'Clear interface',
            'Easy access',
            'Response tracking'
          ]
        }
      ],
      commonChallenges: [
        'Technical implementation',
        'Third-party coordination',
        'Verification process'
      ],
      bestPractices: [
        'User-friendly design',
        'Clear communication',
        'Regular testing'
      ]
    }
  ],
  governingBody: {
    name: 'California Attorney General',
    description: 'The California Attorney General\'s Office is responsible for enforcing the CCPA and providing guidance on compliance requirements.',
    website: 'https://oag.ca.gov/privacy/ccpa',
    resources: [
      {
        title: 'CCPA Regulations',
        description: 'Official CCPA regulations and requirements.',
        url: 'https://oag.ca.gov/privacy/ccpa/regs'
      },
      {
        title: 'Consumer Rights',
        description: 'Guide to consumer rights under CCPA.',
        url: 'https://oag.ca.gov/privacy/ccpa/consumers'
      },
      {
        title: 'Business Guide',
        description: 'Implementation guidance for businesses.',
        url: 'https://oag.ca.gov/privacy/ccpa/guidance'
      }
    ]
  }
};
