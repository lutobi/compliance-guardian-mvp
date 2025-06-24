import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

export interface SummaryResponse {
  score: number;
  compliant: number;
  nonCompliant: number;
  pending: number;
  total: number;
  [key: string]: any;
}

export function useAssessmentSummaryQuery(
  assessmentId: string
): UseQueryResult<SummaryResponse, Error> {
  return useQuery<SummaryResponse, Error>({
    queryKey: ['assessmentSummary', assessmentId],
    queryFn: async () => {
      const res = await fetch(`/api/report/summary?assessmentId=${assessmentId}`);
      const json = await res.json();
      if (!res.ok) {
        const message = json.error || 'Failed to fetch summary';
        const details = json.details ? ` - Details: ${JSON.stringify(json.details)}` : '';
        throw new Error(`${message}${details}`);
      }
      return json;
    },
    enabled: !!assessmentId,
  });
}
