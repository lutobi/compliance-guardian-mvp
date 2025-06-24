import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

export interface NarrativeResponse {
  narrative: string;
}

export function useAssessmentNarrativeQuery(
  assessmentId: string
): UseQueryResult<NarrativeResponse, Error> {
  return useQuery<NarrativeResponse, Error>({
    queryKey: ['assessmentNarrative', assessmentId],
    queryFn: async () => {
      const res = await fetch(
        `/api/report/narrative?assessmentId=${assessmentId}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch narrative');
      return json;
    },
    enabled: !!assessmentId,
    staleTime: 1000 * 60 * 5,
  });
}
