import { nist80053 } from './frameworks/nist-800-53';
import { iso27001Enhanced } from './frameworks/iso27001-enhanced';
import { gdpr } from './frameworks/gdpr';
import { hipaa } from './frameworks/hipaa';
import { iso42001 } from './frameworks/iso42001';
import { soc2 } from './frameworks/soc2';
import { nistAiRmf } from './frameworks/nist-ai-rmf';
import { csaStar, iso27017, iso27018 } from './frameworks/cloud-security';
import { pciDss } from './frameworks/pci-dss';
import { Framework, FrameworkData } from '../types/framework';

// Full framework data
export const frameworkData: Record<string, FrameworkData> = {
  'csa-star': csaStar,
  'iso-27017': iso27017,
  'iso-27018': iso27018,
  // ISO 27001 alias: support both slugs
  'iso-27001': iso27001Enhanced,
  'iso27001-2022': iso27001Enhanced,
  'gdpr': gdpr,
  'hipaa': hipaa,
  'iso-42001': iso42001,
  'soc2': soc2,
  'nist-ai-rmf': nistAiRmf,
  'nist-800-53': nist80053,
  'pci-dss': pciDss,
  // Minimal placeholders to avoid page errors; can be enriched later or overridden by DB
  'nist-800-171': {
    id: 'nist-800-171',
    name: 'NIST SP 800-171',
    description: 'Protecting Controlled Unclassified Information in Nonfederal Systems and Organizations',
    version: 'Rev. 3',
    controls: [],
    last_synced_at: new Date().toISOString(),
  },
  'cmmc': {
    id: 'cmmc',
    name: 'CMMC',
    description: 'Cybersecurity Maturity Model Certification',
    version: '2.0',
    controls: [],
    last_synced_at: new Date().toISOString(),
  },
  'eudr': {
    id: 'eudr',
    name: 'EUDR',
    description: 'EU Regulation on deforestation-free products',
    version: '2023/1115',
    controls: [],
    last_synced_at: new Date().toISOString(),
  },
};

// Framework summaries for listing
export const frameworks: Framework[] = Object.entries(frameworkData).map(([id, data]) => ({
  id,
  name: data.name,
  description: data.description,
  version: data.version,
  categories: data.categories,
  updated_at: data.updated_at || new Date().toISOString()
}));
