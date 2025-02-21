'use client';

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { toast } from "sonner";

export default function DashboardPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (!user) {
      toast.error('Please sign in to access the dashboard');
      router.push('/auth/login');
    }
  }, [user, router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      const e = error as Error;
      toast.error(e.message || 'Failed to sign out');
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <p className="mt-2 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 md:pt-0">
      <header className="fixed top-0 left-0 right-0 z-10 bg-white p-4 md:p-6 shadow-md">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user.email}</span>
            <Button onClick={handleSignOut} variant="outline" size="sm">
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      <main className="p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome back!</h1>
          <p className="text-gray-500">
            {user.email}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link 
            href="/frameworks" 
            className="block rounded-lg border p-4 hover:border-blue-500 hover:shadow-lg transition-all"
          >
            <h2 className="text-lg font-semibold">Frameworks</h2>
            <p className="text-sm text-gray-500">Browse compliance frameworks</p>
          </Link>

          <Link 
            href="/compare" 
            className="block rounded-lg border p-4 hover:border-blue-500 hover:shadow-lg transition-all"
          >
            <h2 className="text-lg font-semibold">Compare</h2>
            <p className="text-sm text-gray-500">Compare different frameworks</p>
          </Link>

          <Link 
            href="/monitoring" 
            className="block rounded-lg border p-4 hover:border-blue-500 hover:shadow-lg transition-all"
          >
            <h2 className="text-lg font-semibold">Monitoring</h2>
            <p className="text-sm text-gray-500">Monitor compliance status</p>
          </Link>

          <Link 
            href="/learning" 
            className="block rounded-lg border p-4 hover:border-blue-500 hover:shadow-lg transition-all"
          >
            <h2 className="text-lg font-semibold">Learning</h2>
            <p className="text-sm text-gray-500">Learn about compliance</p>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Overall Compliance Score</p>
                <p className="text-2xl font-bold">85%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Frameworks</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                <p className="text-sm">Framework assessment completed</p>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                <p className="text-sm">New monitoring rule added</p>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                <p className="text-sm">Compliance alert resolved</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
