'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TeamService } from '@/services/TeamService';
import type { TeamMember } from '@/types/team';

export function useTeam() {
  const queryClient = useQueryClient();

  const { data: members = [], isLoading, isError, error } = useQuery<TeamMember[], Error>({
    queryKey: ['team'],
    queryFn: () => TeamService.getMembers(),
    staleTime: 5 * 60 * 1000,
  });

  const inviteMutation = useMutation<TeamMember, Error, Omit<TeamMember, 'id' | 'invited_at' | 'accepted_at' | 'status'>>({
    mutationFn: (member) => TeamService.inviteMember(member),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team'] }),
  });

  const updateMutation = useMutation<TeamMember, Error, { id: string; updates: Partial<TeamMember> }>({
    mutationFn: ({ id, updates }) => TeamService.updateMember(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team'] }),
  });

  const removeMutation = useMutation<void, Error, string>({
    mutationFn: (id) => TeamService.removeMember(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team'] }),
  });

  return {
    members,
    isLoading,
    isError,
    error,
    inviteMember: inviteMutation.mutateAsync,
    isInviting: inviteMutation.isLoading,
    updateMember: updateMutation.mutateAsync,
    isUpdating: updateMutation.isLoading,
    removeMember: removeMutation.mutateAsync,
    isRemoving: removeMutation.isLoading,
  };
}
