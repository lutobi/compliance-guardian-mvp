#!/usr/bin/env tsx
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';

interface OscalCatalog {
  catalog: {
    metadata: { title: string; version: string; };
    groups: Array<{
      id: string;
      title: string;
      props?: Array<{ name: string; value: string; }>;
      controls: Array<{ id: string; }>;
    }>;
    controls: Array<{
      id: string;
      title: string;
      parts?: Array<{ prose?: string }>;
    }>;
  };
}

function fetchJson(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          // Remove BOM if present
          const text = data.replace(/^\uFEFF/, '');
          resolve(JSON.parse(text));
        } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function transformNist(json: OscalCatalog) {
  const catalog = (json as any).catalog;
  const version = catalog.metadata.version || '';
  const groups = catalog.groups;
  const controlsArr: any[] = (catalog.controls || []).map(c => ({ id: c.id.toUpperCase(), title: c.title, parts: c.parts }));
  const controlsMap = new Map<string, any>(controlsArr.map(c => [c.id, c]));

  return {
    id: 'nist-800-53',
    name: 'NIST SP 800-53',
    version,
    description: catalog.metadata.title,
    categories: groups.map(g => g.title),
    controls: groups.map(g => ({
      id: g.id.toUpperCase(),
      name: g.title,
      description: g.props?.find(p => p.name === 'description')?.value || '',
      subcontrols: g.controls.map(rc => {
        const id = rc.id.toUpperCase();
        // Use catalog definitions if available, else fallback to rc
        const def = controlsMap.get(id) || controlsMap.get(rc.id) || rc;
        const name = def.title || '';
        const parts = def.parts || [];
        const description = parts.map((p: any) => p.prose).filter(Boolean).join(' ');
        return { id, name, description };
      }).filter(sc => sc.name || sc.description)
    }))
  };
}

