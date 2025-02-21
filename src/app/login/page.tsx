'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { AuthService } from '@/services/AuthService';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const auth = AuthService.getInstance();
      const { data, error: signInError } = await auth.signInWithEmail(email, password);
      
      if (signInError) {
        throw signInError;
      }

      if (!data.session) {
        throw new Error('Failed to create session');
      }

      // Redirect to returnUrl or dashboard
      router.push(returnUrl || '/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        // Handle rate limit errors specifically
        if (error.message.includes('rate limit') || error.message.includes('too many')) {
          setError('Too many login attempts. Please wait a minute and try again.');
        } else if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password');
        } else {
          setError(error.message);
        }
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  // Clear error when inputs change
  useEffect(() => {
    setError(null);
  }, [email, password]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to Compliance Guardian</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="w-full"
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="w-full"
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <a
              href="/forgot-password"
              className="text-blue-600 hover:text-blue-500"
            >
              Forgot password?
            </a>
            <a
              href="/signup"
              className="text-blue-600 hover:text-blue-500"
            >
              Create account
            </a>
          </div>

          <Button
            type="submit"
            className="w-full py-2"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
