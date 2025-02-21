'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rateLimitError, setRateLimitError] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rateLimitError) {
      toast.error('Please wait a few minutes before trying again.');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password);
      // Success message and redirect are handled in auth context
    } catch (error: any) {
      console.error('Signup error:', error);
      if (error.message?.toLowerCase().includes('rate limit')) {
        setRateLimitError(true);
        toast.error('Too many signup attempts. Please try again in a few minutes.');
        // Reset rate limit after 5 minutes
        setTimeout(() => setRateLimitError(false), 5 * 60 * 1000);
      } else if (error.message?.includes('already registered')) {
        toast.error('An account with this email already exists. Please sign in instead.');
      } else {
        toast.error(error.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Create Account</h2>
          <p className="mt-2 text-gray-600">Sign up for a new account</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="mt-1"
                disabled={loading || rateLimitError}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="mt-1"
                disabled={loading || rateLimitError}
                minLength={6}
              />
              <p className="mt-1 text-sm text-gray-500">
                Password must be at least 6 characters
              </p>
            </div>
          </div>

          {rateLimitError && (
            <div className="text-sm text-red-600">
              Too many signup attempts. Please wait a few minutes before trying again.
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || rateLimitError}
          >
            {loading ? 'Creating Account...' : rateLimitError ? 'Please wait...' : 'Sign Up'}
          </Button>

          <div className="text-center text-sm">
            <span className="text-gray-600">Already have an account?</span>{' '}
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
