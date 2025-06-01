import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Integration } from '@/types/integration';

export class IntegrationService {
  private static supabase = createClientComponentClient();

  static async getIntegrations(): Promise<Integration[]> {
    const { data, error } = await this.supabase
      .from('integrations')
      .select('*');
    if (error) throw error;
    return data;
  }

  static async createIntegration(integration: Omit<Integration, 'id' | 'workspace_id' | 'created_at' | 'updated_at'>): Promise<Integration> {
    const { data, error } = await this.supabase
      .from('integrations')
      .insert(integration)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  static async updateIntegration(
    id: string,
    updates: Partial<Omit<Integration, 'id' | 'workspace_id' | 'created_at' | 'updated_at'>>
  ): Promise<Integration> {
    const { data, error } = await this.supabase
      .from('integrations')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  static async deleteIntegration(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('integrations')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
}
