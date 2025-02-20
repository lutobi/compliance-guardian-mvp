import { EnhancedFramework } from '@/types/enhanced-framework';
import { accessControlDomain } from './access-control';
import { informationSecurityPolicies } from './information-security-policies';
import { organizationSecurity } from './organization-security';
import { humanResourceSecurity } from './human-resource-security';

export const iso27001Enhanced: EnhancedFramework = {
  id: 'iso-27001',
  name: 'ISO 27001',
  description: 'Information Security Management System (ISMS) requirements',
  version: '2.0.22',
  categories: [
    'Organizational Controls',
    'Asset Management',
    'Access Control',
    'Cryptography',
    'Physical Security',
    'Operations Security',
    'Communications Security',
    'System Acquisition',
    'Supplier Relationships',
    'Incident Management',
    'Business Continuity',
    'Compliance'
  ],
  controls: [
    informationSecurityPolicies,      // A.5
    organizationSecurity,             // A.6
    humanResourceSecurity,            // A.7
    accessControlDomain,              // A.9
    // Remaining controls to be implemented:
    // A.8  Asset management
    // A.10 Cryptography
    // A.11 Physical and environmental security
    // A.12 Operations security
    // A.13 Communications security
    // A.14 System acquisition, development and maintenance
    // A.15 Supplier relationships
    // A.16 Information security incident management
    // A.17 Information security aspects of business continuity management
    // A.18 Compliance
  ],
  mappings: []
};
