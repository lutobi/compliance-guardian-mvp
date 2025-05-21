import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const controlId = '34f5fff6-9f1a-4bf7-9a41-e2a1c70dd685';

const subcontrols = [
  {
    title: 'A.5.1 Policies for information security',
    description: 'Information security policies and rules shall be defined, approved by management, published, communicated to and acknowledged by relevant personnel and relevant interested parties, and reviewed at planned intervals and if significant changes occur.',
  },
  {
    title: 'A.5.2 Information security roles and responsibilities',
    description: 'Information security roles and responsibilities shall be defined and allocated according to the organization's needs.',
  },
  {
    title: 'A.5.3 Segregation of duties',
    description: 'Conflicting duties and areas of responsibility shall be segregated.',
  },
  {
    title: 'A.5.4 Management responsibilities',
    description: 'Management shall require all personnel to apply information security in accordance with the established policies and procedures of the organization.',
  },
  {
    title: 'A.5.5 Contact with authorities',
    description: 'The organization shall establish and maintain contact with relevant authorities.',
  }
];

async function createSubcontrols() {
  for (const sub of subcontrols) {
    const { data, error } = await supabase
      .from('subcontrols')
      .insert([
        {
          control_id: controlId,
          title: sub.title,
          description: sub.description,
        },
      ])
      .select();

    if (error) {
      console.error('Error creating subcontrol:', error);
    } else {
      console.log('Created subcontrol:', data);
    }
  }
}

createSubcontrols();
