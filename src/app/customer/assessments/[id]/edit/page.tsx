'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useCustomerWorkspace } from '@/lib/workspace/customer-context';

export default function CustomerEditAssessment() {
  const { id } = useParams();
  const router = useRouter();
  const { workspace, loading: wkLoading } = useCustomerWorkspace();
  const [loading, setLoading] = useState(false);
  const [frameworks, setFrameworks] = useState<{ id: string; name: string }[]>([]);
  const [formData, setFormData] = useState({ name: '', framework_id: '' });

  useEffect(() => {
    if (!wkLoading && workspace && id) {
      loadFrameworks();
      loadAssessment();
    }
  }, [workspace, wkLoading, id]);

  const loadFrameworks = async () => {
    try {
      const data = await api.frameworks.list();
      setFrameworks(data);
    } catch (e) {
      toast.error((e as Error).message || 'Failed to load frameworks');
    }
  };

  const loadAssessment = async () => {
    try {
      const data = await api.assessments.get(id as string);
      setFormData({ name: data.name || '', framework_id: data.framework_id || '' });
    } catch (e) {
      toast.error((e as Error).message || 'Failed to load assessment');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace || !id) return;
    setLoading(true);
    try {
      await api.assessments.update(id as string, { name: formData.name, framework_id: formData.framework_id });
      toast.success('Assessment updated successfully');
      router.push('/customer/assessments');
    } catch (e) {
      toast.error((e as Error).message || 'Failed to update assessment');
    } finally {
      setLoading(false);
    }
  };

  if (wkLoading) return <div>Loading…</div>;

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Edit Assessment</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <Input name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Framework</label>
          <select name="framework_id" value={formData.framework_id} onChange={handleChange}
            className="w-full border rounded p-2" required>
            {frameworks.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>
        <Button type="submit" disabled={loading} className="mt-4">{loading ? 'Saving…' : 'Save Changes'}</Button>
      </form>
    </div>
  );
}
