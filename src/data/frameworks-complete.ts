import { nist80053 } from './frameworks/nist-800-53';
import { gdpr } from './frameworks/gdpr';
import { hipaa } from './frameworks/hipaa';
import { iso42001 } from './frameworks/iso42001';
import { soc2 } from './frameworks/soc2';
import { nistAiRmf } from './frameworks/nist-ai-rmf';
import { csaStar, iso27017, iso27018 } from './frameworks/cloud-security';

import { Framework, FrameworkData } from '../types/framework';

export const frameworks: Framework[] = [
  {
    id: csaStar.id,
    name: csaStar.name,
    description: csaStar.description,
    version: csaStar.version,
    categories: csaStar.categories
  },
  {
    id: iso27017.id,
    name: iso27017.name,
    description: iso27017.description,
    version: iso27017.version,
    categories: iso27017.categories
  },
  {
    id: iso27018.id,
    name: iso27018.name,
    description: iso27018.description,
    version: iso27018.version,
    categories: iso27018.categories
  },
  {
    id: soc2.id,
    name: soc2.name,
    description: soc2.description,
    version: soc2.version,
    categories: soc2.categories
  },
  {
    id: nistAiRmf.id,
    name: nistAiRmf.name,
    description: nistAiRmf.description,
    version: nistAiRmf.version,
    categories: nistAiRmf.categories
  },
  {
    id: iso42001.id,
    name: iso42001.name,
    description: iso42001.description,
    version: iso42001.version,
    categories: iso42001.categories
  },
  {
    id: hipaa.id,
    name: hipaa.name,
    description: hipaa.description,
    version: hipaa.version,
    categories: hipaa.categories
  },
  {
    id: gdpr.id,
    name: gdpr.name,
    description: gdpr.description,
    version: gdpr.version,
    categories: gdpr.categories
  },
  {
    id: nist80053.id,
    name: nist80053.name,
    description: nist80053.description,
    version: nist80053.version,
    categories: nist80053.categories
  },
  {
    id: 'iso-27001',
    name: 'ISO 27001',
    description: 'Information Security Management System (ISMS) Standard',
    version: '2013',
    categories: ['Information Security Policies', 'Asset Management', 'Access Control', 'Operations Security', 'Communications Security']
  },
  {
    id: 'pci-dss',
    name: 'PCI DSS',
    description: 'Payment Card Industry Data Security Standard',
    version: '4.0',
    categories: ['Build and Maintain a Secure Network', 'Protect Cardholder Data', 'Maintain Vulnerability Management Program', 'Access Control Measures', 'Network Monitoring']
  }
];

