'use client';

import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { Database } from "@/lib/database.types";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type AssessmentWithFramework = Database['public']['Tables']['assessments']['Row'] & {
  frameworks: {
    name: string;
  };
};

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<AssessmentWithFramework[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      const data = await api.assessments.list();
      setAssessments(data);
    } catch (error) {
      const e = error as Error;
      toast.error(e.message || 'Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <p className="mt-2 text-sm text-gray-500">Loading assessments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Assessments</h1>
        <Link href="/dashboard/assessments/new">
          <Button>New Assessment</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {assessments.map((assessment) => (
          <Link
            key={assessment.id}
            href={`/dashboard/assessments/${assessment.id}`}
            className="block rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <div className="mb-2 flex items-start justify-between">
              <h2 className="font-semibold">{assessment.title}</h2>
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                  assessment.status
                )}`}
              >
                {assessment.status.replace('_', ' ')}
              </span>
            </div>
            <p className="mb-2 text-sm text-gray-600">
              {assessment.description || 'No description'}
            </p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{assessment.frameworks.name}</span>
              <span>
                {assessment.due_date
                  ? new Date(assessment.due_date).toLocaleDateString()
                  : 'No due date'}
              </span>
            </div>
          </Link>
        ))}

        {assessments.length === 0 && (
          <div className="col-span-full rounded-lg border border-dashed p-8 text-center">
            <h3 className="mb-2 text-lg font-medium">No assessments yet</h3>
            <p className="mb-4 text-sm text-gray-500">
              Create your first assessment to start tracking your compliance
              progress.
            </p>
            <Link href="/dashboard/assessments/new">
              <Button>Create Assessment</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
