'use client';

import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 flex-shrink-0">
        <Sidebar />
      </div>
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
