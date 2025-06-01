export type SubscriptionPlan = 'free' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled';

export interface Subscription {
  workspace_id: string;
  subscription_plan: SubscriptionPlan;
  status: SubscriptionStatus;
  current_period_start?: string;
  current_period_end?: string;
}

export interface Invoice {
  id: string;
  workspace_id: string;
  invoice_url: string;
  date: string;
  amount: number;
  status: string;
}
