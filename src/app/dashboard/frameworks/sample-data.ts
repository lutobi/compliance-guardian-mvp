import { supabase } from '@/lib/supabase';

export async function insertSampleData() {
  // Add a sample framework
  const { data: framework, error: frameworkError } = await supabase
    .from('frameworks')
    .insert({
      name: 'ISO 27001:2022',
      version: '2022',
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
      subcontrol_id: 'A.5.1.1',
      title: 'Policies for information security',
      description: 'A set of policies for information security shall be defined, approved by management, published and communicated to employees and relevant external parties.',
      guidance: 'Ensure policies are reviewed at planned intervals and when significant changes occur.'
    },
    {
      control_id: insertedControls[0].id,
      subcontrol_id: 'A.5.1.2',
      title: 'Review of the policies for information security',
      description: 'The policies for information security shall be reviewed at planned intervals or if significant changes occur to ensure their continuing suitability, adequacy and effectiveness.',
      guidance: 'Regular review cycles should be established, typically annually or when major changes occur.'
    },
    {
      control_id: insertedControls[1].id,
      subcontrol_id: 'A.5.2.1',
      title: 'Information security roles and responsibilities',
      description: 'All information security responsibilities shall be defined and allocated.',
      guidance: 'Clearly document and communicate roles and responsibilities to all relevant parties.'
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
