import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { NotificationRule } from '@/types/notificationRule';

export class NotificationRulesService {
  private static supabase = createClientComponentClient();

  static async getRules(): Promise<NotificationRule[]> {
    const { data, error } = await this.supabase
      .from('notification_rules')
      .select('*');
    if (error) throw error;
    return data;
  }

  static async createRule(rule: Omit<NotificationRule, 'id' | 'workspace_id' | 'created_at' | 'updated_at'>): Promise<NotificationRule> {
    const { data, error } = await this.supabase
      .from('notification_rules')
      .insert(rule)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  static async updateRule(id: string, updates: Partial<Omit<NotificationRule, 'id' | 'workspace_id' | 'created_at' | 'updated_at'>>): Promise<NotificationRule> {
    const { data, error } = await this.supabase
      .from('notification_rules')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  static async deleteRule(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('notification_rules')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
}
