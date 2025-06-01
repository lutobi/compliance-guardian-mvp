import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Subscription, Invoice } from '@/types/billing';

export class BillingService {
  private static supabase = createClientComponentClient();

  static async getSubscription(): Promise<Subscription | null> {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  static async updateSubscription(plan: Subscription['subscription_plan']): Promise<Subscription> {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .upsert({ subscription_plan: plan }, { onConflict: 'workspace_id' })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  static async getInvoices(): Promise<Invoice[]> {
    const { data, error } = await this.supabase
      .from('invoices')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    return data;
  }
}
