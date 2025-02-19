export const frameworks = [
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

export const frameworkData: Record<string, any> = {
  'nist-800-53': {
    name: 'NIST 800-53',
    version: 'Rev. 5',
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
  }
};
