
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { frameworkData } from '../src/data/frameworks';

dotenv.config({ path: '.env.local' });

type FrameworkEntry = {
  id: string;
  name: string;
  version?: string;
  description?: string;
  categories?: string[];
  controls: Array<{ id: string; name: string; description?: string; subcontrols?: Array<{ id: string; name: string; description?: string }> }>;
};

async function seed() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
    process.exit(1);
  }
  const supabase = createClient(url, key);

  for (const [id, fw] of Object.entries(frameworkData) as [string, FrameworkEntry][]) {
    console.log(`Upserting framework ${id}`);
    await supabase.from('frameworks').upsert({
      id,
      slug: id,
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
}

seed().then(() => process.exit(0)).catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
