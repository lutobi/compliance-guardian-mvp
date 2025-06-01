import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Settings } from '@/types/settings';

const supabase = createClientComponentClient();

export class SettingsService {
  /** Fetch the current settings (single row) */
  static async getSettings(): Promise<Settings | null> {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  /** Upsert settings row */
  static async upsertSettings(settings: Partial<Settings>): Promise<Settings> {
    const { data, error } = await supabase
      .from('settings')
      .upsert(settings, { onConflict: 'workspace_id' })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }
}
