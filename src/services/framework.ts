import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Framework, FrameworkData } from '@/types/framework';
import { Database } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

export class FrameworkService {
  private supabase = supabase;

  async getFrameworkBySlug(slug: string): Promise<Framework | null> {
    const { data, error } = await this.supabase
      .from('frameworks')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching framework:', error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      slug: data.slug,
      data: {
        name: data.name,
        version: data.version || '',
        description: data.description || '',
        categories: data.categories || [],
      }
    };
  }

  async listFrameworks(): Promise<Framework[]> {
    const { data, error } = await this.supabase
      .from('frameworks')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error listing frameworks:', error);
      return [];
    }

    return data.map(framework => ({
      id: framework.id,
      slug: framework.slug,
      data: {
        name: framework.name,
        version: framework.version || '',
        description: framework.description || '',
        categories: framework.categories || []
      }
    }));
  }
}
