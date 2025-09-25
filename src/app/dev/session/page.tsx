"use client";

import { useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export default function DevSessionPage() {
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [detected, setDetected] = useState<any>(null);

  const detectLocalSession = () => {
    try {
      const key = Object.keys(localStorage || {}).find(k => /^sb-.*-auth-token$/.test(k));
      const raw = key ? localStorage.getItem(key) : null;
      if (!raw) return { key: null, session: null };
      let parsed: any;
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = null;
      }
      let session: any = null;
      // Possible shapes:
      // 1) Plain session object
      if (parsed?.access_token && parsed?.refresh_token) session = parsed;
      // 2) Wrapper { currentSession: {...} }
      if (!session && parsed?.currentSession?.access_token && parsed?.currentSession?.refresh_token) session = parsed.currentSession;
      // 3) Array [session, ...]
      if (!session && Array.isArray(parsed) && parsed[0]?.access_token && parsed[0]?.refresh_token) session = parsed[0];
      // 4) Supabase v2 may store { data: { session } }
      if (!session && parsed?.data?.session?.access_token && parsed?.data?.session?.refresh_token) session = parsed.data.session;

      return { key, session, raw, parsedSnippet: parsed ? Object.keys(parsed).slice(0, 5) : null };
    } catch (e) {
      return { key: null, session: null };
    }
  };

  const signInTestUser = async () => {
    try {
      setStatus("Signing in test user...");
      setError("");
      const email = process.env.NEXT_PUBLIC_TEST_USER_EMAIL || "test@example.com";
      const password = process.env.NEXT_PUBLIC_TEST_USER_PASSWORD || "testpassword123";

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setStatus(`Signed in as ${data.user?.email}`);
    } catch (e: any) {
      setError(e?.message || String(e));
    }
  };

  const syncCookies = async () => {
    try {
      setStatus("Syncing auth cookies...");
      setError("");
      let { data: { session } } = await supabase.auth.getSession();

      // Fallback: try to read session from localStorage if using a different client that stores there
      if (!session && typeof window !== 'undefined') {
        const detected = detectLocalSession();
        setDetected({ key: detected.key, hasSession: !!detected.session, parsedSnippet: detected.parsedSnippet });
        if (detected.session) {
          console.log('[dev/session] Using session from localStorage key:', detected.key);
          session = detected.session;
        }
      }

      if (!session) {
        setError("No Supabase session found in this tab. Sign in first (via login UI or the button above).");
        setStatus("");
        return;
      }

      // Prefer dev-only direct sync endpoint to set HttpOnly cookies using tokens
      let ok = false;
      try {
        const res = await fetch('/api/auth/dev-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ access_token: (session as any).access_token, refresh_token: (session as any).refresh_token })
        });
        ok = res.ok;
      } catch (_) {
        ok = false;
      }

      // Fallback to standard callback if dev-sync is unavailable
      if (!ok) {
        const res = await fetch('/api/auth/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ event: 'SIGNED_IN', session })
        });
        if (!res.ok) throw new Error(`auth/callback failed: ${res.status}`);
      }

      await new Promise(r => setTimeout(r, 600));
      setStatus("Cookies synced. You can now run onboarding and create workspace.");
    } catch (e: any) {
      setError(e?.message || String(e));
    }
  };

  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Not available</h1>
        <p>This page is only available in development.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Dev Session Utilities</h1>
        <p className="text-sm text-gray-600">Use these helpers to establish a local session and sync HttpOnly cookies.</p>

        <div className="space-y-2">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={signInTestUser}
            data-testid="dev-signin-test-user"
          >
            Sign in test user
          </button>
          <p className="text-xs text-gray-500">Uses NEXT_PUBLIC_TEST_USER_EMAIL/NEXT_PUBLIC_TEST_USER_PASSWORD or defaults to test@example.com/testpassword123</p>
        </div>

        <div className="space-y-2">
          <button
            className="px-4 py-2 bg-green-600 text-white rounded"
            onClick={syncCookies}
            data-testid="dev-sync-cookies"
          >
            Sync auth cookies
          </button>
          <p className="text-xs text-gray-500">Prefers /api/auth/dev-sync (direct token cookies) with fallback to /api/auth/callback, then waits for propagation.</p>
        </div>

        {status && <div className="p-3 bg-blue-50 text-blue-700 rounded">{status}</div>}
        {error && <div className="p-3 bg-red-50 text-red-700 rounded">{error}</div>}
        {detected && (
          <pre className="p-3 bg-gray-100 text-xs rounded overflow-auto">{JSON.stringify(detected, null, 2)}</pre>
        )}

        <div className="pt-4 text-sm text-gray-600">
          <p>After syncing cookies, return to onboarding and click “Go to Dashboard”.</p>
          <p>If workspace creation still fails, reload the app and try again.</p>
        </div>
      </div>
    </div>
  );
}
