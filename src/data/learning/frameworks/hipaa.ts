import { FrameworkLearning } from '@/types/learning';

export const hipaaLearning: FrameworkLearning = {
  id: 'hipaa',
  name: 'Health Insurance Portability and Accountability Act (HIPAA)',
  version: '2013',
  overview: {
    description: 'HIPAA is a US federal law that protects sensitive patient health information from being disclosed without the patient\'s consent or knowledge.',
    importance: 'HIPAA compliance is crucial for healthcare providers, insurers, and their business associates to protect patient privacy and maintain trust in the healthcare system.',
    applicability: [
      'Healthcare providers (doctors, clinics, hospitals)',
      'Health insurance companies',
      'Healthcare clearinghouses',
      'Business associates handling PHI',
      'Healthcare technology companies'
    ],
    targetAudience: [
      'Privacy Officers',
      'Healthcare Administrators',
      'IT Security Teams',
      'Medical Staff',
      'Business Associates'
    ],
    benefits: [
      'Protected patient privacy',
      'Secure health information exchange',
      'Improved patient trust',
      'Standardized healthcare operations',
      'Reduced risk of data breaches'
    ],
    timeline: 'Implementation typically takes 6-18 months depending on organization size and complexity',
    costConsiderations: [
      'Security technology investments',
      'Staff training programs',
      'Policy development',
      'Risk assessment',
      'Ongoing compliance monitoring'
    ]
  },
  governingBody: {
    name: 'U.S. Department of Health and Human Services (HHS)',
    website: 'https://www.hhs.gov/hipaa',
    description: 'HHS Office for Civil Rights (OCR) enforces HIPAA rules and investigates violations',
    resources: [
      {
        title: 'HIPAA Privacy Rule',
        url: 'https://www.hhs.gov/hipaa/for-professionals/privacy',
        type: 'documentation',
        description: 'Official documentation of HIPAA Privacy Rule requirements'
      },
      {
        title: 'Security Rule Guidance',
        url: 'https://www.hhs.gov/hipaa/for-professionals/security',
        type: 'guide',
        description: 'Guidance on implementing HIPAA Security Rule'
      },
      {
        title: 'Breach Notification Rule',
        url: 'https://www.hhs.gov/hipaa/for-professionals/breach-notification',
        type: 'documentation',
        description: 'Requirements for breach notification'
      }
    ]
  },
  keyComponents: [
    {
      name: 'Privacy Rule',
      description: 'Sets standards for patient privacy protection',
      importance: 'Defines what information is protected and how it can be used or disclosed'
    },
    {
      name: 'Security Rule',
      description: 'Technical and physical safeguards for electronic PHI',
      importance: 'Ensures appropriate security measures are in place to protect electronic health information'
    },
    {
      name: 'Enforcement Rule',
      description: 'Procedures for enforcing HIPAA rules',
      importance: 'Defines penalties for violations and compliance investigation procedures'
    },
    {
      name: 'Breach Notification Rule',
      description: 'Requirements for reporting data breaches',
      importance: 'Ensures proper notification of affected individuals and authorities in case of breaches'
    }
  ],
  controls: [
    {
      id: 'HIPAA-PR',
      name: 'Privacy Rule Controls',
      description: 'Controls for protecting individual\'s health information and setting limits on use and disclosure',
      examples: [
        {
          scenario: 'Patient Record Access',
          implementation: 'Implement role-based access control and audit logging for PHI access',
          evidence: 'Access logs, role definitions, authorization procedures',
          tips: [
            'Document access control policies',
            'Regular access reviews',
            'Maintain audit trails'
          ]
        },
        {
          scenario: 'Information Disclosure',
          implementation: 'Establish procedures for authorized information sharing',
          evidence: 'Disclosure authorization forms, disclosure logs',
          tips: [
            'Use standardized forms',
            'Train staff on procedures',
            'Document all disclosures'
          ]
        }
      ]
    },
    {
      id: 'HIPAA-SR',
      name: 'Security Rule Controls',
      description: 'Technical, physical, and administrative safeguards for electronic PHI',
      examples: [
        {
          scenario: 'Data Encryption',
          implementation: 'Implement encryption for data at rest and in transit',
          evidence: 'Encryption configurations, security assessments',
          tips: [
            'Use industry-standard encryption',
            'Regular key rotation',
            'Document encryption methods'
          ]
        },
        {
          scenario: 'Workstation Security',
          implementation: 'Secure physical access to workstations with PHI access',
          evidence: 'Physical security measures, workstation use policies',
          tips: [
            'Use screen locks',
            'Implement clean desk policy',
            'Regular security audits'
          ]
        }
      ]
    }
  ],
  implementation: {
    steps: [
      {
        name: 'Risk Assessment',
        description: 'Conduct a comprehensive risk analysis',
        tasks: [
          'Identify all PHI locations',
          'Assess current security measures',
          'Document potential risks and vulnerabilities'
        ]
      },
      {
        name: 'Policy Development',
        description: 'Create and document required policies and procedures',
        tasks: [
          'Privacy policies',
          'Security procedures',
          'Breach notification process'
        ]
      },
      {
        name: 'Training Program',
        description: 'Develop and conduct staff training',
        tasks: [
          'Privacy awareness training',
          'Security best practices',
          'Incident response procedures'
        ]
      }
    ],
    commonChallenges: [
      {
        challenge: 'Mobile Device Management',
        solution: 'Implement MDM solution and BYOD policies',
        prevention: 'Regular policy updates and enforcement'
      },
      {
        challenge: 'Third-party Risk',
        solution: 'Robust business associate agreements and monitoring',
        prevention: 'Regular vendor assessments and audits'
      }
    ]
  }
};