async function updateNist(baseline: string) {
  const url = `https://raw.githubusercontent.com/usnistgov/oscal-content/main/nist.gov/SP800-53/rev5/json/NIST_SP-800-53_rev5_${baseline}-baseline-resolved-profile_catalog-min.json`;
  console.log('Fetching NIST SP 800-53 Rev5 JSON...');
  const json = await fetchJson(url).catch(err => { throw new Error(`Failed to fetch NIST JSON: ${err}`); });
  const data = transformNist(json);
  // Filter minimal checklist controls and subcontrols
  const allowedControls = new Set(['AC','AT','AU','CA','CM','CP','IA','IR','RA','SA','SC','SI']);
  const allowedSubcontrols = new Set([  
    'AC-2','AC-7','AC-11',  
    'AT-2','AT-3',  
    'AU-2','AU-6','AU-9',  
    'CA-2','CA-6',  
    'CM-2','CM-3',  
    'CP-2','CP-4',  
    'IA-2','IA-5',  
    'IR-2','IR-4',  
    'RA-3',  
    'SA-4',  
    'SC-7','SC-13',  
    'SI-2','SI-3',  
]);
// Simplified subcontrol titles
const subcontrolNames: Record<string, string> = {  
  'AC-2': 'Inventory and manage user accounts',  
  'AC-7': 'Enforce failed login thresholds',  
  'AC-11': 'Session lock settings',  
  'AT-2': 'Develop security training curriculum',  
  'AT-3': 'Maintain training completion records',  
  'AU-2': 'Centralized audit logging',  
  'AU-6': 'Review audit logs',  
  'AU-9': 'Protect audit logs',  
  'CA-2': 'Perform security control assessments',  
  'CA-6': 'Maintain authorization package',  
  'CM-2': 'Baseline security configurations',  
  'CM-3': 'Respond to configuration deviations',  
  'CP-2': 'Develop contingency plan',  
  'CP-4': 'Test contingency plans',  
  'IA-2': 'Implement multifactor authentication',  
  'IA-5': 'Review authentication methods',  
  'IR-2': 'Assign incident response roles & training',  
  'IR-4': 'Define incident response process',  
  'RA-3': 'Conduct risk assessments',  
  'SA-4': 'Integrate security into procurement',  
  'SC-7': 'Network segmentation & firewalls',  
  'SC-13': 'Monitor communications boundaries',  
  'SI-2': 'Deploy anti-malware & IDS',  
  'SI-3': 'Implement timely patching',  
  'SI-4': 'Monitor system integrity',  
};

const subcontrolDescriptions: Record<string, string> = {
  'AC-2': 'Inventory and manage user accounts, ensuring permissions are aligned with job responsibilities.',
  'AC-7': 'Establish and enforce failed login attempt thresholds.',
  'AC-11': 'Establish and enforce session lock settings.',
  'AT-2': 'Develop a comprehensive security training curriculum tailored to different roles.',
  'AT-3': 'Keep records of training completion for audits and continuous improvement.',
  'AU-2': 'Set up centralized logging and ensure logs are protected against unauthorized access and tampering.',
  'AU-6': 'Regularly review audit logs for signs of unauthorized or anomalous activity.',
  'AU-9': 'Ensure logs are protected against unauthorized access and tampering.',
  'CA-2': 'Schedule and perform regular security control assessments to validate efficacy.',
  'CA-6': 'Document and maintain a current authorization package for each system.',
  'CM-2': 'Create and implement baseline security configurations for all IT assets.',
  'CM-3': 'Establish procedures for prompt response to detected configuration deviations.',
  'CP-2': 'Develop detailed, actionable recovery plans for various types of operational disruptions.',
  'CP-4': 'Conduct regular drills and simulations to test and refine contingency plans.',
  'IA-2': 'Implement multifactor authentication (MFA) wherever feasible.',
  'IA-5': 'Regularly review and update user authentication methods to maintain robust security.',
  'IR-2': 'Assign incident response roles and ensure all team members are trained.',
  'IR-4': 'Develop a formal incident response process that includes preparation, detection, analysis, containment, eradication, and recovery phases.',
  'RA-3': 'Identify and document potential threat sources and vulnerabilities; utilize quantitative and qualitative methods to assess security risks and prioritize remedial actions.',
  'SA-4': 'Integrate security considerations into the procurement process; regularly evaluate vendors’ security practices to ensure they meet or exceed your standards.',
  'SC-7': 'Employ network segmentation, firewalls, and encryption to protect network traffic.',
  'SC-13': 'Monitor and control communications at external and key internal boundaries.',
  'SI-2': 'Deploy anti-malware solutions and intrusion detection systems.',
  'SI-3': 'Implement processes for timely patching of systems and applications.',
};

  const filteredControls = data.controls.filter(c => allowedControls.has(c.id))
    .map(c => ({
      ...c,
      subcontrols: c.subcontrols
        .filter(sc => allowedSubcontrols.has(sc.id))
        .map(sc => {
          const name = subcontrolNames[sc.id] || sc.name;
          const description = subcontrolDescriptions[sc.id];
          return { id: sc.id, name, description };
        })
    }));
  const filteredData = { ...data, controls: filteredControls };
  const outPath = path.resolve(__dirname, '../src/data/frameworks/nist-800-53.ts');
  const content = `/* AUTO-GENERATED: DO NOT EDIT */\nexport const nist80053 = ${JSON.stringify(filteredData, null, 2)} as const;\n`;
  fs.writeFileSync(outPath, content, 'utf-8');
  console.log('nist-800-53.ts updated');
}

async function main() {
  console.log('Updating frameworks...');
  const baselineArg = (process.argv[2] || 'high').toLowerCase();
  if (!['low', 'moderate', 'high'].includes(baselineArg)) {
    console.error(`Invalid baseline: ${baselineArg}. Must be one of low, moderate, or high`);
    process.exit(1);
  }
  const baseline = baselineArg.toUpperCase();
  await updateNist(baseline);
  console.log('Framework update complete.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
