import { supabase } from '@/lib/supabase/client';
import type { TeamMember } from '@/types/team';

export class TeamService {
  private static supabase = supabase;

  static async getMembers(): Promise<TeamMember[]> {
    const { data, error } = await this.supabase
      .from('team_members')
      .select('*');
    if (error) throw error;
    return data;
  }

  static async inviteMember(member: Omit<TeamMember, 'id' | 'invited_at' | 'accepted_at' | 'status'>): Promise<TeamMember> {
    const { data, error } = await this.supabase
      .from('team_members')
      .insert(member)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  static async updateMember(id: string, updates: Partial<TeamMember>): Promise<TeamMember> {
    const { data, error } = await this.supabase
      .from('team_members')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  static async removeMember(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('team_members')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
}
