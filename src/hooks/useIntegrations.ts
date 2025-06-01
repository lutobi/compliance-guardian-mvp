'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IntegrationService } from '@/services/IntegrationService';
import type { Integration } from '@/types/integration';

export function useIntegrations() {
  const queryClient = useQueryClient();
  const { data: integrations = [], isLoading, isError, error } = useQuery<Integration[], Error>({
    queryKey: ['integrations'],
    queryFn: IntegrationService.getIntegrations,
    staleTime: 5 * 60 * 1000,
  });

  const createMutation = useMutation(IntegrationService.createIntegration, {
    onSuccess: () => queryClient.invalidateQueries(['integrations']),
  });

  const updateMutation = useMutation(
    ({ id, updates }: { id: string; updates: Partial<Omit<Integration, 'id' | 'workspace_id' | 'created_at' | 'updated_at'>> }) =>
      IntegrationService.updateIntegration(id, updates),
    { onSuccess: () => queryClient.invalidateQueries(['integrations']) }
  );

  const deleteMutation = useMutation(IntegrationService.deleteIntegration, {
    onSuccess: () => queryClient.invalidateQueries(['integrations']),
  });

  return {
    integrations,
    isLoading,
    isError,
    error,
    createIntegration: createMutation.mutateAsync,
    isCreating: createMutation.isLoading,
    updateIntegration: updateMutation.mutateAsync,
    isUpdating: updateMutation.isLoading,
    deleteIntegration: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isLoading,
  };
}
