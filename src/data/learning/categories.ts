import { FrameworkCategory } from '@/types/learning';

export const frameworkCategories: FrameworkCategory[] = [
  {
    id: 'security',
    name: 'Security Frameworks',
    description: 'Frameworks focused on information security, data protection, and cybersecurity controls',
    frameworks: ['soc2', 'nist-800-53', 'iso-27001'],
    icon: 'ShieldCheck'
  },
  {
    id: 'privacy',
    name: 'Privacy Frameworks',
    description: 'Frameworks for protecting personal data and ensuring privacy compliance',
    frameworks: ['gdpr', 'ccpa'],
    icon: 'Lock'
  },
  {
    id: 'ai',
    name: 'AI Frameworks',
    description: 'Frameworks for managing artificial intelligence systems and ensuring responsible AI practices',
    frameworks: ['nist-ai-rmf', 'iso-42001'],
    icon: 'Brain'
  },
  {
    id: 'cloud',
    name: 'Cloud Security Frameworks',
    description: 'Frameworks specifically designed for cloud service providers and cloud security',
    frameworks: ['cloud-security', 'csa-ccm'],
    icon: 'Cloud'
  }
];
