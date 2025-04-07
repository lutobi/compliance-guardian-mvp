import { SupabaseClient } from '@supabase/supabase-js';
import { Control, ControlHierarchy } from '@/types/control';

export class ControlService {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * Get all controls for a framework
   */
  async getFrameworkControls(frameworkId: string): Promise<Control[]> {
    const { data, error } = await this.supabase
      .from('controls')
      .select('*')
      .eq('framework_id', frameworkId)
      .order('slug');

    if (error) {
      throw new Error(`Error fetching controls: ${error.message}`);
    }

    return data;
  }

  /**
   * Get a control by its slug within a framework
   */
  async getControlBySlug(frameworkId: string, slug: string): Promise<Control | null> {
    const { data, error } = await this.supabase
      .from('controls')
      .select('*')
      .eq('framework_id', frameworkId)
      .eq('slug', slug)
      .single();

    if (error) {
      throw new Error(`Error fetching control: ${error.message}`);
    }

    return data;
  }

  /**
   * Get the full control hierarchy for a framework
   */
  async getControlHierarchy(frameworkId: string): Promise<ControlHierarchy[]> {
    const { data, error } = await this.supabase
      .from('control_hierarchy')
      .select('*')
      .eq('framework_id', frameworkId)
      .order('path');

    if (error) {
      throw new Error(`Error fetching control hierarchy: ${error.message}`);
    }

    // Convert flat hierarchy to tree
    const controlMap = new Map<string, ControlHierarchy>();
    const roots: ControlHierarchy[] = [];

    data.forEach(control => {
      controlMap.set(control.id, { ...control, children: [] });
    });

    controlMap.forEach(control => {
      if (control.parent_id) {
        const parent = controlMap.get(control.parent_id);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(control);
        }
      } else {
        roots.push(control);
      }
    });

    return roots;
  }

  /**
   * Update a control's status
   */
  async updateControlStatus(
    controlId: string,
    status: Control['status']
  ): Promise<void> {
    const { error } = await this.supabase
      .from('controls')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', controlId);

    if (error) {
      throw new Error(`Error updating control status: ${error.message}`);
    }
  }

  /**
   * Subscribe to control changes for a framework
   */
  subscribeToFrameworkControls(
    frameworkId: string,
    callback: (payload: { new: Control; old: Control | null }) => void
  ) {
    return this.supabase
      .channel('controls')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'controls',
          filter: `framework_id=eq.${frameworkId}`,
        },
        callback
      )
      .subscribe();
  }
}
