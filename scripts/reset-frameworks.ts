import 'ts-node/register';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { frameworkData } from '../src/data/frameworks';

dotenv.config({ path: '.env.local' });

async function resetAndSeed() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
    process.exit(1);
  }
  const supabase = createClient(url, key);

  console.log('Truncating tables...');
  await supabase.from('framework_update_logs').delete().neq('framework_id', '');
  await supabase.from('subcontrols').delete().neq('id', '');
  await supabase.from('controls').delete().neq('control_id', '');
  await supabase.from('frameworks').delete().neq('id', '');

  console.log('Seeding frameworks, controls, and subcontrols...');
  for (const [slug, fw] of Object.entries(frameworkData)) {
    console.log(`Upserting framework ${slug}`);
    const { error: fwErr } = await supabase.from('frameworks').upsert({
      id: slug,
      slug: slug,
      name: fw.name,
      description: fw.description,
      version: fw.version,
      categories: fw.categories,
    });
    if (fwErr) console.error('Error upserting framework', slug, fwErr);

    for (const ctrl of fw.controls) {
      console.log(`  Upserting control ${ctrl.id}`);
      const { error: ctrlErr } = await supabase.from('controls').upsert({
        id: ctrl.id,
        framework_id: slug,
        control_id: ctrl.id,
        name: ctrl.name,
        description: ctrl.description,
        subcontrols: ctrl.subcontrols || [],
      });
      if (ctrlErr) console.error('Error upserting control', ctrl.id, ctrlErr);

      for (const sub of ctrl.subcontrols || []) {
        console.log(`    Upserting subcontrol ${sub.id}`);
        const { error: subErr } = await supabase.from('subcontrols').upsert({
          id: sub.id,
          control_id: ctrl.id,
          name: sub.name,
          description: sub.description,
        });
        if (subErr) console.error('Error upserting subcontrol', sub.id, subErr);
      }
    }
  }

  console.log('Reset and seed completed.');
}

resetAndSeed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Reset script failed:', err);
    process.exit(1);
  });
