'use client';
import { useMultiTenantAuth } from '@/lib/auth/MultiTenantContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingState from '@/components/ui/LoadingState';

export default function SelectWorkspace() {
  const { user, loading: authLoading, currentWorkspace, availableWorkspaces, switchWorkspace, createWorkspace } = useMultiTenantAuth();
  const router = useRouter();
  const [workspaceName, setWorkspaceName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Legacy route: immediately forward to the new canonical path
  useEffect(() => {
    router.replace('/workspace/select');
  }, [router]);

  useEffect(() => {
    // Check authentication and workspace status
    if (!authLoading) {
      if (!user) {
        // Not authenticated, redirect to login
        router.push('/auth/login');
        return;
      }
      
      // If user already has a current workspace, redirect to it
      if (currentWorkspace) {
        router.push(`/workspace/${currentWorkspace.slug}/dashboard`);
        return;
      }
      
      // If user has available workspaces but no current one selected
      if (availableWorkspaces && availableWorkspaces.length > 0) {
        // Auto-select the first workspace and redirect after successful switch
        (async () => {
          const slug = availableWorkspaces[0].workspace.slug;
          const ok = await switchWorkspace(slug);
          if (ok) {
            router.push(`/workspace/${slug}/dashboard`);
          }
        })();
        return;
      }
      
      // User is authenticated but has no workspaces - show the create workspace form
      setIsLoading(false);
    }
  }, [authLoading, user, currentWorkspace, availableWorkspaces, router, switchWorkspace]);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceName.trim()) {
      setError('Workspace name is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Generate a slug from the workspace name
      const slug = workspaceName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      
      // Use the MultiTenantAuth context to create the workspace
      const workspaceId = await createWorkspace(workspaceName, slug);
      
      if (!workspaceId) {
        throw new Error('Failed to create workspace');
      }
      
      // NOTE: The createWorkspace method already calls switchWorkspace internally
      // We just need to handle the redirect here after a short delay
      console.log('[Customer Workspace] Redirecting to dashboard for:', slug);
      
      // Add a small delay to ensure state is fully updated
      setTimeout(() => {
        console.log('[Customer Workspace] Executing redirect to dashboard');
        router.push(`/workspace/${slug}/dashboard`);
      }, 500);
    } catch (error) {
      console.error('Error creating workspace:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create workspace';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  if (isLoading || authLoading) {
    return <LoadingState />;
  }

  if (!user) return null;
  if (currentWorkspace) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Your Workspace</CardTitle>
          <CardDescription>
            Get started by creating a new workspace for your team
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleCreateWorkspace}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workspace">Workspace Name</Label>
              <Input
                id="workspace"
                placeholder="Acme Inc"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                disabled={isLoading}
              />
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => router.push('/auth/login')}
              disabled={isLoading}
            >
              Back to Login
            </Button>
            <Button type="submit" disabled={isLoading || !workspaceName.trim()}>
              {isLoading && (
                <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              Create Workspace
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
