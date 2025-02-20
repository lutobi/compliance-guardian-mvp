export const iso42001 = {
  id: 'iso-42001',
  name: 'ISO 42001',
  version: '2023',
  description: 'Artificial Intelligence Management System (AIMS) - Requirements and guidance for AI governance',
  categories: [
    'AI Governance',
    'Risk Management',
    'Ethical Considerations',
    'Transparency Requirements'
  ],
  controls: [
    {
      id: 'GOV',
      name: 'AI Governance',
      description: 'Organizational structure and responsibilities for AI systems',
      subcontrols: [
        {
          id: 'GOV-1',
          name: 'Leadership and Commitment',
          description: 'Top management commitment and establishment of AI governance policies'
        },
        {
          id: 'GOV-2',
          name: 'AI Policy',
          description: 'Development and implementation of organizational AI policy'
        },
        {
          id: 'GOV-3',
          name: 'Roles and Responsibilities',
          description: 'Assignment of AI-related roles and responsibilities within the organization'
        },
        {
          id: 'GOV-4',
          name: 'Resource Management',
          description: 'Allocation of resources for AI system development and operation'
        },
        {
          id: 'GOV-5',
          name: 'Documentation Requirements',
          description: 'Maintenance of AI system documentation and records'
        }
      ]
    },
    {
      id: 'RISK',
      name: 'Risk Management',
      description: 'Identification and management of AI-related risks',
      subcontrols: [
        {
          id: 'RISK-1',
          name: 'Risk Assessment Process',
          description: 'Systematic approach to identifying and evaluating AI risks'
        },
        {
          id: 'RISK-2',
          name: 'Model Risk Management',
          description: 'Management of risks associated with AI models and algorithms'
        },
        {
          id: 'RISK-3',
          name: 'Data Risk Management',
          description: 'Management of risks related to training data and input data'
        },
        {
          id: 'RISK-4',
          name: 'Operational Risk',
          description: 'Management of risks in AI system deployment and operation'
        },
        {
          id: 'RISK-5',
          name: 'Third-Party Risk',
          description: 'Management of risks associated with third-party AI components and services'
        },
        {
          id: 'RISK-6',
          name: 'Monitoring and Review',
          description: 'Continuous monitoring and review of AI system risks'
        }
      ]
    },
    {
      id: 'ETH',
      name: 'Ethical Considerations',
      description: 'Ethical principles and requirements for AI systems',
      subcontrols: [
        {
          id: 'ETH-1',
          name: 'Fairness and Non-discrimination',
          description: 'Ensuring AI systems are fair and do not discriminate'
        },
        {
          id: 'ETH-2',
          name: 'Accountability',
          description: 'Clear accountability for AI system decisions and actions'
        },
        {
          id: 'ETH-3',
          name: 'Human Oversight',
          description: 'Maintaining appropriate human oversight of AI systems'
        },
        {
          id: 'ETH-4',
          name: 'Social Impact Assessment',
          description: 'Assessment of AI system impact on society and stakeholders'
        },
        {
          id: 'ETH-5',
          name: 'Environmental Impact',
          description: 'Consideration of environmental impact of AI systems'
        },
        {
          id: 'ETH-6',
          name: 'Cultural Sensitivity',
          description: 'Ensuring AI systems respect cultural differences and values'
        }
      ]
    },
    {
      id: 'TRA',
      name: 'Transparency Requirements',
      description: 'Requirements for AI system transparency and explainability',
      subcontrols: [
        {
          id: 'TRA-1',
          name: 'System Documentation',
          description: 'Documentation of AI system architecture, models, and processes'
        },
        {
          id: 'TRA-2',
          name: 'Decision Explainability',
          description: 'Methods for explaining AI system decisions and recommendations'
        },
        {
          id: 'TRA-3',
          name: 'Data Transparency',
          description: 'Transparency about data sources and data processing'
        },
        {
          id: 'TRA-4',
          name: 'Performance Metrics',
          description: 'Clear reporting of AI system performance and limitations'
        },
        {
          id: 'TRA-5',
          name: 'User Communication',
          description: 'Communication with users about AI system capabilities and limitations'
        },
        {
          id: 'TRA-6',
          name: 'Incident Reporting',
          description: 'Transparent reporting of AI system incidents and issues'
        }
      ]
    },
    {
      id: 'DEV',
      name: 'Development and Testing',
      description: 'Requirements for AI system development and testing',
      subcontrols: [
        {
          id: 'DEV-1',
          name: 'Development Process',
          description: 'Structured process for AI system development'
        },
        {
          id: 'DEV-2',
          name: 'Testing Requirements',
          description: 'Comprehensive testing of AI systems before deployment'
        },
        {
          id: 'DEV-3',
          name: 'Version Control',
          description: 'Management of AI system versions and changes'
        },
        {
          id: 'DEV-4',
          name: 'Quality Assurance',
          description: 'Quality assurance processes for AI systems'
        },
        {
          id: 'DEV-5',
          name: 'Deployment Procedures',
          description: 'Procedures for safe deployment of AI systems'
        }
      ]
    }
  ]
};
