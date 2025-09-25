/**
 * WORKSPACE LAYOUT
 * 
 * This layout provides the workspace-scoped navigation and context
 * for all workspace-specific pages
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMultiTenantAuth } from '@/lib/auth/MultiTenantContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Settings, 
  Users, 
  ChevronDown, 
  Menu,
  X,
  Home,
  FileText,
  Shield,
  BarChart3,
  Calendar,
  Bell
} from 'lucide-react';
import { toast } from 'sonner';
import { UserMenu } from '@/components/navigation/UserMenu';

interface WorkspaceLayoutProps {
  children: React.ReactNode;
}

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const params = useParams() as { slug: string };
  const router = useRouter();
  const { 
    user, 
    currentWorkspace, 
    currentMembership, 
    availableWorkspaces, 
    switchWorkspace, 
    hasPermission,
    loading 
  } = useMultiTenantAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [workspaceSwitcherOpen, setWorkspaceSwitcherOpen] = useState(false);

  const workspaceSlug = params.slug as string;

  // Ensure user has access to this workspace
  useEffect(() => {
    if (!loading && user && workspaceSlug) {
      if (!currentWorkspace || currentWorkspace.slug !== workspaceSlug) {
        // Try to switch to the requested workspace
        const targetWorkspace = availableWorkspaces.find(w => w.workspace.slug === workspaceSlug);
        if (targetWorkspace) {
          switchWorkspace(workspaceSlug);
        } else {
          // User doesn't have access to this workspace
          toast.error('You do not have access to this workspace');
          router.push('/workspace/select');
        }
      }
    }
  }, [loading, user, workspaceSlug, currentWorkspace, availableWorkspaces, switchWorkspace, router]);

  const handleWorkspaceSwitch = async (targetSlug: string) => {
    if (targetSlug !== workspaceSlug) {
      const success = await switchWorkspace(targetSlug);
      if (success) {
        router.push(`/workspace/${targetSlug}/dashboard`);
      }
    }
    setWorkspaceSwitcherOpen(false);
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      href: `/workspace/${workspaceSlug}/dashboard`,
      icon: Home,
      current: false
    },
    {
      name: 'Assessments',
      href: `/workspace/${workspaceSlug}/assessments`,
      icon: FileText,
      current: false
    },
    {
      name: 'Compliance',
      href: `/workspace/${workspaceSlug}/compliance`,
      icon: Shield,
      current: false
    },
    {
      name: 'Analytics',
      href: `/workspace/${workspaceSlug}/analytics`,
      icon: BarChart3,
      current: false
    },
    {
      name: 'Schedule',
      href: `/workspace/${workspaceSlug}/schedule`,
      icon: Calendar,
      current: false
    }
  ];

  // Show loading state
  if (loading || !user || !currentWorkspace) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Desktop top header with UserMenu (visible during loading) */}
        <div className="sticky top-0 z-10 hidden md:flex h-16 items-center justify-end bg-white border-b px-4">
          <UserMenu />
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setSidebarOpen(false)} />
        
        <div className={`relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* Mobile sidebar content */}
          <div className="flex-shrink-0 flex items-center px-4">
            <Building2 className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">Compliance Guardian</span>
          </div>
          
          <div className="mt-5 flex-1 h-0 overflow-y-auto">
            <nav className="px-2 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <Icon className="mr-4 flex-shrink-0 h-6 w-6" />
                    {item.name}
                  </a>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col min-h-0 border-r border-gray-200 bg-white">
          {/* Workspace switcher */}
          <div className="flex-1">
            <div className="flex items-center h-16 flex-shrink-0 px-4 bg-white border-b border-gray-200">
              <div className="relative w-full flex items-center gap-2">
                <button
                  type="button"
                  className="flex-1 flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-900 bg-gray-50 rounded-md hover:bg-gray-100"
                  onClick={() => router.push('/workspace/select')}
                  data-testid="workspace-menu"
                >
                  <div className="flex items-center min-w-0">
                    <Building2 className="flex-shrink-0 h-5 w-5 text-blue-600 mr-2" />
                    <span className="truncate">{currentWorkspace.name}</span>
                  </div>
                </button>
                <button
                  type="button"
                  className="px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  aria-label="Open workspace dropdown"
                  onClick={() => setWorkspaceSwitcherOpen(!workspaceSwitcherOpen)}
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {/* Workspace dropdown */}
                {workspaceSwitcherOpen && (
                  <div className="absolute z-10 top-full left-0 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200" data-testid="workspace-menu-list">
                    <div className="py-1">
                      {availableWorkspaces.map((membership) => (
                        <button
                          key={membership.workspace.id}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between"
                          onClick={() => handleWorkspaceSwitch(membership.workspace.slug)}
                          data-testid={`workspace-menu-item-${membership.workspace.slug}`}
                        >
                          <div className="flex items-center">
                            <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                            <span>{membership.workspace.name}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {membership.role}
                          </Badge>
                        </button>
                      ))}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-blue-600"
                          onClick={() => router.push('/workspace/select')}
                        >
                          Switch workspace
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <Icon className="mr-3 flex-shrink-0 h-5 w-5" />
                    {item.name}
                  </a>
                );
              })}
            </nav>
          </div>

          {/* User menu */}
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user.profile.name?.[0] || user.profile.email[0].toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user.profile.name}</p>
                <p className="text-xs font-medium text-gray-500 capitalize">{currentMembership?.role}</p>
              </div>
            </div>
            {hasPermission('manage_settings') && (
              <button className="ml-auto">
                <Settings className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Top navigation (mobile) */}
        <div className="sticky top-0 z-10 md:hidden px-3 py-2 bg-white border-b flex items-center justify-between">
          <button
            type="button"
            className="h-10 w-10 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          {currentWorkspace && (
            <div className="flex-1 mx-2 flex items-center gap-2">
              <button
                type="button"
                className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-900 bg-gray-50 rounded-md hover:bg-gray-100"
                onClick={() => router.push('/workspace/select')}
                data-testid="workspace-menu"
              >
                <Building2 className="h-4 w-4 text-blue-600 mr-2" />
                <span className="truncate max-w-[60%]">{currentWorkspace.name}</span>
              </button>
              <button
                type="button"
                className="px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                aria-label="Open workspace dropdown"
                onClick={() => setWorkspaceSwitcherOpen(!workspaceSwitcherOpen)}
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          )}
          <div className="w-10" />
        </div>

        {/* Desktop top header with Workspace switcher shortcut and UserMenu */}
        <div className="sticky top-0 z-10 hidden md:flex h-16 items-center justify-end bg-white border-b px-4 gap-2">
          <button
            type="button"
            className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md flex items-center"
            onClick={() => router.push('/workspace/select')}
            data-testid="workspace-menu"
          >
            <Building2 className="h-4 w-4 mr-2 text-blue-600" />
            Switch Workspace
          </button>
          <UserMenu />
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
