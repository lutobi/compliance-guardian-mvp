import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EvidenceService } from '@/services/evidence';
import type { Evidence } from '@/types/evidence';

export function useAssessmentEvidenceQuery(assessmentId: string) {
  const service = new EvidenceService();
  const queryClient = useQueryClient();

  const query = useQuery<Evidence[], Error>({
    queryKey: ['assessmentEvidence', assessmentId],
    queryFn: async () => {
      const res = await fetch(`/api/evidence?assessmentId=${assessmentId}`);
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to fetch evidence');
      return result.data as Evidence[];
    },
    enabled: !!assessmentId,
  });

  const addEvidence = useMutation<Evidence, Error, Partial<Evidence>>({
    mutationFn: (payload) =>
      service.addEvidence(payload).then((res) => {
        if (!res.success || !res.data) throw new Error(res.error?.message || 'Add evidence failed');
        return res.data;
      }),
    onSuccess: (data) => {
      queryClient.setQueryData<Evidence[]>(['assessmentEvidence', assessmentId], (old = []) => [data, ...old]);
    },
  });

  const updateEvidence = useMutation<Evidence, Error, { id: string; updates: Partial<Evidence> }>({
    mutationFn: ({ id, updates }) =>
      service.updateEvidence(id, updates).then((res) => {
        if (!res.success || !res.data) throw new Error(res.error?.message || 'Update evidence failed');
        return res.data;
      }),
    onSuccess: (data) => {
      queryClient.setQueryData<Evidence[]>(['assessmentEvidence', assessmentId], (old = []) =>
        old.map((e) => (e.id === data.id ? data : e))
      );
    },
  });

  const deleteEvidence = useMutation<void, Error, string>({
    mutationFn: (id) =>
      service.deleteEvidence(id).then((res) => {
        if (!res.success) throw new Error(res.error?.message || 'Delete evidence failed');
      }),
    onSuccess: (_, id) => {
      queryClient.setQueryData<Evidence[]>(['assessmentEvidence', assessmentId], (old = []) =>
        old.filter((e) => e.id !== id)
      );
    },
  });

  return {
    evidence: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    addEvidence,
    updateEvidence,
    deleteEvidence,
  };
}
