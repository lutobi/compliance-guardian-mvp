import { supabase } from '@/lib/supabase/client';
import type { Framework, FrameworkUpdateLog } from '@/types/framework';

export class FrameworkService {
  private static supabase = supabase;

  static async getFrameworks(): Promise<Framework[]> {
    const { data, error } = await this.supabase
      .from('frameworks')
      .select('*, controls(*)');
    if (error) throw error;
    return data as Framework[];
  }

  static async getUpdateLogs(frameworkId: string): Promise<FrameworkUpdateLog[]> {
    const { data, error } = await this.supabase
      .from('framework_update_logs')
      .select('*')
      .eq('framework_id', frameworkId)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data as FrameworkUpdateLog[];
  }
}
