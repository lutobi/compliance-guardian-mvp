import { FrameworkLearning } from '@/types/learning';

export const nistAiRmfLearning: FrameworkLearning = {
  id: 'nist-ai-rmf',
  name: 'NIST AI Risk Management Framework',
  overview: {
    description: 'The NIST AI Risk Management Framework (AI RMF) is a guidance document that helps organizations better understand and manage the risks associated with artificial intelligence systems.',
    importance: 'As AI systems become increasingly prevalent across industries, managing their risks becomes crucial for organizational success and societal trust. The NIST AI RMF provides a structured approach to identifying, assessing, and mitigating AI-specific risks.',
    applicability: [
      'Organizations developing AI systems',
      'Companies deploying AI solutions',
      'Organizations using AI for decision-making',
      'Research institutions working with AI',
      'Government agencies implementing AI systems'
    ],
    benefits: [
      'Improved AI system reliability and safety',
      'Enhanced transparency and accountability',
      'Better risk management practices',
      'Increased stakeholder trust',
      'Structured approach to AI governance',
      'Compliance with emerging AI regulations'
    ],
    timeline: 'Implementation typically takes 6-12 months, depending on the organization\'s AI maturity and scope.',
    costConsiderations: [
      'Staff training and education',
      'Risk assessment tools and resources',
      'Documentation and process development',
      'External expertise and consultation',
      'Monitoring and testing tools',
      'Ongoing maintenance and updates'
    ]
  },
  keyComponents: [
    {
      name: 'Map',
      description: 'Establish context and prepare for AI risk management by understanding system characteristics, benefits, and potential impacts.',
      importance: 'Foundation for effective risk management and governance'
    },
    {
      name: 'Measure',
      description: 'Assess, analyze, and track AI risks through qualitative and quantitative approaches.',
      importance: 'Critical for understanding and prioritizing risks'
    },
    {
      name: 'Manage',
      description: 'Allocate resources and implement actions to optimize AI risks based on assessment results.',
      importance: 'Essential for risk mitigation and control'
    },
    {
      name: 'Govern',
      description: 'Cultivate a culture of risk management through policies, processes, and procedures.',
      importance: 'Ensures sustainable and responsible AI development'
    }
  ],
  implementation: {
    steps: [
      {
        name: 'Context Establishment',
        description: 'Define the scope and context of AI systems within the organization.',
        tasks: [
          'Identify AI systems and their purposes',
          'Document system characteristics and dependencies',
          'Define organizational context and constraints',
          'Identify stakeholders and their needs'
        ]
      },
      {
        name: 'Risk Assessment Framework',
        description: 'Develop or adapt risk assessment methodologies for AI systems.',
        tasks: [
          'Choose risk assessment methods',
          'Define risk criteria and thresholds',
          'Create assessment templates and tools',
          'Train staff on assessment procedures'
        ]
      },
      {
        name: 'Risk Identification',
        description: 'Identify potential risks across AI system lifecycle.',
        tasks: [
          'Conduct system analysis',
          'Perform threat modeling',
          'Assess vulnerabilities',
          'Document potential impacts'
        ]
      },
      {
        name: 'Risk Analysis and Evaluation',
        description: 'Analyze identified risks and evaluate their significance.',
        tasks: [
          'Assess likelihood and impact',
          'Prioritize risks',
          'Evaluate existing controls',
          'Determine risk treatment needs'
        ]
      },
      {
        name: 'Risk Treatment',
        description: 'Develop and implement risk treatment plans.',
        tasks: [
          'Select treatment options',
          'Design control measures',
          'Implement controls',
          'Monitor effectiveness'
        ]
      }
    ],
    commonChallenges: [
      {
        challenge: 'Complex AI Systems',
        solution: 'Break down systems into manageable components and use structured assessment methods.',
        prevention: 'Maintain clear documentation and use modular development approaches.'
      },
      {
        challenge: 'Limited Expertise',
        solution: 'Invest in training and external expertise when needed.',
        prevention: 'Develop internal capabilities and maintain knowledge sharing practices.'
      },
      {
        challenge: 'Evolving Technology',
        solution: 'Regular updates to risk assessments and controls.',
        prevention: 'Implement flexible frameworks that can adapt to changes.'
      },
      {
        challenge: 'Resource Constraints',
        solution: 'Prioritize critical risks and phase implementation.',
        prevention: 'Plan resource allocation and secure management commitment.'
      }
    ]
  },
  controls: [
    {
      id: 'MAP.1',
      name: 'Context and System Characteristics',
      description: 'Establish the context in which the AI system operates and document its key characteristics.',
      examples: [
        {
          scenario: 'Healthcare AI Diagnostic System',
          implementation: 'Document system purpose, data sources, decision criteria, and potential impacts on patient care.',
          evidence: 'System documentation, context diagrams, data flow maps',
          tips: [
            'Include both technical and operational context',
            'Document assumptions and constraints',
            'Consider regulatory requirements'
          ]
        }
      ],
      commonChallenges: [
        'Incomplete system documentation',
        'Complex dependencies',
        'Changing operational context'
      ],
      bestPractices: [
        'Maintain up-to-date documentation',
        'Involve stakeholders in context definition',
        'Regular review and updates'
      ]
    },
    {
      id: 'MEASURE.1',
      name: 'Risk Assessment Methodology',
      description: 'Develop and implement risk assessment approaches suitable for AI systems.',
      examples: [
        {
          scenario: 'Financial Trading AI',
          implementation: 'Create risk assessment templates covering algorithmic bias, market impact, and system reliability.',
          evidence: 'Risk assessment documentation, analysis results, mitigation plans',
          tips: [
            'Use both qualitative and quantitative methods',
            'Consider multiple risk dimensions',
            'Document assessment criteria'
          ]
        }
      ],
      commonChallenges: [
        'Complex risk interactions',
        'Difficulty in quantifying risks',
        'Limited historical data'
      ],
      bestPractices: [
        'Use standardized assessment methods',
        'Regular risk reviews',
        'Document assessment rationale'
      ]
    },
    {
      id: 'MANAGE.1',
      name: 'Risk Treatment Implementation',
      description: 'Implement and monitor risk treatment measures.',
      examples: [
        {
          scenario: 'Autonomous Vehicle AI',
          implementation: 'Deploy safety measures, monitoring systems, and fallback mechanisms.',
          evidence: 'Control documentation, test results, monitoring logs',
          tips: [
            'Implement defense in depth',
            'Monitor control effectiveness',
            'Plan for contingencies'
          ]
        }
      ],
      commonChallenges: [
        'Resource limitations',
        'Technical complexity',
        'Integration challenges'
      ],
      bestPractices: [
        'Prioritize critical controls',
        'Regular testing and validation',
        'Document control effectiveness'
      ]
    },
    {
      id: 'GOVERN.1',
      name: 'Governance Structure',
      description: 'Establish governance frameworks for AI risk management.',
      examples: [
        {
          scenario: 'Enterprise AI Platform',
          implementation: 'Create oversight committees, policies, and reporting structures.',
          evidence: 'Governance documentation, meeting minutes, policy documents',
          tips: [
            'Define clear roles and responsibilities',
            'Establish reporting lines',
            'Regular governance reviews'
          ]
        }
      ],
      commonChallenges: [
        'Organizational resistance',
        'Unclear responsibilities',
        'Communication gaps'
      ],
      bestPractices: [
        'Clear governance structure',
        'Regular stakeholder engagement',
        'Documented decision-making'
      ]
    }
  ],
  governingBody: {
    name: 'National Institute of Standards and Technology',
    description: 'NIST is a non-regulatory federal agency within the U.S. Department of Commerce that develops technology, metrics, and standards.',
    website: 'https://www.nist.gov/itl/ai-risk-management-framework',
    resources: [
      {
        title: 'AI RMF 1.0',
        description: 'The official AI Risk Management Framework document.',
        url: 'https://www.nist.gov/itl/ai-risk-management-framework/ai-rmf-10'
      },
      {
        title: 'AI RMF Playbook',
        description: 'Practical guidance for implementing the framework.',
        url: 'https://www.nist.gov/itl/ai-risk-management-framework/ai-rmf-playbook'
      },
      {
        title: 'AI RMF Quick Start Guide',
        description: 'Getting started with AI risk management.',
        url: 'https://www.nist.gov/itl/ai-risk-management-framework/quick-start-guide'
      }
    ]
  }
};
