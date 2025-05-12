'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth/context';
import { useCustomerWorkspace } from '@/lib/workspace/customer-context';

export default function NewWorkspacePage() {
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [loading, setLoading] = useState(false);
  const { refreshWorkspaces } = useCustomerWorkspace();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error('Name is required');
      return;
    }
    setLoading(true);
    try {
      const { data: workspace, error: wsErr } = await supabase
        .from('workspaces')
        .insert({ name, type: 'customer', settings: {} })
        .select('id')
        .single();
      if (wsErr || !workspace) throw wsErr || new Error('Workspace creation failed');

      const { data: customer, error: custErr } = await supabase
        .from('customers')
        .insert({ name, workspace_id: workspace.id, industry, settings: {} })
        .select('id')
        .single();
      if (custErr || !customer) throw custErr || new Error('Customer creation failed');

      // Impersonate new workspace by updating current user's workspace_id
      if (!user) throw new Error('No user');
      await supabase.from('users').update({ workspace_id: workspace.id }).eq('id', user.id);
      await refreshWorkspaces();
      toast.success('Workspace created and impersonated');
      router.push('/customer/dashboard');
    } catch (err) {
      const e = err as Error;
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-lg">
      <h1 className="text-2xl font-bold mb-4">Create Customer Workspace</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label htmlFor="industry" className="block text-sm font-medium mb-1">Industry (optional)</label>
          <input
            id="industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div className="flex space-x-4">
          <Link href="/system/dashboard">
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              disabled={loading}
            >
              Cancel
            </button>
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}
