"use client";
import React, { useState, useEffect } from 'react';
import { useBilling } from '@/hooks/useBilling';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { SubscriptionPlan } from '@/types/billing';

export default function BillingSettingsPage() {
  const {
    subscription,
    isSubLoading,
    isSubError,
    subError,
    invoices,
    isInvLoading,
    isInvError,
    invError,
    updateSubscription,
    isUpdating,
  } = useBilling();

  const [plan, setPlan] = useState<SubscriptionPlan>(subscription?.subscription_plan ?? 'free');

  useEffect(() => {
    if (subscription) {
      setPlan(subscription.subscription_plan);
    }
  }, [subscription]);

  if (isSubLoading || isInvLoading) return <div>Loading billing data...</div>;
  if (isSubError) return <div>Error loading subscription: {subError?.message || 'Unknown error'}</div>;
  if (isInvError) return <div>Error loading invoices: {invError?.message || 'Unknown error'}</div>;

  const handleUpdate = async () => {
    try {
      await updateSubscription(plan);
      toast.success('Subscription updated');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Billing</h1>
      <div className="space-y-2">
        <h2 className="text-xl font-medium">Subscription Plan</h2>
        <div className="flex items-center space-x-2">
          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value as SubscriptionPlan)}
            className="border px-2 py-1 rounded"
          >
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
          <Button onClick={handleUpdate} disabled={isUpdating}>
            {isUpdating ? 'Updating...' : 'Update Plan'}
          </Button>
        </div>
        <div>Current status: {subscription?.status ?? 'No subscription'}</div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-medium">Invoices</h2>
        <table className="min-w-full table-auto border">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-2 py-1 border">Date</th>
              <th className="px-2 py-1 border">Amount</th>
              <th className="px-2 py-1 border">Status</th>
              <th className="px-2 py-1 border">Link</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td className="px-2 py-1 border">{new Date(inv.date).toLocaleDateString()}</td>
                <td className="px-2 py-1 border">${(inv.amount / 100).toFixed(2)}</td>
                <td className="px-2 py-1 border">{inv.status}</td>
                <td className="px-2 py-1 border">
                  <a href={inv.invoice_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
