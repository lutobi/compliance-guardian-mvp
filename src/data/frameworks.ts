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
