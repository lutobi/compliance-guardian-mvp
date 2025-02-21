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
      name: 'Chapter II - Principles',
      controlNumber: '2',
      description: 'Core principles relating to processing of personal data',
      subcontrols: [
        {
          id: 'ART5',
          controlNumber: '5',
          name: 'Article 5 - Principles relating to processing of personal data',
          description: 'Lawfulness, fairness, transparency, purpose limitation, data minimization, accuracy, storage limitation, integrity and confidentiality'
        },
        {
          id: 'ART6',
          controlNumber: '6',
          name: 'Article 6 - Lawfulness of processing',
          description: 'Legal bases for processing personal data including consent, contract, legal obligation, vital interests, public interest, legitimate interests'
        },
        {
          id: 'ART7',
          controlNumber: '7',
          name: 'Article 7 - Conditions for consent',
          description: 'Requirements for valid consent including freely given, specific, informed and unambiguous indication of wishes'
        }
      ]
    },
    {
      id: 'CH3',
      name: 'Chapter III - Data Subject Rights',
      controlNumber: '3',
      description: 'Rights of individuals regarding their personal data',
      subcontrols: [
        {
          id: 'ART15',
          controlNumber: '15',
          name: 'Article 15 - Right of access',
          description: 'Right to obtain confirmation of processing and access to personal data'
        },
        {
          id: 'ART16',
          controlNumber: '16',
          name: 'Article 16 - Right to rectification',
          description: 'Right to obtain rectification of inaccurate personal data'
        },
        {
          id: 'ART17',
          controlNumber: '17',
          name: 'Article 17 - Right to erasure',
          description: 'Right to obtain erasure of personal data ("right to be forgotten")'
        },
        {
          id: 'ART18',
          controlNumber: '18',
          name: 'Article 18 - Right to restriction of processing',
          description: 'Right to restrict the processing of personal data'
        },
        {
          id: 'ART20',
          controlNumber: '20',
          name: 'Article 20 - Right to data portability',
          description: 'Right to receive personal data and transmit it to another controller'
        }
      ]
    },
    {
      id: 'CH4',
      name: 'Chapter IV - Controller and Processor',
      controlNumber: '4',
      description: 'Obligations of data controllers and processors',
      subcontrols: [
        {
          id: 'ART24',
          controlNumber: '24',
          name: 'Article 24 - Responsibility of the controller',
          description: 'Implementation of appropriate technical and organizational measures'
        },
        {
          id: 'ART25',
          controlNumber: '25',
          name: 'Article 25 - Data protection by design and by default',
          description: 'Implementation of data protection principles and appropriate safeguards'
        },
        {
          id: 'ART32',
          controlNumber: '32',
          name: 'Article 32 - Security of processing',
          description: 'Implementation of appropriate technical and organizational security measures'
        },
        {
          id: 'ART33',
          controlNumber: '33',
          name: 'Article 33 - Notification of personal data breach',
          description: 'Notification to supervisory authority of personal data breaches'
        }
      ]
    }
  ]
};
