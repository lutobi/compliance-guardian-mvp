'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export function useSupabase() {
  const supabase = createClientComponentClient();
  return { supabase };
}