export const frameworkData: { [key: string]: FrameworkData } = {
  'csa-star': {
    name: csaStar.name,
    version: csaStar.version,
    description: csaStar.description,
    categories: csaStar.categories,
    controls: csaStar.controls
  },
  'iso-27017': {
    name: iso27017.name,
    version: iso27017.version,
    description: iso27017.description,
    categories: iso27017.categories,
    controls: iso27017.controls
  },
  'iso-27018': {
    name: iso27018.name,
    version: iso27018.version,
    description: iso27018.description,
    categories: iso27018.categories,
    controls: iso27018.controls
  },
  'soc2': {
    name: soc2.name,
    version: soc2.version,
    description: soc2.description,
    categories: soc2.categories,
    controls: soc2.controls
  },
  'nist-ai-rmf': {
    name: nistAiRmf.name,
    version: nistAiRmf.version,
    description: nistAiRmf.description,
    categories: nistAiRmf.categories,
    controls: nistAiRmf.controls
  },
  'iso-42001': {
    name: iso42001.name,
    version: iso42001.version,
    description: iso42001.description,
    categories: iso42001.categories,
    controls: iso42001.controls
  },
  'hipaa': {
    name: hipaa.name,
    version: hipaa.version,
    description: hipaa.description,
    categories: hipaa.categories,
    controls: hipaa.controls
  },
  'gdpr': {
    name: gdpr.name,
    version: gdpr.version,
    description: gdpr.description,
    categories: gdpr.categories,
    controls: gdpr.controls
  },
  'nist-800-53': {
    name: nist80053.name,
    version: nist80053.version,
    description: nist80053.description,
    categories: nist80053.categories,
    controls: nist80053.controls
  },
  'iso-27001': {
    name: 'ISO 27001',
    version: '2013',
    description: 'Information Security Management System (ISMS) Standard',
    categories: ['Information Security Policies', 'Asset Management', 'Access Control', 'Operations Security', 'Communications Security'],
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
      },
      {
        id: 'A.7',
        name: 'Human Resource Security',
        description: 'Security aspects for employees joining, moving, and leaving the organization',
        subcontrols: [
          {
            id: 'A.7.1',
            name: 'Prior to Employment',
            description: 'Security responsibilities are addressed prior to employment.'
          },
          {
            id: 'A.7.2',
            name: 'During Employment',
            description: 'Security awareness, education, and training for employees.'
          },
          {
            id: 'A.7.3',
            name: 'Termination and Change of Employment',
            description: 'Security responsibilities and duties that remain valid after termination.'
          }
        ]
      },
      {
        id: 'A.8',
        name: 'Asset Management',
        description: 'Identifying organizational assets and defining protection responsibilities',
        subcontrols: [
          {
            id: 'A.8.1',
            name: 'Responsibility for Assets',
            description: 'Inventory of assets and acceptable use of assets.'
          },
          {
            id: 'A.8.2',
            name: 'Information Classification',
            description: 'Classification of information in terms of legal requirements, value, and sensitivity.'
          },
          {
            id: 'A.8.3',
            name: 'Media Handling',
            description: 'Management of removable media in accordance with the classification scheme.'
          }
        ]
      }
    ]
  },
  'pci-dss': {
    name: 'PCI DSS',
    version: '4.0',
    description: 'Payment Card Industry Data Security Standard',
    categories: ['Build and Maintain a Secure Network', 'Protect Cardholder Data', 'Maintain Vulnerability Management Program', 'Access Control Measures', 'Network Monitoring'],
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
          },
          {
            id: '1.3',
            name: 'Network Access Controls',
            description: 'Access to the cardholder data environment is controlled and restricted.'
          },
          {
            id: '1.4',
            name: 'Network Segmentation',
            description: 'Cardholder data environment is isolated from other networks.'
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
          },
          {
            id: '2.3',
            name: 'Encryption for Non-Console Access',
            description: 'Strong cryptography is used for non-console administrative access.'
          }
        ]
      },
      {
        id: 'Req-3',
        name: 'Protect Stored Account Data',
        description: 'Protection methods such as encryption, truncation, masking, and hashing are critical components of account data protection.',
        subcontrols: [
          {
            id: '3.1',
            name: 'Data Storage and Retention',
            description: 'Keep cardholder data storage to a minimum and define retention policies.'
          },
          {
            id: '3.2',
            name: 'Sensitive Authentication Data',
            description: 'Do not store sensitive authentication data after authorization.'
          },
          {
            id: '3.3',
            name: 'Display of PAN',
            description: 'Mask display of PAN when displayed.'
          },
          {
            id: '3.4',
            name: 'Render PAN Unreadable',
            description: 'Make PAN unreadable anywhere it is stored.'
          }
        ]
      },
      {
        id: 'Req-4',
        name: 'Protect Cardholder Data with Strong Cryptography',
        description: 'Cryptographic keys used for encryption of cardholder data provide a high degree of confidence that the data cannot be accessed without authorization.',
        subcontrols: [
          {
            id: '4.1',
            name: 'Use Strong Cryptography',
            description: 'Use strong cryptography and security protocols to safeguard sensitive cardholder data during transmission.'
          },
          {
            id: '4.2',
            name: 'Never Send Unprotected PANs',
            description: 'Never send unprotected PANs by end-user messaging technologies.'
          }
        ]
      }
    ]
  }
};
