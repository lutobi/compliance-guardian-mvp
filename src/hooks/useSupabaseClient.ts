import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

/**
 * Custom hook to provide a properly authenticated Supabase client
 * This ensures that all API calls have the correct authentication headers
 */
export function useSupabaseClient() {
  const [client, setClient] = useState<SupabaseClient<Database> | null>(null);
  
  useEffect(() => {
    // Create a new client with explicit URL and key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('Initializing Supabase client with:', { 
      url: supabaseUrl ? 'URL defined' : 'URL missing',
      key: supabaseKey ? 'Key defined' : 'Key missing'
    });
    
    const newClient = createClientComponentClient<Database>();
    setClient(newClient);
    
    // Log authentication state
    newClient.auth.getSession().then(({ data }) => {
      console.log('Supabase auth session:', data.session ? 'Active' : 'None');
    });
    
  }, []);
  
  return client;
}
