import { createClient } from '@supabase/supabase-js';
import { ControlService } from '../src/services/control.js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const controlService = new ControlService(supabase);

async function main() {
  try {
    // Get framework ID for ISO 27001
    const { data: frameworks } = await supabase
      .from('frameworks')
      .select('id')
      .eq('slug', 'iso27001')
      .single();

    if (!frameworks) {
      throw new Error('ISO 27001 framework not found');
    }

    const frameworkId = frameworks.id;

    // Test getting all controls
    console.log('\nFetching all controls...');
    const controls = await controlService.getFrameworkControls(frameworkId);
    console.log(`Found ${controls.length} controls`);

    // Test getting control by slug
    console.log('\nFetching control by slug...');
    const control = await controlService.getControlBySlug(frameworkId, 'a5.1.1');
    console.log('Control:', control);

    // Test getting control hierarchy
    console.log('\nFetching control hierarchy...');
    const hierarchy = await controlService.getControlHierarchy(frameworkId);
    console.log('Hierarchy:', JSON.stringify(hierarchy, null, 2));

    // Test updating control status
    if (control) {
      console.log('\nUpdating control status...');
      await controlService.updateControlStatus(control.id, 'in-progress');
      console.log('Status updated');

      // Verify update
      const updatedControl = await controlService.getControlBySlug(frameworkId, 'a5.1.1');
      console.log('Updated control:', updatedControl);
    }

    // Test real-time subscription
    console.log('\nSetting up real-time subscription...');
    controlService.subscribeToFrameworkControls(frameworkId, (payload) => {
      console.log('Control changed:', payload);
    });

    console.log('Waiting for changes... (press Ctrl+C to exit)');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
