// @ts-nocheck
import dotenv from 'dotenv';
// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import { frameworkData } from '../src/data/frameworks';

async function seed() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  for (const [slug, fw] of Object.entries(frameworkData)) {
    console.log(`Upserting framework: ${fw.name}`);
    // Upsert framework by unique slug
    // @ts-ignore
    const { data: fwRow, error: fwErr } = await supabase
      .from('frameworks')
      .upsert([
        {
          slug: slug,
          name: fw.name,
          version: fw.version,
          description: fw.description,
          categories: fw.categories,
        }
      ], { onConflict: ['slug'], returning: 'representation' })
      .select('id')
      .single();
    if (fwErr || !fwRow) {
      console.error('Framework upsert error:', fwErr);
      continue;
    }
    const frameworkId = fwRow.id;

    for (const ctrl of fw.controls) {
      console.log(`  Upserting control: ${ctrl.name}`);
      // @ts-ignore
      const { data: ctrlRow, error: ctrlErr } = await supabase
        .from('controls')
        .upsert([
          {
            framework_id: frameworkId,
            name: ctrl.name,
            description: ctrl.description,
          }
        ], { onConflict: ['framework_id', 'name'], returning: 'representation' })
        .select('id')
        .single();
      if (ctrlErr || !ctrlRow) {
        console.error('Control upsert error:', ctrlErr);
        continue;
      }
      const controlId = ctrlRow.id;

      for (const sub of ctrl.subcontrols || []) {
        console.log(`    Upserting subcontrol: ${sub.name}`);
        // @ts-ignore
        const { data: subRow, error: subErr } = await supabase
          .from('subcontrols')
          .upsert([
            {
              control_id: controlId,
              name: sub.name,
              description: sub.description,
            }
          ], { onConflict: ['control_id', 'name'], returning: 'minimal' });
        if (subErr) {
          console.error('Subcontrol upsert error:', subErr);
        }
      }
    }
  }
  console.log('Seeding complete!');
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
