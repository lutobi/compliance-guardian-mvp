export const csaStar = {
  id: 'csa-star',
  name: 'CSA STAR',
  version: '4.0',
  description: 'Cloud Security Alliance Security Trust Assurance and Risk - Cloud security certification program',
  categories: [
    'Cloud Security Controls',
    'Risk Management',
    'Security Operations',
    'Data Security'
  ],
  controls: [
    {
      id: 'AIS',
      name: 'Application & Interface Security',
      description: 'Controls for application security and interfaces',
      subcontrols: [
        {
          id: 'AIS-01',
          name: 'Application Security',
          description: 'Application security baseline requirements'
        },
        {
          id: 'AIS-02',
          name: 'Customer Access Requirements',
          description: 'Customer access requirements documentation'
        },
        {
          id: 'AIS-03',
          name: 'Data Integrity',
          description: 'Data input and output integrity routines'
        },
        {
          id: 'AIS-04',
          name: 'Data Security',
          description: 'Data security and integrity requirements'
        }
      ]
    },
    {
      id: 'AAC',
      name: 'Audit Assurance & Compliance',
      description: 'Controls for audit planning and compliance',
      subcontrols: [
        {
          id: 'AAC-01',
          name: 'Audit Planning',
          description: 'Independent audit program planning'
        },
        {
          id: 'AAC-02',
          name: 'Independent Audits',
          description: 'Independent reviews and assessments'
        },
        {
          id: 'AAC-03',
          name: 'Information System Regulatory Mapping',
          description: 'Regulatory requirements compliance'
        }
      ]
    },
    {
      id: 'BCR',
      name: 'Business Continuity Management',
      description: 'Controls for business continuity and operational resilience',
      subcontrols: [
        {
          id: 'BCR-01',
          name: 'Business Continuity Planning',
          description: 'Business continuity planning requirements'
        },
        {
          id: 'BCR-02',
          name: 'Business Continuity Testing',
          description: 'Business continuity testing requirements'
        },
        {
          id: 'BCR-03',
          name: 'Power / Telecommunications',
          description: 'Power and telecommunications redundancy'
        }
      ]
    }
  ]
};

export const iso27017 = {
  id: 'iso-27017',
  name: 'ISO 27017',
  version: '2015',
  description: 'Information security controls for cloud services',
  categories: [
    'Cloud Service Provider Controls',
    'Cloud Customer Controls',
    'Shared Controls'
  ],
  controls: [
    {
      id: 'CSP',
      name: 'Cloud Service Provider Controls',
      description: 'Controls specific to cloud service providers',
      subcontrols: [
        {
          id: 'CSP-01',
          name: 'Shared Roles & Responsibilities',
          description: 'Definition of shared security roles and responsibilities'
        },
        {
          id: 'CSP-02',
          name: 'Customer Data Removal',
          description: 'Procedures for removal of customer data'
        },
        {
          id: 'CSP-03',
          name: 'Network Security',
          description: 'Network segregation and security in cloud services'
        }
      ]
    },
    {
      id: 'CLC',
      name: 'Cloud Customer Controls',
      description: 'Controls specific to cloud service customers',
      subcontrols: [
        {
          id: 'CLC-01',
          name: 'Cloud Service Agreement',
          description: 'Review and understanding of cloud service agreements'
        },
        {
          id: 'CLC-02',
          name: 'Data Classification',
          description: 'Classification of data for cloud services'
        },
        {
          id: 'CLC-03',
          name: 'Monitoring Requirements',
          description: 'Monitoring of cloud service security'
        }
      ]
    }
  ]
};

export const iso27018 = {
  id: 'iso-27018',
  name: 'ISO 27018',
  version: '2019',
  description: 'Code of practice for protection of personally identifiable information (PII) in public clouds',
  categories: [
    'Consent and Choice',
    'Purpose Legitimacy',
    'Data Minimization',
    'Use Limitation'
  ],
  controls: [
    {
      id: 'CON',
      name: 'Consent and Choice',
      description: 'Controls for obtaining and managing consent',
      subcontrols: [
        {
          id: 'CON-01',
          name: 'Consent Procedures',
          description: 'Procedures for obtaining and recording consent'
        },
        {
          id: 'CON-02',
          name: 'Choice Mechanisms',
          description: 'Mechanisms for customer choice regarding PII processing'
        },
        {
          id: 'CON-03',
          name: 'Consent Records',
          description: 'Maintenance of consent records'
        }
      ]
    },
    {
      id: 'PUR',
      name: 'Purpose Legitimacy',
      description: 'Controls for ensuring legitimate processing purposes',
      subcontrols: [
        {
          id: 'PUR-01',
          name: 'Purpose Specification',
          description: 'Specification of PII processing purposes'
        },
        {
          id: 'PUR-02',
          name: 'Purpose Limitation',
          description: 'Limitation of processing to specified purposes'
        },
        {
          id: 'PUR-03',
          name: 'Purpose Documentation',
          description: 'Documentation of processing purposes'
        }
      ]
    },
    {
      id: 'MIN',
      name: 'Data Minimization',
      description: 'Controls for minimizing PII processing',
      subcontrols: [
        {
          id: 'MIN-01',
          name: 'Collection Limitation',
          description: 'Limitation of PII collection'
        },
        {
          id: 'MIN-02',
          name: 'Processing Minimization',
          description: 'Minimization of PII processing'
        },
        {
          id: 'MIN-03',
          name: 'Retention Minimization',
          description: 'Minimization of PII retention periods'
        }
      ]
    }
  ]
};
