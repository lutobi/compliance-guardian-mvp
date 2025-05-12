import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
// Load environment variables: first from .env.local (if present), then fallback to .env
dotenv.config({ path: '.env.local' });
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY env var');
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

export async function insertSampleData() {
  // Add a sample framework
  const { data: framework, error: frameworkError } = await supabase
    .from('frameworks')
    .insert({
      name: 'ISO 27001:2022',
      slug: 'iso27001',
      version: '2022',
      categories: ['international', 'security', 'management'],
      description: 'Information Security Management System (ISMS)',
      is_default: false
    })
    .select()
    .single();

  if (frameworkError) {
    console.error('Error inserting framework:', frameworkError);
    return;
  }

  // Add sample controls
  const controls = [
    {
      framework_id: framework.id,
      control_id: 'A.5.1',
      title: 'Information Security Policies',
      description: 'Management direction for information security'
    },
    {
      framework_id: framework.id,
      control_id: 'A.5.2',
      title: 'Information Security Roles and Responsibilities',
      description: 'Organization of information security'
    }
  ];

  const { data: insertedControls, error: controlsError } = await supabase
    .from('controls')
    .insert(controls)
    .select();

  if (controlsError) {
    console.error('Error inserting controls:', controlsError);
    return;
  }

  // Add sample subcontrols
  const subcontrols = [
    {
      control_id: insertedControls[0].id,
      id: 'A.5.1.1',
      title: 'Policies for information security',
      description: 'A set of policies for information security shall be defined, approved by management, published and communicated to employees and relevant external parties.',
    },
    {
      control_id: insertedControls[0].id,
      id: 'A.5.1.2',
      title: 'Review of the policies for information security',
      description: 'The policies for information security shall be reviewed at planned intervals or if significant changes occur to ensure their continuing suitability, adequacy and effectiveness.',
    },
    {
      control_id: insertedControls[1].id,
      id: 'A.5.2.1',
      title: 'Information security roles and responsibilities',
      description: 'All information security responsibilities shall be defined and allocated.',
    }
  ];

  const { error: subcontrolsError } = await supabase
    .from('subcontrols')
    .insert(subcontrols);

  if (subcontrolsError) {
    console.error('Error inserting subcontrols:', subcontrolsError);
    return;
  }

  console.log('Sample data inserted successfully');
}
