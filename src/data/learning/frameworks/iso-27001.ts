import { FrameworkLearning } from '@/types/learning';

export const iso27001Learning: FrameworkLearning = {
  id: 'iso-27001',
  name: 'ISO 27001 - Information Security Management',
  overview: {
    description: 'ISO/IEC 27001 is an international standard for managing information security. It provides a systematic approach to managing sensitive company information through risk management and implementing appropriate controls.',
    importance: 'As cyber threats continue to evolve and data breaches become more costly, ISO 27001 provides organizations with a proven framework for protecting their information assets and maintaining business continuity.',
    applicability: [
      'Organizations handling sensitive information',
      'Companies seeking international recognition',
      'Businesses in regulated industries',
      'Organizations with compliance requirements',
      'Companies with complex IT infrastructure',
      'Service providers handling client data'
    ],
    benefits: [
      'Enhanced information security',
      'Improved risk management',
      'International recognition',
      'Competitive advantage',
      'Client trust and confidence',
      'Regulatory compliance'
    ],
    timeline: 'Implementation typically takes 6-12 months, depending on organizational size and complexity.',
    costConsiderations: [
      'Gap analysis and assessment',
      'Documentation development',
      'Control implementation',
      'Staff training',
      'Certification audit',
      'Ongoing maintenance'
    ]
  },
  keyComponents: [
    {
      name: 'Information Security Policy',
      description: 'High-level policies defining security objectives and commitment.',
      importance: 'Foundation for security program'
    },
    {
      name: 'Risk Assessment',
      description: 'Systematic approach to identifying and evaluating risks.',
      importance: 'Critical for control selection'
    },
    {
      name: 'Control Framework',
      description: 'Set of security controls from Annex A.',
      importance: 'Core security implementation'
    },
    {
      name: 'Documentation',
      description: 'Required policies, procedures, and records.',
      importance: 'Evidence of compliance'
    },
    {
      name: 'Management Review',
      description: 'Regular review of ISMS effectiveness.',
      importance: 'Continuous improvement'
    }
  ],
  implementation: {
    steps: [
      {
        name: 'Initial Assessment',
        description: 'Evaluate current security posture and define scope.',
        tasks: [
          'Define ISMS scope',
          'Identify stakeholders',
          'Review current controls',
          'Document findings'
        ]
      },
      {
        name: 'Risk Assessment',
        description: 'Identify and assess information security risks.',
        tasks: [
          'Identify assets',
          'Assess threats',
          'Evaluate vulnerabilities',
          'Determine risk levels'
        ]
      },
      {
        name: 'Control Implementation',
        description: 'Select and implement security controls.',
        tasks: [
          'Select controls',
          'Develop procedures',
          'Implement controls',
          'Train staff'
        ]
      },
      {
        name: 'Documentation',
        description: 'Create required ISMS documentation.',
        tasks: [
          'Develop policies',
          'Create procedures',
          'Document processes',
          'Maintain records'
        ]
      },
      {
        name: 'Certification',
        description: 'Prepare for and undergo certification audit.',
        tasks: [
          'Internal audit',
          'Management review',
          'Corrective actions',
          'External audit'
        ]
      }
    ],
    commonChallenges: [
      {
        challenge: 'Documentation Overhead',
        solution: 'Use document management system and templates.',
        prevention: 'Establish documentation framework early in the process.'
      },
      {
        challenge: 'Resource Constraints',
        solution: 'Prioritize critical controls and phase implementation.',
        prevention: 'Develop realistic project plan with resource allocation.'
      },
      {
        challenge: 'Staff Resistance',
        solution: 'Regular training and communication.',
        prevention: 'Early stakeholder engagement and change management.'
      },
      {
        challenge: 'Control Implementation',
        solution: 'Risk-based approach to control selection.',
        prevention: 'Clear control objectives and implementation guidance.'
      }
    ]
  },
  controls: [
    {
      id: 'A.5',
      name: 'Information Security Policies',
      description: 'Management direction for information security.',
      examples: [
        {
          scenario: 'Security Policy Development',
          implementation: 'Create comprehensive information security policies aligned with business objectives.',
          evidence: 'Policy documents, review records, communication logs',
          tips: [
            'Clear policy structure',
            'Regular reviews',
            'Management approval'
          ]
        }
      ],
      commonChallenges: [
        'Policy maintenance',
        'Staff awareness',
        'Compliance monitoring'
      ],
      bestPractices: [
        'Regular updates',
        'Clear language',
        'Stakeholder input'
      ]
    },
    {
      id: 'A.8',
      name: 'Asset Management',
      description: 'Identify organizational assets and define protection responsibilities.',
      examples: [
        {
          scenario: 'Asset Inventory',
          implementation: 'Maintain comprehensive inventory of information assets and owners.',
          evidence: 'Asset register, ownership records, classification scheme',
          tips: [
            'Regular updates',
            'Clear ownership',
            'Classification criteria'
          ]
        }
      ],
      commonChallenges: [
        'Asset identification',
        'Ownership assignment',
        'Classification consistency'
      ],
      bestPractices: [
        'Automated tools',
        'Regular reviews',
        'Clear procedures'
      ]
    },
    {
      id: 'A.9',
      name: 'Access Control',
      description: 'Business requirements for access control.',
      examples: [
        {
          scenario: 'Access Management',
          implementation: 'Implement role-based access control with regular reviews.',
          evidence: 'Access policies, review logs, authorization records',
          tips: [
            'Principle of least privilege',
            'Regular reviews',
            'Documentation'
          ]
        }
      ],
      commonChallenges: [
        'Role definition',
        'Access reviews',
        'User lifecycle'
      ],
      bestPractices: [
        'Automated provisioning',
        'Regular audits',
        'Clear procedures'
      ]
    }
  ],
  governingBody: {
    name: 'International Organization for Standardization (ISO)',
    description: 'ISO is an independent, non-governmental international organization that develops standards to ensure quality, safety, and efficiency of products, services, and systems.',
    website: 'https://www.iso.org/',
    resources: [
      {
        title: 'ISO/IEC 27001:2013',
        description: 'Official ISO 27001 standard documentation.',
        url: 'https://www.iso.org/standard/27001.html'
      },
      {
        title: 'Implementation Guide',
        description: 'Guide for implementing ISO 27001 requirements.',
        url: 'https://www.iso.org/implementation-27001.html'
      },
      {
        title: 'ISO 27000 Family',
        description: 'Overview of the ISO 27000 series of standards.',
        url: 'https://www.iso.org/isoiec-27001-information-security.html'
      }
    ]
  }
};
