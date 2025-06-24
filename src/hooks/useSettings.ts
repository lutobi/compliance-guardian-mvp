'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SettingsService } from '@/services/SettingsService';
import type { Settings } from '@/types/settings';

export function useSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading, isError, error } = useQuery<Settings | null, Error>({
    queryKey: ['settings'],
    queryFn: SettingsService.getSettings,
    staleTime: 5 * 60 * 1000,
  });

  const mutation = useMutation<Settings, Error, Partial<Settings>>({
    mutationFn: (newSettings) => SettingsService.upsertSettings(newSettings),
    onSuccess: (data) => {
      queryClient.setQueryData(['settings'], data);
    },
  });

  return {
    settings,
    isLoading,
    isError,
    error,
    updateSettings: async (newSettings: Partial<Settings>) => {
      if (!settings?.workspace_id) {
        throw new Error('Workspace ID is required');
      }
      return mutation.mutateAsync({ workspace_id: settings.workspace_id, ...newSettings });
    },
    isUpdating: mutation.status === 'pending',
    updateError: mutation.error,
  };
}
