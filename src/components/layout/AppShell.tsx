import { useAuth } from '@/lib/auth/context';
import { useWorkspace } from '@/lib/workspace/context';
import { SystemLayout } from './SystemLayout';
import { CustomerLayout } from './CustomerLayout';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isSystemUser, loading: authLoading } = useAuth();
  const { loading: workspaceLoading } = useWorkspace();

  if (authLoading || workspaceLoading) {
    return <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  return isSystemUser ? (
    <SystemLayout>{children}</SystemLayout>
  ) : (
    <CustomerLayout>{children}</CustomerLayout>
  );
}
