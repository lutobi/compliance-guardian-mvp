export const nistAiRmf = {
  id: 'nist-ai-rmf',
  name: 'NIST AI RMF',
  version: '1.0',
  description: 'NIST Artificial Intelligence Risk Management Framework - Guidelines for managing risks in AI systems',
  categories: [
    'Govern',
    'Map',
    'Measure',
    'Manage'
  ],
  controls: [
    {
      id: 'GOV',
      name: 'Govern',
      description: 'Establishing governance structures and processes for AI risk management',
      subcontrols: [
        {
          id: 'GOV.1',
          name: 'AI Risk Management Governance',
          description: 'Establish organizational governance structure for AI risk management'
        },
        {
          id: 'GOV.2',
          name: 'AI Policies and Procedures',
          description: 'Develop and maintain AI-specific policies and procedures'
        },
        {
          id: 'GOV.3',
          name: 'AI Risk Culture',
          description: 'Foster organizational culture that prioritizes AI risk management'
        },
        {
          id: 'GOV.4',
          name: 'Stakeholder Engagement',
          description: 'Engage with internal and external stakeholders on AI risks'
        },
        {
          id: 'GOV.5',
          name: 'Resource Allocation',
          description: 'Allocate resources for AI risk management activities'
        }
      ]
    },
    {
      id: 'MAP',
      name: 'Map',
      description: 'Identifying and tracking context, capabilities, and risks of AI systems',
      subcontrols: [
        {
          id: 'MAP.1',
          name: 'AI System Context',
          description: 'Document AI system context, purpose, and intended use'
        },
        {
          id: 'MAP.2',
          name: 'AI System Capabilities',
          description: 'Identify and document AI system capabilities and limitations'
        },
        {
          id: 'MAP.3',
          name: 'Risk Identification',
          description: 'Identify potential risks associated with AI system'
        },
        {
          id: 'MAP.4',
          name: 'Impact Assessment',
          description: 'Assess potential impacts of AI system on stakeholders'
        },
        {
          id: 'MAP.5',
          name: 'Dependencies',
          description: 'Identify and document AI system dependencies'
        }
      ]
    },
    {
      id: 'MEA',
      name: 'Measure',
      description: 'Analyzing, assessing, and tracking AI risks',
      subcontrols: [
        {
          id: 'MEA.1',
          name: 'Risk Analysis',
          description: 'Analyze identified risks using appropriate methods'
        },
        {
          id: 'MEA.2',
          name: 'Risk Assessment',
          description: 'Assess likelihood and impact of identified risks'
        },
        {
          id: 'MEA.3',
          name: 'Risk Metrics',
          description: 'Develop and track metrics for AI system risks'
        },
        {
          id: 'MEA.4',
          name: 'Testing and Validation',
          description: 'Test and validate AI system risk controls'
        },
        {
          id: 'MEA.5',
          name: 'Monitoring',
          description: 'Monitor AI system risks and control effectiveness'
        }
      ]
    },
    {
      id: 'MAN',
      name: 'Manage',
      description: 'Prioritizing, responding to, and communicating about AI risks',
      subcontrols: [
        {
          id: 'MAN.1',
          name: 'Risk Prioritization',
          description: 'Prioritize risks based on assessment results'
        },
        {
          id: 'MAN.2',
          name: 'Risk Response',
          description: 'Develop and implement risk response strategies'
        },
        {
          id: 'MAN.3',
          name: 'Risk Communication',
          description: 'Communicate about AI risks to stakeholders'
        },
        {
          id: 'MAN.4',
          name: 'Documentation',
          description: 'Document risk management decisions and actions'
        },
        {
          id: 'MAN.5',
          name: 'Continuous Improvement',
          description: 'Continuously improve AI risk management practices'
        }
      ]
    }
  ]
};
