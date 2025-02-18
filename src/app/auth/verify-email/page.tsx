'use client';

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Link from "next/link";
import { useState } from "react";

export default function VerifyEmailPage() {
  const [resending, setResending] = useState(false);

  const handleResendEmail = async () => {
    try {
      setResending(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        throw new Error('No email found. Please try signing up again.');
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      toast.success('Verification email resent. Please check your inbox.');
    } catch (error) {
      const e = error as Error;
      toast.error(e.message || 'Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-auto max-w-sm space-y-6 p-4">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Check Your Email</h1>
          <p className="text-gray-500 dark:text-gray-400">
            We&apos;ve sent you a verification link. Please check your email to verify your account.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            If you don&apos;t see the email, check your spam folder or click below to resend.
          </p>
        </div>
        <div className="space-y-4">
          <Button 
            onClick={handleResendEmail} 
            disabled={resending} 
            className="w-full"
          >
            {resending ? 'Resending...' : 'Resend Verification Email'}
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/auth/login">Return to Login</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
