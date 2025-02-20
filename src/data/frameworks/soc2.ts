export const soc2 = {
  id: 'soc2',
  name: 'SOC 2',
  version: '2017',
  description: 'Service Organization Control 2 - Trust Services Criteria for security, availability, processing integrity, confidentiality, and privacy',
  categories: [
    'Security',
    'Availability',
    'Processing Integrity',
    'Confidentiality',
    'Privacy'
  ],
  controls: [
    {
      id: 'CC',
      name: 'Common Criteria (Security)',
      description: 'Security controls applicable to all Trust Services Categories',
      subcontrols: [
        {
          id: 'CC1',
          name: 'Control Environment',
          description: 'Organization demonstrates commitment to integrity and ethical values'
        },
        {
          id: 'CC2',
          name: 'Communication and Information',
          description: 'Communication of objectives and responsibilities in internal control'
        },
        {
          id: 'CC3',
          name: 'Risk Assessment',
          description: 'Organization specifies objectives and assesses risks to achieving objectives'
        },
        {
          id: 'CC4',
          name: 'Monitoring Activities',
          description: 'Organization monitors controls and evaluates results'
        },
        {
          id: 'CC5',
          name: 'Control Activities',
          description: 'Organization selects and develops control activities'
        },
        {
          id: 'CC6',
          name: 'Logical and Physical Access',
          description: 'Organization implements logical and physical access controls'
        },
        {
          id: 'CC7',
          name: 'System Operations',
          description: 'Organization manages system operations and changes'
        },
        {
          id: 'CC8',
          name: 'Change Management',
          description: 'Organization implements change management processes'
        },
        {
          id: 'CC9',
          name: 'Risk Mitigation',
          description: 'Organization identifies and mitigates risks through business recovery procedures'
        }
      ]
    },
    {
      id: 'A',
      name: 'Availability',
      description: 'System availability and performance',
      subcontrols: [
        {
          id: 'A1.1',
          name: 'Availability Requirements',
          description: 'Current processing capacity and system availability requirements'
        },
        {
          id: 'A1.2',
          name: 'Capacity Management',
          description: 'Infrastructure, software, and data capacity requirements'
        },
        {
          id: 'A1.3',
          name: 'Backup and Recovery',
          description: 'Data backup, recovery, and business continuity procedures'
        }
      ]
    },
    {
      id: 'PI',
      name: 'Processing Integrity',
      description: 'System processing is complete, valid, accurate, timely, and authorized',
      subcontrols: [
        {
          id: 'PI1.1',
          name: 'Processing Objectives',
          description: 'System processing objectives, including completeness, accuracy, and timeliness'
        },
        {
          id: 'PI1.2',
          name: 'Input Validation',
          description: 'Input data validation and error handling procedures'
        },
        {
          id: 'PI1.3',
          name: 'Processing Validation',
          description: 'Processing validation and error handling procedures'
        },
        {
          id: 'PI1.4',
          name: 'Output Validation',
          description: 'Output validation and error handling procedures'
        },
        {
          id: 'PI1.5',
          name: 'Processing Authorization',
          description: 'System processing authorization procedures'
        }
      ]
    },
    {
      id: 'C',
      name: 'Confidentiality',
      description: 'Information designated as confidential is protected',
      subcontrols: [
        {
          id: 'C1.1',
          name: 'Confidentiality Requirements',
          description: 'Identification of confidential information and handling requirements'
        },
        {
          id: 'C1.2',
          name: 'Confidentiality Policies',
          description: 'Policies and procedures for protecting confidential information'
        },
        {
          id: 'C1.3',
          name: 'Confidentiality Controls',
          description: 'Controls to protect confidential information during retention and destruction'
        }
      ]
    },
    {
      id: 'P',
      name: 'Privacy',
      description: 'Personal information is collected, used, retained, disclosed, and disposed of properly',
      subcontrols: [
        {
          id: 'P1.1',
          name: 'Privacy Notice',
          description: 'Communication of privacy policies to data subjects'
        },
        {
          id: 'P1.2',
          name: 'Choice and Consent',
          description: 'Options for collection, use, and disclosure of personal information'
        },
        {
          id: 'P2.1',
          name: 'Collection',
          description: 'Collection of personal information is limited to specified purposes'
        },
        {
          id: 'P3.1',
          name: 'Use, Retention, Disposal',
          description: 'Use of personal information is limited to specified purposes'
        },
        {
          id: 'P4.1',
          name: 'Access',
          description: 'Data subjects can review and update their personal information'
        },
        {
          id: 'P5.1',
          name: 'Disclosure',
          description: 'Disclosure of personal information is limited to specified purposes'
        },
        {
          id: 'P6.1',
          name: 'Quality',
          description: 'Personal information is accurate and complete for specified purposes'
        },
        {
          id: 'P7.1',
          name: 'Monitoring and Enforcement',
          description: 'Privacy policies and procedures are monitored and enforced'
        }
      ]
    }
  ]
};
