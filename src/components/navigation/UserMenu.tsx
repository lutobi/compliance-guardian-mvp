'use client';

import { useMultiTenantAuth } from '@/lib/auth/MultiTenantContext';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserIcon } from '@heroicons/react/24/outline';

export function UserMenu() {
  const { user, signOut, loading } = useMultiTenantAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    // Prefer client-side navigation to avoid full reload
    router.push('/auth/login');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          data-testid="user-menu"
          className="flex items-center gap-2"
        >
          <UserIcon className="h-5 w-5" />
          <span className="hidden md:inline">{user?.profile?.email || (loading ? 'Loading…' : 'Account')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleSignOut} data-testid="sign-out-button">
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

