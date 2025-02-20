import { FrameworkLearning } from '@/types/learning';

export const soc2Learning: FrameworkLearning = {
  id: 'soc2',
  name: 'SOC 2',
  overview: {
    description: 'SOC 2 (Service Organization Control 2) is a framework that specifies how organizations should protect customer data based on five "trust service criteria": security, availability, processing integrity, confidentiality, and privacy.',
    importance: 'SOC 2 compliance demonstrates an organization\'s commitment to data security and privacy, making it essential for service providers handling customer data. It has become a de facto requirement for SaaS companies and data centers.',
    applicability: [
      'Cloud service providers',
      'SaaS companies',
      'Data centers and hosting providers',
      'Companies handling customer data',
      'Technology service providers',
      'Organizations serving enterprise customers'
    ],
    benefits: [
      'Enhanced customer trust and confidence',
      'Competitive advantage in the market',
      'Improved security posture',
      'Better risk management',
      'Streamlined vendor assessment process',
      'Demonstrated commitment to data protection'
    ],
    timeline: 'Initial SOC 2 Type 1 audit typically takes 3-6 months. Type 2 audit requires an additional observation period of 6-12 months.',
    costConsiderations: [
      'Initial gap analysis and remediation',
      'Security tool implementations',
      'Documentation development',
      'Audit preparation and fees',
      'Ongoing compliance maintenance',
      'Staff training and resources'
    ]
  },
  keyComponents: [
    {
      name: 'Security',
      description: 'Protection against unauthorized access, maintaining system security through various controls.',
      importance: 'Foundation of SOC 2 compliance, required for all audits'
    },
    {
      name: 'Availability',
      description: 'System availability for operation and use as committed or agreed.',
      importance: 'Critical for service providers guaranteeing uptime'
    },
    {
      name: 'Processing Integrity',
      description: 'System processing is complete, accurate, timely, and authorized.',
      importance: 'Essential for financial or critical data processing'
    },
    {
      name: 'Confidentiality',
      description: 'Information designated as confidential is protected according to policy or agreement.',
      importance: 'Crucial for handling sensitive business information'
    },
    {
      name: 'Privacy',
      description: 'Personal information is collected, used, retained, and disclosed in accordance with commitments.',
      importance: 'Vital for organizations handling personal data'
    }
  ],
  implementation: {
    steps: [
      {
        name: 'Scope Definition',
        description: 'Define which trust service criteria are applicable and what systems are in scope.',
        tasks: [
          'Identify relevant trust service criteria',
          'Document system boundaries',
          'Map data flows and processes',
          'Define audit objectives'
        ]
      },
      {
        name: 'Gap Analysis',
        description: 'Assess current controls against SOC 2 requirements to identify gaps.',
        tasks: [
          'Review existing controls',
          'Compare against SOC 2 requirements',
          'Document gaps and deficiencies',
          'Prioritize remediation efforts'
        ]
      },
      {
        name: 'Control Implementation',
        description: 'Implement required controls and document procedures.',
        tasks: [
          'Develop security policies',
          'Implement technical controls',
          'Create procedure documentation',
          'Establish monitoring processes'
        ]
      },
      {
        name: 'Documentation',
        description: 'Create and maintain required documentation for all controls.',
        tasks: [
          'Document control objectives',
          'Create process workflows',
          'Maintain evidence collection',
          'Develop audit trail procedures'
        ]
      },
      {
        name: 'Audit Preparation',
        description: 'Prepare for the SOC 2 audit through testing and validation.',
        tasks: [
          'Conduct internal audits',
          'Gather evidence packages',
          'Train staff on procedures',
          'Review documentation completeness'
        ]
      }
    ],
    commonChallenges: [
      {
        challenge: 'Evidence Collection',
        solution: 'Implement automated evidence collection tools and establish clear documentation procedures.',
        prevention: 'Create a systematic approach to evidence collection from the start.'
      },
      {
        challenge: 'Control Consistency',
        solution: 'Regular monitoring and testing of controls to ensure consistent operation.',
        prevention: 'Implement automated controls where possible and establish clear procedures.'
      },
      {
        challenge: 'Resource Allocation',
        solution: 'Dedicated team members and clear responsibility assignment.',
        prevention: 'Plan resource requirements early and secure management commitment.'
      },
      {
        challenge: 'Vendor Management',
        solution: 'Establish strong vendor assessment and monitoring processes.',
        prevention: 'Create comprehensive vendor management program from the outset.'
      }
    ]
  },
  controls: [
    {
      id: 'CC1.0',
      name: 'Control Environment',
      description: 'The foundation for an organization\'s security program, including management\'s commitment to integrity and ethical values.',
      examples: [
        {
          scenario: 'Employee Onboarding',
          implementation: 'Comprehensive background checks and security training program for all new employees.',
          evidence: 'Background check reports, training completion records, signed agreements',
          tips: [
            'Document all training materials',
            'Maintain clear onboarding checklists',
            'Regular training updates'
          ]
        }
      ],
      commonChallenges: [
        'Maintaining consistent documentation',
        'Ensuring complete coverage',
        'Regular updates and reviews'
      ],
      bestPractices: [
        'Regular policy reviews',
        'Automated documentation',
        'Clear responsibility assignment'
      ]
    },
    {
      id: 'CC2.0',
      name: 'Communication and Information',
      description: 'Systems for communicating and sharing information necessary to support the functioning of internal control.',
      examples: [
        {
          scenario: 'Security Incident Response',
          implementation: 'Documented incident response plan with clear communication channels and procedures.',
          evidence: 'Incident response documentation, communication logs, test results',
          tips: [
            'Regular plan testing',
            'Clear escalation paths',
            'Document all communications'
          ]
        }
      ],
      commonChallenges: [
        'Maintaining communication channels',
        'Ensuring timely notifications',
        'Documentation completeness'
      ],
      bestPractices: [
        'Regular communication testing',
        'Clear documentation',
        'Automated notifications'
      ]
    },
    {
      id: 'CC3.0',
      name: 'Risk Assessment',
      description: 'Process for identifying, assessing, and managing risks to organizational objectives.',
      examples: [
        {
          scenario: 'Annual Risk Assessment',
          implementation: 'Comprehensive risk assessment process including threat modeling and impact analysis.',
          evidence: 'Risk assessment reports, mitigation plans, review documentation',
          tips: [
            'Regular updates',
            'Clear methodology',
            'Stakeholder involvement'
          ]
        }
      ],
      commonChallenges: [
        'Comprehensive risk identification',
        'Regular updates',
        'Resource allocation'
      ],
      bestPractices: [
        'Structured methodology',
        'Regular reviews',
        'Clear documentation'
      ]
    }
  ],
  governingBody: {
    name: 'American Institute of CPAs (AICPA)',
    description: 'The AICPA develops and maintains the SOC 2 framework, providing guidance and requirements for audits.',
    website: 'https://www.aicpa.org/interestareas/frc/assuranceadvisoryservices/sorhome.html',
    resources: [
      {
        title: 'SOC 2 Guide',
        description: 'Comprehensive guide to understanding SOC 2 requirements and implementation.',
        url: 'https://www.aicpa.org/interestareas/frc/assuranceadvisoryservices/socforserviceorganizations.html'
      },
      {
        title: 'Trust Services Criteria',
        description: 'Detailed explanation of the trust services criteria and their requirements.',
        url: 'https://www.aicpa.org/interestareas/frc/assuranceadvisoryservices/trustservices.html'
      },
      {
        title: 'Implementation Resources',
        description: 'Tools and resources for implementing SOC 2 controls.',
        url: 'https://www.aicpa.org/interestareas/frc/assuranceadvisoryservices/serviceorganization-resources.html'
      }
    ]
  }
};
