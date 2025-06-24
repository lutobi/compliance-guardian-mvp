import { supabase } from '@/lib/supabase/client';
import type { Subscription, Invoice } from '@/types/billing';

export class BillingService {
  static async getSubscription(): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  static async updateSubscription(plan: Subscription['subscription_plan']): Promise<Subscription> {
    const { data, error } = await supabase
      .from('subscriptions')
      .upsert({ subscription_plan: plan }, { onConflict: 'workspace_id' })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  static async getInvoices(): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    return data;
  }
}
