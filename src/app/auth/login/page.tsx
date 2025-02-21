'use client';

import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const urlError = searchParams?.get('error');
    if (urlError) {
      setError(decodeURIComponent(urlError));
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDebugInfo(null);
    setLoading(true);

    try {
      setDebugInfo('Attempting to sign in...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setDebugInfo(`Auth error: ${error.message}`);
        throw error;
      }

      if (data.session) {
        setDebugInfo('Session created, refreshing...');
        router.refresh(); // This forces a router refresh to update auth state
        
        // Add a small delay to ensure the session is properly set
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setDebugInfo('Redirecting to dashboard...');
        router.push('/dashboard');
      } else {
        setDebugInfo('No session data received');
        throw new Error('No session data received');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-sm space-y-4 bg-white p-8 rounded-lg shadow-lg">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-center text-gray-900">Welcome back</h1>
          <p className="text-sm text-center text-gray-600">Sign in to your account</p>
        </div>

        {error && (
          <div className="p-3 rounded bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {debugInfo && (
          <div className="p-3 rounded bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-600">{debugInfo}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm text-black placeholder-gray-400
                focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm text-black placeholder-gray-400
                focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
              bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
