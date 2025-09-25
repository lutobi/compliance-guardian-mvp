"use client";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

export const supabase = createClientComponentClient<Database>();

// One-time auth listener to keep server HttpOnly cookies in sync.
// This removes the need for manual /dev/session cookie sync in normal flows.
declare global {
  interface Window { __sb_cookie_sync_registered?: boolean }
}

if (typeof window !== 'undefined' && !window.__sb_cookie_sync_registered) {
  window.__sb_cookie_sync_registered = true;
  try {
    supabase.auth.onAuthStateChange((event, session) => {
      // Sync cookies for all meaningful auth events
      const shouldSync = event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION' || event === 'SIGNED_OUT';
      if (!shouldSync) return;
      // Fire and forget; server route will set/clear cookies accordingly
      fetch('/api/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ event, session }),
      }).catch(() => {/* noop */});
    });
  } catch {
    // no-op in non-browser/hydration edge cases
  }
}
