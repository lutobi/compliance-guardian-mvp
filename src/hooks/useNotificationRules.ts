'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationRulesService } from '@/services/NotificationRulesService';
import type { NotificationRule } from '@/types/notificationRule';

export function useNotificationRules() {
  const queryClient = useQueryClient();

  const { data: rules = [], isLoading, isError, error } = useQuery<NotificationRule[], Error>({
    queryKey: ['notificationRules'],
    queryFn: NotificationRulesService.getRules,
    staleTime: 5 * 60 * 1000,
  });

  const createMutation = useMutation(NotificationRulesService.createRule, {
    onSuccess: () => queryClient.invalidateQueries(['notificationRules']),
  });

  const updateMutation = useMutation(
    ({ id, updates }: { id: string; updates: Partial<NotificationRule> }) =>
      NotificationRulesService.updateRule(id, updates),
    { onSuccess: () => queryClient.invalidateQueries(['notificationRules']) }
  );

  const deleteMutation = useMutation(NotificationRulesService.deleteRule, {
    onSuccess: () => queryClient.invalidateQueries(['notificationRules']),
  });

  return {
    rules,
    isLoading,
    isError,
    error,
    createRule: createMutation.mutateAsync,
    isCreating: createMutation.isLoading,
    updateRule: updateMutation.mutateAsync,
    isUpdating: updateMutation.isLoading,
    deleteRule: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isLoading,
  };
}
