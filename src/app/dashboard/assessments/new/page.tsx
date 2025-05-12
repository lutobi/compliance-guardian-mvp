'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import type { Database } from "@/lib/database.types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCustomerWorkspace } from "@/lib/workspace/customer-context";

type Framework = Database['public']['Tables']['frameworks']['Row'];

export default function NewAssessmentPage() {
  const { workspace, loading: workspaceLoading } = useCustomerWorkspace();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    framework_id: ''
  });

  useEffect(() => {
    loadFrameworks();
  }, []);

  const loadFrameworks = async () => {
    try {
      const data = await api.frameworks.list();
      setFrameworks(data);
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, framework_id: data[0].id }));
      }
    } catch (error) {
      const e = error as Error;
      toast.error(e.message || 'Failed to load frameworks');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!workspace) {
      toast.error("Workspace not selected");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      await api.assessments.create({
        name: formData.name,
        framework_id: formData.framework_id,
        created_by: user.id,
        status: 'planned',
        workspace_id: workspace.id
      });
      toast.success('Assessment created successfully');
      router.push('/dashboard/assessments');
    } catch (error) {
      const e = error as Error;
      toast.error(e.message || 'Failed to create assessment');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">New Assessment</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="mb-2 block text-sm font-medium">
            Title
          </label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="framework_id" className="mb-2 block text-sm font-medium">
            Framework
          </label>
          <select
            id="framework_id"
            name="framework_id"
            value={formData.framework_id}
            onChange={handleChange}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            required
          >
            {frameworks.map(framework => (
              <option key={framework.id} value={framework.id}>
                {framework.name} (v{framework.version})
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Assessment'}
          </Button>
        </div>
      </form>
    </div>
  );
}
