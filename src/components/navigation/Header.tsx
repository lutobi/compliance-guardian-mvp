'use client';

import { Bars3Icon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { UserMenu } from './UserMenu';
import { User } from '@supabase/supabase-js';

interface HeaderProps {
  onMenuClick: () => void;
  title: string;
  user: User | null;
}

export function Header({ onMenuClick, title, user }: HeaderProps) {
  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
        onClick={onMenuClick}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </Button>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1 items-center">
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <UserMenu />
        </div>
      </div>
    </div>
  );
}
