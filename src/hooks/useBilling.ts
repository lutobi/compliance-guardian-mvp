'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BillingService } from '@/services/BillingService';
import type { Subscription, Invoice } from '@/types/billing';

export function useBilling() {
  const queryClient = useQueryClient();

  const { data: subscription, isLoading: isSubLoading, isError: isSubError, error: subError } = useQuery<Subscription | null, Error>({
    queryKey: ['subscription'],
    queryFn: BillingService.getSubscription,
  });

  const { data: invoices = [], isLoading: isInvLoading, isError: isInvError, error: invError } = useQuery<Invoice[], Error>({
    queryKey: ['invoices'],
    queryFn: BillingService.getInvoices,
  });

  const updateSubMutation = useMutation(BillingService.updateSubscription, {
    onSuccess: () => queryClient.invalidateQueries(['subscription']),
  });

  return {
    subscription,
    isSubLoading,
    isSubError,
    subError,
    invoices,
    isInvLoading,
    isInvError,
    invError,
    updateSubscription: updateSubMutation.mutateAsync,
    isUpdating: updateSubMutation.isLoading,
  };
}
