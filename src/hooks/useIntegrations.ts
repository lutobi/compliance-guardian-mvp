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

  const createMutation = useMutation<Integration, Error, Omit<Integration, 'id' | 'workspace_id' | 'created_at' | 'updated_at'>>({
    mutationFn: IntegrationService.createIntegration,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['integrations'] }),
  });

  const updateMutation = useMutation<Integration, Error, { id: string; updates: Partial<Omit<Integration, 'id' | 'workspace_id' | 'created_at' | 'updated_at'>> }>({
    mutationFn: ({ id, updates }) => IntegrationService.updateIntegration(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['integrations'] }),
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: IntegrationService.deleteIntegration,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['integrations'] }),
  });

  return {
    integrations,
    isLoading,
    isError,
    error,
    createIntegration: createMutation.mutateAsync,
    isCreating: createMutation.status === 'pending',
    updateIntegration: updateMutation.mutateAsync,
    isUpdating: updateMutation.status === 'pending',
    deleteIntegration: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.status === 'pending',
  };
}
