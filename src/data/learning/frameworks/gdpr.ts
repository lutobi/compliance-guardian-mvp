import { FrameworkLearning } from '@/types/learning';

export const gdprLearning: FrameworkLearning = {
  id: 'gdpr',
  name: 'General Data Protection Regulation (GDPR)',
  overview: {
    description: 'The General Data Protection Regulation (GDPR) is a comprehensive data protection law that sets guidelines for the collection and processing of personal information from individuals in the European Union (EU).',
    importance: 'GDPR has become the global standard for privacy protection, influencing data protection laws worldwide. Non-compliance can result in significant fines of up to €20 million or 4% of global revenue.',
    applicability: [
      'Organizations processing EU residents\' personal data',
      'Companies offering goods or services to EU residents',
      'Businesses monitoring EU residents\' behavior',
      'Organizations with employees in the EU'
    ],
    targetAudience: [
      'Data Protection Officers',
      'Privacy Officers',
      'Compliance Managers',
      'IT Security Teams',
      'Legal Teams'
    ],
    benefits: [
      'Enhanced data protection and privacy',
      'Improved customer trust and loyalty',
      'Better data management practices',
      'Competitive advantage in the market',
      'Reduced risk of data breaches'
    ],
    timeline: 'Implementation typically takes 6-12 months depending on organization size and complexity',
    costConsiderations: [
      'Data protection officer hiring/training',
      'Technology and system updates',
      'Staff training and awareness programs',
      'Documentation and process development',
      'Ongoing compliance monitoring'
    ]
  },
  governingBody: {
    name: 'European Data Protection Board (EDPB)',
    website: 'https://edpb.europa.eu',
    description: 'The EDPB is responsible for ensuring consistent application of the GDPR throughout the EU',
    resources: [
      {
        title: 'Official GDPR Text',
        url: 'https://gdpr.eu/tag/gdpr',
        type: 'documentation',
        description: 'Full text of the GDPR regulation'
      },
      {
        title: 'EDPB Guidelines',
        url: 'https://edpb.europa.eu/our-work-tools/general-guidance/guidelines-recommendations-best-practices_en',
        type: 'guide',
        description: 'Official guidelines and recommendations'
      },
      {
        title: 'Data Protection Impact Assessment Tool',
        url: 'https://www.cnil.fr/en/privacy-impact-assessment-pia',
        type: 'tool',
        description: 'Tool for conducting DPIAs'
      }
    ]
  },
  keyComponents: [
    {
      name: 'Data Processing Principles',
      description: 'Core principles governing the processing of personal data',
      importance: 'These principles form the foundation of GDPR compliance and must be demonstrated in all processing activities'
    },
    {
      name: 'Legal Basis for Processing',
      description: 'Valid grounds for processing personal data',
      importance: 'Organizations must identify and document the legal basis for each processing activity'
    },
    {
      name: 'Data Subject Rights',
      description: 'Rights granted to individuals regarding their personal data',
      importance: 'Organizations must implement procedures to handle data subject requests effectively'
    }
  ],
  implementation: {
    steps: [
      {
        name: 'Data Mapping',
        description: 'Create a comprehensive inventory of all personal data processing activities',
        tasks: [
          'Identify all personal data sources',
          'Document data flows and transfers',
          'Map data storage locations',
          'Record processing purposes'
        ]
      },
      {
        name: 'Gap Analysis',
        description: 'Assess current practices against GDPR requirements',
        tasks: [
          'Review existing policies',
          'Evaluate security measures',
          'Check consent mechanisms',
          'Assess data subject rights handling'
        ]
      },
      {
        name: 'Documentation',
        description: 'Develop and maintain required documentation',
        tasks: [
          'Privacy notices',
          'Processing records',
          'DPIA procedures',
          'Breach response plans'
        ]
      },
      {
        name: 'Technical Controls',
        description: 'Implement necessary technical measures',
        tasks: [
          'Data encryption',
          'Access controls',
          'Monitoring systems',
          'Backup procedures'
        ]
      }
    ],
    commonChallenges: [
      {
        challenge: 'International Data Transfers',
        solution: 'Implement Standard Contractual Clauses (SCCs) and conduct transfer impact assessments',
        prevention: 'Regular review of transfer mechanisms and data flow documentation'
      },
      {
        challenge: 'Consent Management',
        solution: 'Deploy consent management platform with granular options',
        prevention: 'Regular consent audit and update of privacy notices'
      },
      {
        challenge: 'Data Subject Rights',
        solution: 'Establish automated systems for handling DSR requests',
        prevention: 'Regular testing of DSR procedures and staff training'
      },
      {
        challenge: 'Data Minimization',
        solution: 'Implement data retention policies and automated cleanup',
        prevention: 'Regular data inventory and necessity assessments'
      }
    ]
  },

  controls: [
    {
      id: 'GDPR-ART5',
      name: 'Article 5 - Processing Principles',
      description: 'Principles relating to processing of personal data including lawfulness, fairness, and transparency',
      examples: [
        {
          scenario: 'Email Marketing Campaign',
          implementation: 'Implement double opt-in process for newsletter subscriptions with clear privacy notice',
          evidence: 'Consent records including timestamp, IP address, and version of privacy notice shown',
          tips: [
            'Use checkbox for explicit consent',
            'Maintain audit trail of consent',
            'Make unsubscribe process clear'
          ]
        },
        {
          scenario: 'Customer Data Storage',
          implementation: 'Implement data retention policies with automated deletion',
          evidence: 'Data inventory, retention schedule, deletion logs',
          tips: [
            'Document retention periods',
            'Implement automated cleanup',
            'Maintain deletion certificates'
          ]
        }
      ],
      commonChallenges: [
        'Determining appropriate retention periods',
        'Implementing data minimization',
        'Maintaining accurate records',
        'Ensuring cross-border compliance'
      ],
      bestPractices: [
        'Regular data protection impact assessments',
        'Comprehensive data mapping',
        'Clear documentation of processing activities',
        'Regular staff training'
      ]
    },
    {
      id: 'GDPR-ART7',
      name: 'Article 7 - Conditions for Consent',
      description: 'Requirements for obtaining and managing valid consent',
      examples: [
        {
          scenario: 'Website Cookie Consent',
          implementation: 'Implement granular cookie consent banner with clear options',
          evidence: 'Cookie consent records, banner screenshots, preference center',
          tips: [
            'Allow granular selection',
            'No pre-ticked boxes',
            'Easy withdrawal option'
          ]
        }
      ],
      commonChallenges: [
        'Obtaining valid consent',
        'Managing consent withdrawal',
        'Demonstrating consent',
        'Handling children\'s consent'
      ],
      bestPractices: [
        'Use clear and plain language',
        'Keep detailed consent records',
        'Regular consent review',
        'Implement easy withdrawal'
      ]
    },
    {
      id: 'GDPR-ART15',
      name: 'Article 15 - Right of Access',
      description: 'Data subjects\'s right to obtain confirmation of their data processing and access to their personal data',
      examples: [
        {
          scenario: 'Data Subject Access Request Portal',
          implementation: 'Create a self-service portal for users to access their data',
          evidence: 'Portal logs, request tracking system, response templates',
          tips: [
            'Verify identity securely',
            'Set up automated responses',
            'Track request timelines'
          ]
        }
      ],
      commonChallenges: [
        'Identity verification',
        'Meeting response deadlines',
        'Handling complex requests',
        'Data format and portability'
      ],
      bestPractices: [
        'Standardize request process',
        'Train staff on handling requests',
        'Document all responses',
        'Regular process review'
      ]
    },
    {
      id: 'GDPR-ART32',
      name: 'Article 32 - Security of Processing',
      description: 'Implementation of appropriate technical and organizational measures to ensure data security',
      examples: [
        {
          scenario: 'Cloud Data Storage',
          implementation: 'Implement encryption at rest and in transit with access controls',
          evidence: 'Encryption certificates, access logs, security audits',
          tips: [
            'Use strong encryption',
            'Regular security testing',
            'Monitor access patterns'
          ]
        }
      ],
      commonChallenges: [
        'Keeping up with threats',
        'Balancing security and usability',
        'Managing third-party risks',
        'Resource constraints'
      ],
      bestPractices: [
        'Regular security assessments',
        'Employee security training',
        'Incident response planning',
        'Security by design'
      ]
    },
    {
      id: 'GDPR-ART35',
      name: 'Article 35 - Data Protection Impact Assessment',
      description: 'Assessment of processing operations that are likely to result in high risk to individuals',
      examples: [
        {
          scenario: 'New AI System Implementation',
          implementation: 'Conduct DPIA before deploying AI-based processing',
          evidence: 'DPIA documentation, risk assessments, mitigation plans',
          tips: [
            'Start DPIA early',
            'Involve stakeholders',
            'Document all decisions'
          ]
        }
      ],
      commonChallenges: [
        'Identifying high-risk processing',
        'Assessing risk levels',
        'Implementing mitigations',
        'Ongoing monitoring'
      ],
      bestPractices: [
        'Use structured DPIA template',
        'Regular review and updates',
        'Stakeholder consultation',
        'Document risk decisions'
      ]
    }
  ],
  casestudies: [
    {
      title: 'Global E-commerce Platform GDPR Implementation',
      industry: 'E-commerce',
      challenge: 'Implementing GDPR compliance across multiple jurisdictions with complex data flows',
      solution: 'Developed centralized privacy program with local adaptations, automated consent management, and standardized data handling procedures',
      outcome: 'Achieved full GDPR compliance, improved customer trust, and created reusable framework for new privacy regulations'
    },
    {
      title: 'Healthcare Provider Data Protection',
      industry: 'Healthcare',
      challenge: 'Managing sensitive health data while ensuring GDPR compliance and maintaining service efficiency',
      solution: 'Implemented privacy by design principles, enhanced security measures, and streamlined data subject rights processes',
      outcome: 'Strengthened data protection while improving patient data access and control'
    }
  ],
  faqs: [
    {
      question: 'What are the main GDPR principles?',
      answer: 'The main principles are: lawfulness, fairness and transparency; purpose limitation; data minimization; accuracy; storage limitation; integrity and confidentiality; and accountability.'
    },
    {
      question: 'What are the penalties for non-compliance?',
      answer: 'Up to €20 million or 4% of global annual turnover, whichever is higher, for serious breaches. Lesser breaches can result in fines up to €10 million or 2% of global annual turnover.'
    },
    {
      question: 'How long do organizations have to respond to data subject requests?',
      answer: 'Organizations must respond to requests without undue delay and at the latest within one month of receipt. This can be extended by two further months for complex or numerous requests.'
    },
    {
      question: 'What is a Data Protection Impact Assessment (DPIA)?',
      answer: 'A DPIA is a process to help identify and minimize data protection risks. It\'s required when processing is likely to result in a high risk to individuals, particularly for new technologies or large-scale processing of sensitive data.'
    }
  ]
};
