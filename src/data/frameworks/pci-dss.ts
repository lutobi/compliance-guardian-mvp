export const pciDss = {
  id: 'pci-dss',
  name: 'PCI DSS',
  version: '4.0',
  description: 'Payment Card Industry Data Security Standard - Requirements and security assessment procedures',
  categories: [
    'Build and Maintain a Secure Network',
    'Protect Cardholder Data',
    'Maintain Vulnerability Management Program',
    'Implement Strong Access Control Measures',
    'Regularly Monitor and Test Networks',
    'Maintain Information Security Policy'
  ],
  controls: [
    {
      id: 'REQ1',
      name: 'Install and maintain network security controls',
      description: 'Network security controls (NSCs) are installed and maintained to protect the cardholder data environment',
      subcontrols: [
        {
          id: 'REQ1.1',
          name: 'Network Security Controls',
          description: 'Network security controls (NSCs) are defined and implemented'
        },
        {
          id: 'REQ1.2',
          name: 'Network Configuration Standards',
          description: 'Configuration standards for NSC are defined and implemented'
        },
        {
          id: 'REQ1.3',
          name: 'Network Access',
          description: 'Network access to and from the cardholder data environment is restricted'
        }
      ]
    },
    {
      id: 'REQ2',
      name: 'Apply secure configurations',
      description: 'Apply secure configurations to all system components',
      subcontrols: [
        {
          id: 'REQ2.1',
          name: 'Security Configuration Standards',
          description: 'Security configuration standards are developed and maintained'
        },
        {
          id: 'REQ2.2',
          name: 'Vendor Defaults',
          description: 'Vendor-supplied defaults are changed and unnecessary accounts are removed'
        }
      ]
    },
    {
      id: 'REQ3',
      name: 'Protect stored account data',
      description: 'Protect stored cardholder data',
      subcontrols: [
        {
          id: 'REQ3.1',
          name: 'Data Retention',
          description: 'Keep cardholder data storage to a minimum'
        },
        {
          id: 'REQ3.2',
          name: 'Sensitive Authentication Data',
          description: 'Do not store sensitive authentication data after authorization'
        },
        {
          id: 'REQ3.3',
          name: 'Display of PAN',
          description: 'Mask PAN when displayed'
        }
      ]
    },
    {
      id: 'REQ4',
      name: 'Protect cardholder data with encryption',
      description: 'Encrypt transmission of cardholder data across open, public networks',
      subcontrols: [
        {
          id: 'REQ4.1',
          name: 'Data Transmission',
          description: 'Use strong cryptography and security protocols'
        },
        {
          id: 'REQ4.2',
          name: 'PAN Transmission',
          description: 'Never send unprotected PANs by end-user messaging technologies'
        }
      ]
    },
    {
      id: 'REQ5',
      name: 'Protect against malware',
      description: 'Protect all systems against malware and regularly update anti-virus software or programs',
      subcontrols: [
        {
          id: 'REQ5.1',
          name: 'Anti-Malware Deployment',
          description: 'Deploy anti-malware mechanisms'
        },
        {
          id: 'REQ5.2',
          name: 'Anti-Malware Updates',
          description: 'Keep anti-malware mechanisms current'
        },
        {
          id: 'REQ5.3',
          name: 'Anti-Malware Process',
          description: 'Anti-malware mechanisms are actively running'
        }
      ]
    },
    {
      id: 'REQ6',
      name: 'Develop and maintain secure systems',
      description: 'Develop and maintain secure systems and applications',
      subcontrols: [
        {
          id: 'REQ6.1',
          name: 'Security Vulnerabilities',
          description: 'Identify security vulnerabilities'
        },
        {
          id: 'REQ6.2',
          name: 'Software Updates',
          description: 'Protect system components and software from known vulnerabilities'
        },
        {
          id: 'REQ6.3',
          name: 'Software Development',
          description: 'Develop secure software applications'
        }
      ]
    }
  ]
};
