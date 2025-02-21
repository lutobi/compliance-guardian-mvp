import { Framework } from '@/types/framework';

export interface FrameworkRegistryItem extends Framework {
  category: 'security' | 'privacy' | 'ai' | 'cloud';
  dataComplete: boolean;
  implementationStatus: 'complete' | 'partial' | 'incomplete';
  updatedAt: string;
}

export type FrameworkRegistry = Record<string, FrameworkRegistryItem>;

export const frameworkRegistry: FrameworkRegistry = {
  'soc2': {
    id: 'soc2',
    name: 'SOC 2',
    description: 'Service Organization Control 2 (SOC 2) is a framework for managing customer data based on five trust service criteria.',
    version: '2017',
    category: 'security',
    dataComplete: true,
    implementationStatus: 'complete',
    categories: ['Common Criteria', 'Privacy', 'Availability', 'Confidentiality', 'Processing Integrity'],
    updatedAt: '2025-02-21T08:00:00Z'
  },
  'hipaa': {
    id: 'hipaa',
    name: 'Health Insurance Portability and Accountability Act (HIPAA)',
    description: 'HIPAA establishes national standards for the protection of individuals\' medical records and other personal health information.',
    version: '2013',
    category: 'privacy',
    dataComplete: true,
    implementationStatus: 'complete',
    categories: ['Privacy Rule', 'Security Rule', 'Enforcement Rule', 'Breach Notification'],
    updatedAt: '2025-02-21T08:00:00Z'
  },
  'nist-800-53': {
    id: 'nist-800-53',
    name: 'NIST SP 800-53',
    description: 'Security and Privacy Controls for Federal Information Systems and Organizations.',
    version: 'Rev. 5',
    category: 'security',
    dataComplete: true,
    implementationStatus: 'complete',
    categories: ['Access Control', 'Audit and Accountability', 'Security Assessment'],
    updatedAt: '2025-02-21T08:00:00Z'
  },
  'iso-27001': {
    id: 'iso-27001',
    name: 'ISO/IEC 27001',
    description: 'International standard for information security management systems (ISMS).',
    version: '2022',
    category: 'security',
    dataComplete: true,
    implementationStatus: 'complete',
    categories: ['Information Security Policies', 'Organization of Information Security', 'Human Resource Security', 'Asset Management', 'Access Control'],
    updatedAt: '2025-02-21T08:00:00Z'
  },
  'gdpr': {
    id: 'gdpr',
    name: 'General Data Protection Regulation (GDPR)',
    description: 'EU regulation on data protection and privacy for all individuals within the EU and EEA.',
    version: '2016/679',
    category: 'privacy',
    dataComplete: true,
    implementationStatus: 'complete',
    categories: ['Data Protection Principles', 'Data Subject Rights', 'Controller and Processor Obligations', 'Security Requirements', 'Data Transfer Requirements'],
    updatedAt: '2025-02-21T08:00:00Z'
  },
  'iso-27017': {
    id: 'iso-27017',
    name: 'ISO/IEC 27017',
    description: 'Code of practice for information security controls for cloud services.',
    version: '2015',
    category: 'cloud',
    dataComplete: true,
    implementationStatus: 'complete',
    categories: ['Cloud Service Provider Controls', 'Cloud Customer Controls', 'Shared Controls'],
    updatedAt: '2025-02-21T08:00:00Z'
  },
  'iso-27018': {
    id: 'iso-27018',
    name: 'ISO/IEC 27018',
    description: 'Code of practice for protection of personally identifiable information (PII) in public clouds.',
    version: '2019',
    category: 'cloud',
    dataComplete: true,
    implementationStatus: 'complete',
    categories: ['Consent and Choice', 'Purpose Legitimacy', 'Data Minimization', 'Use Limitation'],
    updatedAt: '2025-02-21T08:00:00Z'
  },
  'csa-star': {
    id: 'csa-star',
    name: 'CSA STAR',
    description: 'Cloud Security Alliance Security Trust Assurance and Risk - Cloud security certification program.',
    version: '4.0',
    category: 'cloud',
    dataComplete: true,
    implementationStatus: 'complete',
    categories: ['Cloud Security Controls', 'Risk Management', 'Security Operations', 'Data Security'],
    updatedAt: '2025-02-21T08:00:00Z'
  },
  'iso-42001': {
    id: 'iso-42001',
    name: 'ISO/IEC 42001',
    description: 'Artificial Intelligence Management System (AIMS) - Requirements and guidance for AI governance.',
    version: '2023',
    category: 'ai',
    dataComplete: true,
    implementationStatus: 'complete',
    categories: ['AI Governance', 'Risk Management', 'Ethical Considerations', 'Transparency Requirements'],
    updatedAt: '2025-02-21T08:00:00Z'
  },
  'nist-ai-rmf': {
    id: 'nist-ai-rmf',
    name: 'NIST AI Risk Management Framework',
    description: 'Guidelines for managing risks in AI systems throughout their lifecycle.',
    version: '1.0',
    category: 'ai',
    dataComplete: true,
    implementationStatus: 'complete',
    categories: ['Govern', 'Map', 'Measure', 'Manage'],
    updatedAt: '2025-02-21T08:00:00Z'
  },
  'pci-dss': {
    id: 'pci-dss',
    name: 'PCI DSS',
    description: 'Payment Card Industry Data Security Standard - Requirements and security assessment procedures.',
    version: '4.0',
    category: 'security',
    dataComplete: true,
    implementationStatus: 'complete',
    categories: ['Build and Maintain a Secure Network', 'Protect Cardholder Data', 'Maintain Vulnerability Management Program', 'Implement Strong Access Control Measures', 'Regularly Monitor and Test Networks', 'Maintain Information Security Policy'],
    updatedAt: '2025-02-21T08:00:00Z'
  }
};
