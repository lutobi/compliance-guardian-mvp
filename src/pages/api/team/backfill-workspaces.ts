import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client using service role
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
}
const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: { persistSession: false }
  }
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Fetch Customer Admin role ID
  const { data: roleData, error: roleError } = await supabaseAdmin
    .from('roles')
    .select('id')
    .eq('name', 'Customer')
    .single();

  if (roleError || !roleData) {
    console.error('Error fetching Customer Admin role:', roleError);
    return res.status(500).json({ error: 'Failed to fetch Customer Admin role' });
  }
  const customerRoleId = roleData.id;
  // Fetch users missing workspace_id and with customer role
  const { data: users, error: usersError } = await supabaseAdmin
    .from('users')
    .select('id, email')
    .eq('role_id', customerRoleId)
    .is('workspace_id', null);

  if (usersError) {
    console.error('Error fetching users for backfill:', usersError);
    return res.status(500).json({ error: 'Failed to fetch users', details: usersError });
  }

  const results: Array<any> = [];

  for (const user of users) {
    try {
      const workspaceName = `${user.email}'s Workspace`;
      // Create workspace
      const { data: ws, error: wsError } = await supabaseAdmin
        .from('workspaces')
        .insert({ name: workspaceName, type: 'customer', settings: {} })
        .select('id')
        .single();
      if (wsError || !ws) {
        results.push({ userId: user.id, error: wsError });
        continue;
      }
      const newWorkspaceId = ws.id;
      // Create customer
      const { data: cust, error: custError } = await supabaseAdmin
        .from('customers')
        .insert({ name: user.email, workspace_id: newWorkspaceId, settings: {} })
        .select('id')
        .single();
      if (custError || !cust) {
        results.push({ userId: user.id, workspaceId: newWorkspaceId, error: custError });
        continue;
      }
      // Update user workspace_id
      const { error: updError } = await supabaseAdmin
        .from('users')
        .update({ workspace_id: newWorkspaceId })
        .eq('id', user.id);
      if (updError) {
        results.push({ userId: user.id, workspaceId: newWorkspaceId, error: updError });
        continue;
      }
      results.push({ userId: user.id, workspaceId: newWorkspaceId, success: true });
    } catch (e: any) {
      results.push({ userId: user.id, error: e.message || e });
    }
  }

  return res.status(200).json({ results });
}
