'use client';
import React from 'react';
import { useAssessmentSummaryQuery } from '@/hooks/useAssessmentSummaryQuery';
import type { SummaryResponse } from '@/hooks/useAssessmentSummaryQuery';
import { AssessmentScoreCard } from '@/components/AssessmentScoreCard';

interface Props {
  assessmentId: string;
}

export function AssessmentSummaryCard({ assessmentId }: Props) {
  const { data, isLoading, isError, error, refetch } = useAssessmentSummaryQuery(assessmentId);

  if (!assessmentId) return null;
  if (isLoading) return <div>Loading summary...</div>;
  if (isError) return <div className="text-red-500">{error?.message}</div>;
  const summary = data as SummaryResponse;
  if (!summary) return null;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-fit">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Compliance Summary</h2>
        <button
          onClick={() => refetch()}
          className="text-sm text-blue-600 hover:underline"
        >
          Refresh
        </button>
      </div>
      <AssessmentScoreCard
        score={summary.score}
        compliant={summary.compliant}
        nonCompliant={summary.nonCompliant}
        pending={summary.pending}
        total={summary.total}
      />
    </div>
  );
}
