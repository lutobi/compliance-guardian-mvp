import { DashboardNav } from '@/components/dashboard/DashboardNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="py-6 px-8">
        {children}
      </main>
    </div>
  );
}
