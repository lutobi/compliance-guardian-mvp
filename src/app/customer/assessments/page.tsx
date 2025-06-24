'use client';

import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner";
import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
import { useCustomerWorkspace } from "@/lib/workspace/customer-context";

type AssessmentWithFramework = { id: string; name: string; status: string; framework: { id: string; name: string; controls: any[] } };

export default function CustomerAssessmentsPage() {
  const { workspace, loading: workspaceLoading } = useCustomerWorkspace();
  const workspaceId = workspace?.id!;
  console.log('[AssessmentsPage] workspace →', workspace);
  const queryClient = useQueryClient();
  const {
    data: rawData,
    isLoading: loading,
  } = useQuery<AssessmentWithFramework[], Error>({
    queryKey: ['assessments', workspaceId],
    queryFn: () => api.assessments.list(workspaceId) as Promise<AssessmentWithFramework[]>,
    enabled: !!workspace,
  });
  const assessments = (rawData ?? []).map(a => ({
    ...a,
    framework: a.framework || { id: '', name: 'Unknown', controls: [] },
  }));
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.assessments.delete(id);
    },
    onSuccess: () => {
      toast.success('Assessment deleted');
      queryClient.invalidateQueries({ queryKey: ['assessments', workspaceId] });
    },
    onError: (e) => {
      toast.error(e.message || 'Failed to delete assessment');
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-2 text-sm text-gray-500">Loading assessments...</p>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Assessments</h1>
        <Link href="/customer/assessments/new">
          <Button>New Assessment</Button>
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {assessments.map(a => (
          <div key={a.id} className="group rounded-lg border p-4">
            <Link href={`/customer/assessments/${a.id}`} className="block transition-colors hover:bg-gray-50">
              <div className="mb-2 flex items-start justify-between">
                <h2 className="font-semibold">{a.name}</h2>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(a.status)}`}>{a.status.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{a.framework.name}</span>
              </div>
            </Link>
            <div className="mt-2 flex space-x-2">
              <Link href={`/customer/assessments/${a.id}/edit`}>
                <Button variant="outline" size="sm"><PencilIcon className="h-4 w-4 mr-1"/>Edit</Button>
              </Link>
              <Button variant="destructive" size="sm" onClick={() => { if (confirm('Are you sure you want to delete this assessment?')) { deleteMutation.mutate(a.id); } }}><TrashIcon className="h-4 w-4 mr-1"/>Delete</Button>
            </div>
          </div>
        ))}
        {assessments.length === 0 && (
          <div className="col-span-full rounded-lg border border-dashed p-8 text-center">
            <h3 className="mb-2 text-lg font-medium">No assessments yet</h3>
            <p className="mb-4 text-sm text-gray-500">Create your first assessment to start tracking your compliance progress.</p>
            <Link href="/customer/assessments/new"><Button>Create Assessment</Button></Link>
          </div>
        )}
      </div>
    </div>
  );
}
