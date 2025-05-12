'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/context';
import {
  ChartBarIcon,
  BookOpenIcon,
  ArrowsRightLeftIcon,
  Cog6ToothIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ComputerDesktopIcon,
  Bars3Icon,
  XMarkIcon,
  ClipboardDocumentCheckIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';

interface NavItem {
  title: string;
  href: string;
  icon: typeof ChartBarIcon;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut, isCustomerUser, isSystemUser } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: isSystemUser ? '/system/dashboard' : isCustomerUser ? '/customer/dashboard' : '/dashboard',
      icon: ChartBarIcon,
    },
    ...(isSystemUser
      ? [
          { title: 'Workspaces', href: '/customer/dashboard', icon: Squares2X2Icon },
        ]
      : []),
    {
      title: 'Monitoring',
      href: '/monitoring',
      icon: ClipboardDocumentCheckIcon,
    },
    {
      title: 'Frameworks',
      href: '/frameworks',
      icon: BookOpenIcon,
    },
    {
      title: 'Compare',
      href: '/compare',
      icon: ArrowsRightLeftIcon,
    },
    {
      title: 'Learning',
      href: '/learning',
      icon: ComputerDesktopIcon,
    },
    {
      title: 'Profile',
      href: '/profile',
      icon: UserIcon,
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: Cog6ToothIcon,
    },
  ];

  if (!mounted) return null;

  return (
    <>
      <button
        type="button"
        className="md:hidden fixed top-4 left-4 z-40"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <Bars3Icon className="h-6 w-6" />
        )}
      </button>

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-30 w-64 transform bg-white border-r border-gray-200 transition-transform duration-200 ease-in-out',
          {
            'translate-x-0': isMobileMenuOpen,
            '-translate-x-full': !isMobileMenuOpen,
          },
          'md:translate-x-0 md:static md:inset-auto'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex-1 py-6 overflow-y-auto">
            <nav className="px-4 space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors',
                      {
                        'bg-gray-100 text-gray-900': isActive,
                        'text-gray-600 hover:bg-gray-50 hover:text-gray-900':
                          !isActive,
                      }
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      setIsMobileMenuOpen(false);
                      window.location.href = item.href;
                    }}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.title}
                  </a>
                );
              })}
            </nav>
          </div>

          {user && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <div>
                <Button
                  variant="ghost"
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
                  onClick={signOut}
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                  Sign out
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
