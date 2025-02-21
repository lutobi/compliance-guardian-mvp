import { FrameworkData } from '../../types/framework';

export const iso27001Enhanced: FrameworkData = {
  id: 'iso-27001',
  name: 'ISO/IEC 27001',
  version: '2022',
  description: 'Information Security Management System Requirements',
  categories: [
    'Information Security Policies',
    'Organization of Information Security',
    'Human Resource Security',
    'Asset Management',
    'Access Control',
    'Cryptography',
    'Physical and Environmental Security',
    'Operations Security',
    'Communications Security',
    'System Acquisition, Development and Maintenance',
    'Supplier Relationships',
    'Information Security Incident Management',
    'Business Continuity Management',
    'Compliance'
  ],
  controls: [
    {
      id: 'A.5',
      controlNumber: '5',
      name: 'A.5 Information Security Policies',
      description: 'Management direction for information security',
      subcontrols: [
        {
          id: 'A.5.1',
          controlNumber: '5.1',
          name: 'A.5.1 Information security policies and procedures',
          description: 'Ensure information security policies and procedures are established and maintained'
        },
        {
          id: 'A.5.2',
          controlNumber: '5.2',
          name: 'A.5.2 Information security roles and responsibilities',
          description: 'Information security roles and responsibilities shall be defined and allocated'
        }
      ]
    },
    {
      id: 'A.6',
      controlNumber: '6',
      name: 'A.6 Organization of Information Security',
      description: 'Internal organization and mobile devices/teleworking',
      subcontrols: [
        {
          id: 'A.6.1',
          controlNumber: '6.1',
          name: 'A.6.1 Internal organization',
          description: 'Management framework for information security implementation'
        },
        {
          id: 'A.6.2',
          controlNumber: '6.2',
          name: 'A.6.2 Mobile devices and teleworking',
          description: 'Security of mobile devices and teleworking'
        }
      ]
    },
    {
      id: 'A.7',
      controlNumber: '7',
      name: 'A.7 Human Resource Security',
      description: 'Security aspects for employees and contractors',
      subcontrols: [
        {
          id: 'A.7.1',
          controlNumber: '7.1',
          name: 'A.7.1 Prior to employment',
          description: 'Security responsibilities in job descriptions and terms of employment'
        },
        {
          id: 'A.7.2',
          controlNumber: '7.2',
          name: 'A.7.2 During employment',
          description: 'Management responsibilities to ensure security awareness'
        },
        {
          id: 'A.7.3',
          controlNumber: '7.3',
          name: 'A.7.3 Termination and change of employment',
          description: 'Security aspects of employment termination or change'
        }
      ]
    },
    {
      id: 'A.8',
      controlNumber: '8',
      name: 'A.8 Asset Management',
      description: 'Identifying organizational assets and defining protection responsibilities',
      subcontrols: [
        {
          id: 'A.8.1',
          controlNumber: '8.1',
          name: 'A.8.1 Responsibility for assets',
          description: 'Inventory and ownership of assets'
        },
        {
          id: 'A.8.2',
          controlNumber: '8.2',
          name: 'A.8.2 Information classification',
          description: 'Classification of information according to legal requirements'
        },
        {
          id: 'A.8.3',
          controlNumber: '8.3',
          name: 'A.8.3 Media handling',
          description: 'Management of removable media'
        }
      ]
    },
    {
      id: 'A.9',
      controlNumber: '9',
      name: 'A.9 Access Control',
      description: 'Business requirements and user access management',
      subcontrols: [
        {
          id: 'A.9.1',
          controlNumber: '9.1',
          name: 'A.9.1 Business requirements of access control',
          description: 'Access control policy based on business requirements'
        },
        {
          id: 'A.9.2',
          controlNumber: '9.2',
          name: 'A.9.2 User access management',
          description: 'User registration and de-registration'
        },
        {
          id: 'A.9.3',
          controlNumber: '9.3',
          name: 'A.9.3 User responsibilities',
          description: 'Password use and management'
        },
        {
          id: 'A.9.4',
          controlNumber: '9.4',
          name: 'A.9.4 System and application access control',
          description: 'Information access restriction'
        }
      ]
    },
    {
      id: 'A.10',
      controlNumber: '10',
      name: 'A.10 Cryptography',
      description: 'Cryptographic controls',
      subcontrols: [
        {
          id: 'A.10.1',
          controlNumber: '10.1',
          name: 'A.10.1 Cryptographic controls',
          description: 'Policy on the use of cryptographic controls'
        },
        {
          id: 'A.10.2',
          controlNumber: '10.2',
          name: 'A.10.2 Key management',
          description: 'Policy on cryptographic key management'
        }
      ]
    },
    {
      id: 'A.11',
      controlNumber: '11',
      name: 'A.11 Physical and Environmental Security',
      description: 'Secure areas and equipment',
      subcontrols: [
        {
          id: 'A.11.1',
          controlNumber: '11.1',
          name: 'A.11.1 Secure areas',
          description: 'Physical security perimeter and controls'
        },
        {
          id: 'A.11.2',
          controlNumber: '11.2',
          name: 'A.11.2 Equipment security',
          description: 'Equipment siting, protection, and maintenance'
        }
      ]
    },
    {
      id: 'A.12',
      controlNumber: '12',
      name: 'A.12 Operations Security',
      description: 'Operational procedures and responsibilities',
      subcontrols: [
        {
          id: 'A.12.1',
          controlNumber: '12.1',
          name: 'A.12.1 Operational procedures and responsibilities',
          description: 'Documented operating procedures'
        },
        {
          id: 'A.12.2',
          controlNumber: '12.2',
          name: 'A.12.2 Protection from malware',
          description: 'Controls against malware'
        },
        {
          id: 'A.12.3',
          controlNumber: '12.3',
          name: 'A.12.3 Backup',
          description: 'Backup of information'
        },
        {
          id: 'A.12.4',
          controlNumber: '12.4',
          name: 'A.12.4 Logging and monitoring',
          description: 'Event logging and monitoring'
        },
        {
          id: 'A.12.5',
          controlNumber: '12.5',
          name: 'A.12.5 Control of operational software',
          description: 'Installation of software on operational systems'
        },
        {
          id: 'A.12.6',
          controlNumber: '12.6',
          name: 'A.12.6 Technical vulnerability management',
          description: 'Management of technical vulnerabilities'
        }
      ]
    },
    {
      id: 'A.13',
      controlNumber: '13',
      name: 'A.13 Communications Security',
      description: 'Network security management and information transfer',
      subcontrols: [
        {
          id: 'A.13.1',
          controlNumber: '13.1',
          name: 'A.13.1 Network security management',
          description: 'Network controls and security of network services'
        },
        {
          id: 'A.13.2',
          controlNumber: '13.2',
          name: 'A.13.2 Information transfer',
          description: 'Policies and procedures for information transfer'
        }
      ]
    },
    {
      id: 'A.14',
      controlNumber: '14',
      name: 'A.14 System Acquisition, Development and Maintenance',
      description: 'Security requirements of information systems',
      subcontrols: [
        {
          id: 'A.14.1',
          controlNumber: '14.1',
          name: 'A.14.1 Security requirements of information systems',
          description: 'Security requirements analysis and specification'
        },
        {
          id: 'A.14.2',
          controlNumber: '14.2',
          name: 'A.14.2 Security in development and support processes',
          description: 'Secure development policy'
        },
        {
          id: 'A.14.3',
          controlNumber: '14.3',
          name: 'A.14.3 Test data',
          description: 'Protection of test data'
        }
      ]
    },
    {
      id: 'A.15',
      controlNumber: '15',
      name: 'A.15 Supplier Relationships',
      description: 'Information security in supplier relationships',
      subcontrols: [
        {
          id: 'A.15.1',
          controlNumber: '15.1',
          name: 'A.15.1 Information security in supplier relationships',
          description: 'Information security policy for supplier relationships'
        },
        {
          id: 'A.15.2',
          controlNumber: '15.2',
          name: 'A.15.2 Supplier service delivery management',
          description: 'Monitoring and review of supplier services'
        }
      ]
    },
    {
      id: 'A.16',
      controlNumber: '16',
      name: 'A.16 Information Security Incident Management',
      description: 'Management of information security incidents',
      subcontrols: [
        {
          id: 'A.16.1',
          controlNumber: '16.1',
          name: 'A.16.1 Management of information security incidents',
          description: 'Responsibilities and procedures'
        }
      ]
    },
    {
      id: 'A.17',
      controlNumber: '17',
      name: 'A.17 Information Security Aspects of Business Continuity Management',
      description: 'Business continuity and assessment',
      subcontrols: [
        {
          id: 'A.17.1',
          controlNumber: '17.1',
          name: 'A.17.1 Information security continuity',
          description: 'Planning information security continuity'
        },
        {
          id: 'A.17.2',
          controlNumber: '17.2',
          name: 'A.17.2 Redundancies',
          description: 'Availability of information processing facilities'
        }
      ]
    },
    {
      id: 'A.18',
      controlNumber: '18',
      name: 'A.18 Compliance',
      description: 'Compliance with legal and contractual requirements',
      subcontrols: [
        {
          id: 'A.18.1',
          controlNumber: '18.1',
          name: 'A.18.1 Compliance with legal and contractual requirements',
          description: 'Identification of applicable legislation'
        },
        {
          id: 'A.18.2',
          controlNumber: '18.2',
          name: 'A.18.2 Information security reviews',
          description: 'Independent review of information security'
        }
      ]
    }
  ]
};
