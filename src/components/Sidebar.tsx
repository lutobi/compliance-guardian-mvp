'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { isPlatformAdmin } from '@/lib/auth/admin';
import { useMultiTenantAuth } from '@/lib/auth/MultiTenantContext';
import { supabase } from '@/lib/supabase/client';
import { useCustomerWorkspace } from '@/lib/workspace/customer-context';
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
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

interface NavItem {
  title: string;
  href: string;
  icon: typeof ChartBarIcon;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [authEmail, setAuthEmail] = useState<string | undefined>(undefined);
  const [adminFromApi, setAdminFromApi] = useState<boolean>(false);
  
  // Use the multi-tenant auth context
  const { user, signOut, currentWorkspace, currentMembership, switchWorkspace } = useMultiTenantAuth();
  
  // For backward compatibility with legacy components
  const { workspace } = useCustomerWorkspace();
  
  // Log current workspace state
  console.log('[Sidebar] rendered workspace →', currentWorkspace);
  
  // Determine user roles based on workspace type and membership role
  const isCustomerUser = currentWorkspace?.type === 'customer';
  const isSystemUser = currentMembership?.role === 'admin' || currentMembership?.role === 'owner';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('sidebarCollapsed');
    if (stored !== null) setCollapsed(JSON.parse(stored));
  }, []);

  // Fetch auth email as a fallback for platform-admin gating when profile hasn't loaded yet
  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setAuthEmail(data.user?.email || undefined);
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  // Ask server whoami for platformAdmin flag (use access token so server can auth without cookies)
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        const res = await fetch('/api/dev/whoami', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!active) return;
        if (!res.ok) return;
        const json = await res.json();
        if (typeof json.platformAdmin === 'boolean') setAdminFromApi(json.platformAdmin);
      } catch {}
    })();
    return () => { active = false; };
  }, []);

  const isPlatAdmin = isPlatformAdmin(user?.profile?.email || authEmail) || adminFromApi;

  const dashboardHref = (() => {
    if (isPlatAdmin) return '/system/dashboard';
    const wsSlug = currentWorkspace?.slug;
    if (wsSlug) return `/workspace/${wsSlug}/dashboard`;
    return '/workspace/select';
  })();

  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: dashboardHref,
      icon: ChartBarIcon,
    },
    ...(isSystemUser
      ? [
          { title: 'Workspaces', href: '/workspace/select', icon: Squares2X2Icon },
        ]
      : []),
    {
      title: 'Monitoring',
      href: '/monitoring',
      icon: ClipboardDocumentCheckIcon,
    },
    ...(isPlatAdmin
      ? [{
          title: 'Frameworks',
          href: '/dashboard/frameworks',
          icon: BookOpenIcon,
        }]
      : []),
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

  // Hide sidebar entirely when no authenticated user
  if (!mounted || !user) return null;

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
          'fixed inset-y-0 left-0 z-30 transform bg-white border-r border-gray-200 transition-all duration-200 ease-in-out',
          collapsed ? 'w-16' : 'w-64',
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
                  <Link
                    key={`${item.title}-${item.href}`}
                    href={item.href}
                    className={cn(
                      'flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors',
                      {
                        'bg-gray-100 text-gray-900': isActive,
                        'text-gray-600 hover:bg-gray-50 hover:text-gray-900': !isActive,
                      }
                    )}
                    onClick={(e) => {
                      // Use client-side navigation to preserve auth state and avoid race with cookie sync
                      e.preventDefault();
                      setIsMobileMenuOpen(false);
                      router.push(item.href);
                    }}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className={collapsed ? 'hidden' : ''}>{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {user && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {isCustomerUser ? currentWorkspace?.name : user?.profile?.email || ''}
                  </p>
                </div>
              </div>
              {isSystemUser && (
                <div className="mt-4 border-t pt-2">
                  <span className="text-xs font-medium text-gray-500 block mb-1">Workspaces</span>
                  {user?.memberships?.map((membership) => {
                    const ws = membership.workspace || null;
                    const wsId = membership.workspace_id || ws?.id || `ws-${membership.role}`;
                    const wsName = ws?.name || 'Untitled workspace';
                    const wsSlug = ws?.slug;
                    const isCurrent = currentWorkspace?.id && (currentWorkspace.id === membership.workspace_id || currentWorkspace.id === ws?.id);
                    return (
                      <div key={wsId} className="flex items-center justify-between mb-1">
                        <button
                          onClick={() => { if (wsSlug) switchWorkspace(wsSlug); }}
                          disabled={!wsSlug}
                          className={cn(
                            'text-sm',
                            isCurrent
                              ? 'font-semibold text-gray-900'
                              : 'text-gray-600 hover:text-gray-900',
                            !wsSlug && 'opacity-50 cursor-not-allowed'
                          )}
                        >
                          {wsName}
                        </button>
                        {membership.role === 'owner' && (
                          <span className="text-xs text-gray-500">Owner</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
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

          {/* Collapse Toggle */}
          <div className="flex justify-center p-2 border-t">
            <button
              onClick={() => {
                const next = !collapsed;
                setCollapsed(next);
                localStorage.setItem('sidebarCollapsed', JSON.stringify(next));
              }}
              className="p-1"
            >
              {collapsed ? (
                <ChevronRightIcon className="h-5 w-5 text-gray-600" />
              ) : (
                <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
