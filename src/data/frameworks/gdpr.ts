export const gdpr = {
  id: 'gdpr',
  name: 'GDPR',
  version: '2016/679',
  description: 'General Data Protection Regulation - EU data protection and privacy framework',
  categories: [
    'Data Protection Principles',
    'Data Subject Rights',
    'Controller and Processor Obligations',
    'Security Requirements',
    'Data Transfer Requirements'
  ],
  controls: [
    {
      id: 'CH2',
      name: 'Principles',
      description: 'Core principles relating to processing of personal data',
      subcontrols: [
        {
          id: 'ART5',
          name: 'Principles relating to processing of personal data',
          description: 'Lawfulness, fairness, transparency, purpose limitation, data minimization, accuracy, storage limitation, integrity and confidentiality'
        },
        {
          id: 'ART6',
          name: 'Lawfulness of processing',
          description: 'Legal bases for processing personal data including consent, contract, legal obligation, vital interests, public interest, legitimate interests'
        },
        {
          id: 'ART7',
          name: 'Conditions for consent',
          description: 'Requirements for valid consent including freely given, specific, informed and unambiguous indication of wishes'
        }
      ]
    },
    {
      id: 'CH3',
      name: 'Data Subject Rights',
      description: 'Rights of individuals regarding their personal data',
      subcontrols: [
        {
          id: 'ART15',
          name: 'Right of access',
          description: 'Right to obtain confirmation of processing and access to personal data'
        },
        {
          id: 'ART16',
          name: 'Right to rectification',
          description: 'Right to obtain rectification of inaccurate personal data'
        },
        {
          id: 'ART17',
          name: 'Right to erasure',
          description: 'Right to obtain erasure of personal data (right to be forgotten)'
        },
        {
          id: 'ART18',
          name: 'Right to restriction of processing',
          description: 'Right to restrict the processing of personal data'
        },
        {
          id: 'ART20',
          name: 'Right to data portability',
          description: 'Right to receive personal data in a structured, commonly used format'
        }
      ]
    },
    {
      id: 'CH4',
      name: 'Controller and Processor',
      description: 'Obligations and responsibilities of data controllers and processors',
      subcontrols: [
        {
          id: 'ART24',
          name: 'Responsibility of the controller',
          description: 'Implementation of appropriate technical and organizational measures'
        },
        {
          id: 'ART28',
          name: 'Processor',
          description: 'Requirements for processors and processing contracts'
        },
        {
          id: 'ART30',
          name: 'Records of processing activities',
          description: 'Maintenance of records of processing activities'
        },
        {
          id: 'ART32',
          name: 'Security of processing',
          description: 'Implementation of appropriate security measures including encryption, confidentiality, integrity, availability, and resilience'
        },
        {
          id: 'ART33',
          name: 'Notification of personal data breach',
          description: 'Requirements for breach notification to supervisory authority'
        },
        {
          id: 'ART35',
          name: 'Data protection impact assessment',
          description: 'Assessment of processing operations that are likely to result in high risk'
        }
      ]
    },
    {
      id: 'CH5',
      name: 'Data Transfers',
      description: 'Requirements for transferring personal data to third countries',
      subcontrols: [
        {
          id: 'ART44',
          name: 'General principle for transfers',
          description: 'Conditions for transferring personal data to third countries'
        },
        {
          id: 'ART45',
          name: 'Transfers on the basis of an adequacy decision',
          description: 'Transfers to countries with adequate level of protection'
        },
        {
          id: 'ART46',
          name: 'Transfers subject to appropriate safeguards',
          description: 'Safeguards required for international data transfers'
        },
        {
          id: 'ART49',
          name: 'Derogations',
          description: 'Specific situations allowing transfers in the absence of adequacy decision or safeguards'
        }
      ]
    }
  ]
};
