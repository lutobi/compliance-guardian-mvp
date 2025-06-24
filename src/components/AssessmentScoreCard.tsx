import React from 'react';

interface AssessmentScoreCardProps {
  score: number;
  compliant: number;
  nonCompliant: number;
  pending: number;
  total: number;
}

export function AssessmentScoreCard({ score, compliant, nonCompliant, pending, total }: AssessmentScoreCardProps) {
  let color = 'bg-gray-400';
  if (score >= 90) color = 'bg-green-500';
  else if (score >= 70) color = 'bg-yellow-400';
  else if (score > 0) color = 'bg-red-500';

  return (
    <div className="border rounded-lg p-6 shadow-md bg-white max-w-md mx-auto">
      <div className="flex items-center space-x-4">
        <div className={`rounded-full w-16 h-16 flex items-center justify-center text-sm leading-tight font-bold text-white ${color}`}>{score}%</div>
        <div>
          <div className="font-semibold text-lg">Compliance Score</div>
          <div className="text-gray-600 text-sm">{compliant} compliant / {nonCompliant} non-compliant / {pending} pending</div>
          <div className="text-gray-400 text-xs">{total} checks total</div>
        </div>
      </div>
    </div>
  );
}
