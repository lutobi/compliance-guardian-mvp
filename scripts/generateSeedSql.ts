import { frameworkData } from '../src/data/frameworks';

function quoteArray(arr: string[]): string {
  return 'ARRAY[' + arr.map(s => `'${s.replace(/'/g,"''")}'`).join(', ') + ']';
}

const lines: string[] = [];

// 1) Upsert frameworks
lines.push('-- 1) Upsert frameworks');
lines.push('INSERT INTO public.frameworks (id, name, version, description, categories)');
lines.push('VALUES');
const fwLines = Object.entries(frameworkData).map(([id, fw]) => {
  const categories = fw.categories || [];
  return `  ('${id}', '${fw.name.replace(/'/g,"''")}', '${fw.version}', '${(fw.description||'').replace(/'/g,"''")}', ${quoteArray(categories)})`;
});
lines.push(fwLines.join(',\n'));
lines.push('ON CONFLICT (id) DO UPDATE');
lines.push('  SET name = EXCLUDED.name,');
lines.push('      version = EXCLUDED.version,');
lines.push('      description = EXCLUDED.description,');
lines.push('      categories = EXCLUDED.categories;');
lines.push('');

// 2) Upsert controls
lines.push('-- 2) Upsert controls');
lines.push('INSERT INTO public.controls (id, framework_id, name, description)');
lines.push('VALUES');
const ctrlLines: string[] = [];
Object.entries(frameworkData).forEach(([fwId, fw]) => {
  (fw.controls || []).forEach(ctrl => {
    ctrlLines.push(`  ('${ctrl.id}', '${fwId}', '${ctrl.name.replace(/'/g,"''")}', '${(ctrl.description||'').replace(/'/g,"''")}')`);
  });
});
lines.push(ctrlLines.join(',\n'));
lines.push('ON CONFLICT (id) DO UPDATE');
lines.push('  SET framework_id = EXCLUDED.framework_id,');
lines.push('      name = EXCLUDED.name,');
lines.push('      description = EXCLUDED.description;');
lines.push('');

// 3) Upsert subcontrols
lines.push('-- 3) Upsert subcontrols');
lines.push('INSERT INTO public.subcontrols (id, control_id, name, description)');
lines.push('VALUES');
const subLines: string[] = [];
Object.entries(frameworkData).forEach(([fwId, fw]) => {
  (fw.controls || []).forEach(ctrl => {
    (ctrl.subcontrols || []).forEach(sub => {
      subLines.push(`  ('${sub.id}', '${ctrl.id}', '${sub.name.replace(/'/g,"''")}', '${(sub.description||'').replace(/'/g,"''")}')`);
    });
  });
});
lines.push(subLines.join(',\n'));
lines.push('ON CONFLICT (id) DO UPDATE');
lines.push('  SET control_id = EXCLUDED.control_id,');
lines.push('      name = EXCLUDED.name,');
lines.push('      description = EXCLUDED.description;');

console.log(lines.join('\n'));
