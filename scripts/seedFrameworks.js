// Enable TS imports
require('ts-node/register');

// Enable TS module loading
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
// Import TS framework data
const { frameworkData } = require('../src/data/frameworks.ts');

async function seed() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
    process.exit(1);
  }
  const supabase = createClient(url, key);

  for (const [id, fw] of Object.entries(frameworkData)) {
    console.log(`Upserting framework ${id}`);
    await supabase.from('frameworks').upsert({
      id,
      name: fw.name,
      version: fw.version,
      description: fw.description,
      categories: fw.categories,
    });

    for (const ctrl of fw.controls) {
      console.log(`  Upserting control ${ctrl.id}`);
      await supabase.from('controls').upsert({
        id: ctrl.id,
        framework_id: id,
        name: ctrl.name,
        description: ctrl.description,
      });

      for (const sub of ctrl.subcontrols || []) {
        console.log(`    Upserting subcontrol ${sub.id}`);
        await supabase.from('subcontrols').upsert({
          id: sub.id,
          control_id: ctrl.id,
          name: sub.name,
          description: sub.description,
        });
      }
    }
  }

  console.log('Seeding completed.');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
