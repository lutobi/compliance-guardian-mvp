import { useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { Sidebar } from '../navigation/CustomerSidebar';
import { UserMenu } from '../navigation/UserMenu';
import RoleGuard from '../auth/RoleGuard';
import { useCustomerWorkspace } from '@/lib/workspace/customer-context';

export function CustomerLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { workspace } = useCustomerWorkspace();

  return (
    <RoleGuard requiredRole="customer">
      <div className="min-h-screen">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div className="lg:pl-64">
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <div className="flex flex-1 items-center gap-x-4">
                <h1 className="text-lg font-semibold">
                  {workspace?.name || 'Customer Dashboard'}
                </h1>
                <button 
                  onClick={() => window.location.href = '/workspace/select'}
                  className="text-sm text-gray-500 hover:text-primary"
                  data-testid="workspace-menu"
                >
                  Switch Workspace
                </button>
              </div>
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                <UserMenu />
              </div>
            </div>
          </div>
          
          <main className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}
