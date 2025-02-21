'use client';

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";
import Link from "next/link";

export default function VerifyEmailPage() {
  const [email, setEmail] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        router.push('/dashboard');
      }
    };

    getSession();
  }, [router, supabase.auth]);

  useEffect(() => {
    const lastEmail = localStorage.getItem('lastSignupEmail');
    if (lastEmail) {
      setEmail(lastEmail);
    }
  }, []);

  const handleResendEmail = async () => {
    if (!email) {
      toast.error('No email found. Please try signing up again.');
      return;
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) throw error;
      toast.success('Verification email resent! Please check your inbox.');
    } catch (error: any) {
      console.error('Error resending verification:', error);
      toast.error(error.message || 'Failed to resend verification email');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-xl shadow-lg text-center">
        <div>
          <h2 className="text-3xl font-bold">Check Your Email</h2>
          <p className="mt-4 text-gray-600">
            We've sent a verification link to{' '}
            <span className="font-medium text-gray-900">{email}</span>
          </p>
          <p className="mt-2 text-gray-600">
            Click the link in the email to verify your account.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleResendEmail}
            variant="outline"
            className="w-full"
          >
            Resend Verification Email
          </Button>

          <div className="text-sm text-gray-600">
            <p>
              Didn't receive the email? Check your spam folder or{' '}
              <Link href="/auth/signup" className="text-blue-600 hover:underline">
                try signing up again
              </Link>
            </p>
          </div>

          <div className="text-sm text-gray-600">
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
