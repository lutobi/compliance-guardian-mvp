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
    id: nist80053.id,
    name: nist80053.name,
    description: nist80053.description,
    version: nist80053.version,
    categories: nist80053.categories
  },
  {
    id: gdpr.id,
    name: gdpr.name,
    description: gdpr.description,
    version: gdpr.version,
    categories: gdpr.categories
  },
  {
    id: hipaa.id,
    name: hipaa.name,
    description: hipaa.description,
    version: hipaa.version,
    categories: hipaa.categories
  },
  {
    id: iso42001.id,
    name: iso42001.name,
    description: iso42001.description,
    version: iso42001.version,
    categories: iso42001.categories
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
    id: pciDss.id,
    name: pciDss.name,
    description: pciDss.description,
    version: pciDss.version,
    categories: pciDss.categories
  },
  {
    ...iso27001Enhanced,
    id: 'iso-27001'
  }
];

export const frameworkData: Record<string, FrameworkData> = {
  'iso-27001': iso27001Enhanced,
  'csa-star': {
    ...csaStar,
    controls: csaStar.controls || []
  },
  'iso-27017': {
    ...iso27017,
    controls: iso27017.controls || []
  },
  'iso-27018': {
    ...iso27018,
    controls: iso27018.controls || []
  },
  'nist-800-53': {
    ...nist80053,
    controls: nist80053.controls || []
  },
  'gdpr': {
    ...gdpr,
    controls: gdpr.controls || []
  },
  'hipaa': {
    ...hipaa,
    controls: hipaa.controls || []
  },
  'iso-42001': {
    ...iso42001,
    controls: iso42001.controls || []
  },
  'soc-2': {
    ...soc2,
    controls: soc2.controls || []
  },
  'nist-ai-rmf': {
    ...nistAiRmf,
    controls: nistAiRmf.controls || []
  },
  'pci-dss': {
    ...pciDss,
    controls: pciDss.controls || []
  }
};
