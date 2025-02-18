'use client';

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type UserData = {
  email: string;
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;

        if (user) {
          setUserData({
            email: user.email || '',
            created_at: user.created_at,
          });
        }
      } catch (error) {
        const e = error as Error;
        toast.error(e.message || 'Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/');
    } catch (error) {
      const e = error as Error;
      toast.error(e.message || 'Failed to sign out');
    }
  };

  if (loading) {
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
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center border-b px-4 md:px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-sm text-gray-500">{userData?.email}</span>
          <Button onClick={handleSignOut} variant="outline" size="sm">
            Sign Out
          </Button>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Welcome back!</h2>
          <p className="text-gray-500">
            Member since {new Date(userData?.created_at || '').toLocaleDateString()}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <button className="rounded-lg border p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
            <h2 className="text-lg font-semibold">Assessments</h2>
            <p className="text-sm text-gray-500">Manage your compliance assessments</p>
          </button>
          <button className="rounded-lg border p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
            <h2 className="text-lg font-semibold">Frameworks</h2>
            <p className="text-sm text-gray-500">View available compliance frameworks</p>
          </button>
          <button className="rounded-lg border p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
            <h2 className="text-lg font-semibold">Reports</h2>
            <p className="text-sm text-gray-500">Generate compliance reports</p>
          </button>
          <button className="rounded-lg border p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
            <h2 className="text-lg font-semibold">Settings</h2>
            <p className="text-sm text-gray-500">Manage your account settings</p>
          </button>
        </div>
      </main>
    </div>
  );
}
