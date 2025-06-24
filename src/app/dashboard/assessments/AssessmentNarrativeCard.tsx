'use client';
import React from 'react';
import { useAssessmentNarrativeQuery } from '@/hooks/useAssessmentNarrativeQuery';

interface Props {
  assessmentId: string;
}

export function AssessmentNarrativeCard({ assessmentId }: Props) {
  const { data, isLoading, isError, error, refetch } = useAssessmentNarrativeQuery(assessmentId);

  if (!assessmentId) return null;
  if (isLoading) return <div>Generating narrative...</div>;
  if (isError)
    return (
      <div className="text-red-500">
        Failed to load narrative.
        <button onClick={() => refetch()} className="ml-2 text-sm text-blue-600 hover:underline">
          Retry
        </button>
      </div>
    );

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-2">Assessment Narrative</h2>
      <p className="text-sm text-gray-700">{data?.narrative}</p>
    </div>
  );
}
