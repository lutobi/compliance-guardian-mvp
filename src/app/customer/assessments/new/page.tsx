'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCustomerWorkspace } from "@/lib/workspace/customer-context";
import { useAuth } from "@/lib/auth/context";

type Framework = { id: string; name: string; version: string };

export default function CustomerNewAssessment() {
  const { user } = useAuth();
  const { workspace, loading: wkLoading } = useCustomerWorkspace();
  console.log('[NewAssessmentPage] workspace →', workspace);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem('newAssessmentFormData');
      return saved ? JSON.parse(saved) : { name: '', framework_id: '' };
    } catch {
      return { name: '', framework_id: '' };
    }
  });

  useEffect(() => { loadFrameworks(); }, []);
  const loadFrameworks = async () => {
    try {
      const data = await api.frameworks.list();
      setFrameworks(data);
      if (data.length) setFormData(prev => ({ ...prev, framework_id: data[0].id }));
    } catch (e) { toast.error((e as Error).message || 'Failed to load frameworks'); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      try { localStorage.setItem('newAssessmentFormData', JSON.stringify(newData)); } catch {}
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace) { toast.error('Workspace not selected'); return; }
    setLoading(true);
      console.log('[NewAssessmentPage] create payload →', { name: formData.name, framework_id: formData.framework_id, created_by: user?.id, workspace_id: workspace?.id });
    try {
      if (!user) throw new Error('No user');
      await api.assessments.create({
        name: formData.name,
        framework_id: formData.framework_id,
        created_by: user.id,
        status: 'planned',
        workspace_id: workspace.id
      });
      toast.success('Assessment created successfully');
      try { localStorage.removeItem('newAssessmentFormData'); } catch {}
      await router.push('/customer/assessments');
        
    } catch (e) { toast.error((e as Error).message || 'Failed to create assessment'); }
    finally { setLoading(false); }
  };

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">New Assessment</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium">Title</label>
          <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="framework_id" className="mb-2 block text-sm font-medium">Framework</label>
          <select id="framework_id" name="framework_id" value={formData.framework_id} onChange={handleChange}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none"
            required>
            {frameworks.map(f => <option key={f.id} value={f.id}>{f.name} (v{f.version})</option>)}
          </select>
        </div>
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Assessment'}</Button>
        </div>
      </form>
    </div>
  );
}
