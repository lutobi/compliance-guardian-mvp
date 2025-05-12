import { useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { Sidebar } from '../navigation/SystemSidebar';
import { Header } from '../navigation/Header';
import RoleGuard from '../auth/RoleGuard';

export function SystemLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <RoleGuard requiredRole="system">
      <div className="min-h-screen bg-gray-100">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div className="lg:pl-64">
          <Header 
            onMenuClick={() => setSidebarOpen(true)}
            title="System Dashboard"
            user={user}
          />
          
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
