'use server';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { MonitoringStatus } from '@/types/monitoring';

/**
 * Update the status of a monitoring point
 * 
 * @param id Monitoring point ID
 * @param status New status
 * @returns Success boolean
 */
export async function updateMonitoringPointStatusAction(id: string, status: MonitoringStatus) {
  const cookieStore = cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.delete({ name, ...options });
        },
      },
    }
  );

  try {
    const { error } = await supabase
      .from('monitoring_points')
      .update({ status })
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating monitoring point status:', error);
    return false;
  }
}

/**
 * Delete a monitoring point
 * 
 * @param id Monitoring point ID
 * @returns Success boolean
 */
export async function deleteMonitoringPointAction(id: string) {
  const cookieStore = cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.delete({ name, ...options });
        },
      },
    }
  );

  try {
    const { error } = await supabase
      .from('monitoring_points')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting monitoring point:', error);
    return false;
  }
}
