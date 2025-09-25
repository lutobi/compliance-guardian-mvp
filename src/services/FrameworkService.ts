import { supabase } from '@/lib/supabase/client';
import type { Framework, FrameworkUpdateLog } from '@/types/framework';
import { frameworks as staticFrameworks, frameworkData } from '@/data/frameworks';

export class FrameworkService {
  private static supabase = supabase;

  static async getFrameworks(): Promise<Framework[]> {
    try {
      const { data, error } = await this.supabase
        .from('frameworks')
        .select('*, controls(*)');
      if (error) throw error;
      if (Array.isArray(data) && data.length > 0) {
        return data as Framework[];
      }
      // Fallback to static when DB is empty
      return staticFrameworks.map(sf => ({
        id: sf.id,
        name: sf.name,
        description: sf.description,
        version: sf.version,
        controls: (frameworkData as any)[sf.id]?.controls || [],
        last_synced_at: new Date().toISOString(),
      })) as Framework[];
    } catch (e) {
      // On any error, return static dataset
      return staticFrameworks.map(sf => ({
        id: sf.id,
        name: sf.name,
        description: sf.description,
        version: sf.version,
        controls: (frameworkData as any)[sf.id]?.controls || [],
        last_synced_at: new Date().toISOString(),
      })) as Framework[];
    }
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
