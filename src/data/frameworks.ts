// Keeping the old data as a reference
const oldFrameworks = [
  {
    id: 'nist-800-53',
    name: 'NIST 800-53',
    description: 'Security and Privacy Controls for Information Systems and Organizations',
    version: 'Rev. 5',
    categories: ['Access Control', 'Audit and Accountability', 'Security Assessment']
  },
  {
    id: 'iso-27001',
    name: 'ISO 27001',
    description: 'Information Security Management System (ISMS) Standard',
    version: '2013',
    categories: ['Information Security Policies', 'Asset Management', 'Access Control']
  },
  {
    id: 'pci-dss',
    name: 'PCI DSS',
    description: 'Payment Card Industry Data Security Standard',
    version: '4.0',
    categories: ['Build and Maintain a Secure Network', 'Protect Cardholder Data', 'Maintain Vulnerability Management Program']
  }
];

const oldFrameworkData = {
  'nist-800-53': {
    name: 'NIST 800-53',
    version: 'Rev. 5',
    description: 'Security and Privacy Controls for Information Systems and Organizations',
    categories: ['Access Control', 'Audit and Accountability', 'Security Assessment'],
    controls: [
      {
        id: 'AC',
        name: 'Access Control',
        description: 'Access Control family of controls',
        subcontrols: [
          {
            id: 'AC-1',
            name: 'Access Control Policy and Procedures',
            description: 'The organization develops, documents, and disseminates an access control policy.'
          },
          {
            id: 'AC-2',
            name: 'Account Management',
            description: 'The organization manages information system accounts.'
          },
          {
            id: 'AC-3',
            name: 'Access Enforcement',
            description: 'The system enforces approved authorizations for access.'
          }
        ]
      }
    ]
  },
  'iso-27001': {
    name: 'ISO 27001',
    version: '2013',
    description: 'Information Security Management System (ISMS) Standard',
    categories: ['Information Security Policies', 'Asset Management', 'Access Control'],
    controls: [
      {
        id: 'A.5',
        name: 'Information Security Policies',
        description: 'Management direction for information security',
        subcontrols: [
          {
            id: 'A.5.1',
            name: 'Management direction for information security',
            description: 'To provide management direction and support for information security in accordance with business requirements and relevant laws and regulations.'
          },
          {
            id: 'A.5.2',
            name: 'Review of the policies for information security',
            description: 'The policies for information security should be reviewed at planned intervals or if significant changes occur.'
          }
        ]
      },
      {
        id: 'A.6',
        name: 'Organization of Information Security',
        description: 'Internal organization and mobile devices/teleworking',
        subcontrols: [
          {
            id: 'A.6.1',
            name: 'Internal Organization',
            description: 'Framework for initiation and control of information security implementation.'
          },
          {
            id: 'A.6.2',
            name: 'Mobile devices and teleworking',
            description: 'Security of teleworking and use of mobile devices.'
          }
        ]
      }
    ]
  },
  'pci-dss': {
    name: 'PCI DSS',
    version: '4.0',
    description: 'Payment Card Industry Data Security Standard',
    categories: ['Build and Maintain a Secure Network', 'Protect Cardholder Data', 'Maintain Vulnerability Management Program'],
    controls: [
      {
        id: 'Req-1',
        name: 'Install and Maintain Network Security Controls',
        description: 'Network security controls (NSCs) are security policy enforcement points that typically are used to manage and control network traffic.',
        subcontrols: [
          {
            id: '1.1',
            name: 'Processes and mechanisms for NSCs',
            description: 'Processes and procedures are defined and understood for managing and maintaining NSCs.'
          },
          {
            id: '1.2',
            name: 'Configure NSCs',
            description: 'NSCs are configured to manage traffic between networks and systems.'
          }
        ]
      },
      {
        id: 'Req-2',
        name: 'Apply Secure Configurations',
        description: 'Configuration standards and security parameters are defined and implemented to prevent misuse.',
        subcontrols: [
          {
            id: '2.1',
            name: 'Security Configuration Management',
            description: 'Processes for managing security configurations are defined and understood.'
          },
          {
            id: '2.2',
            name: 'Vendor Defaults',
            description: 'Vendor-supplied defaults are changed and unnecessary default accounts are removed before installing a system on the network.'
          }
        ]
      }
    ]
  }
};
