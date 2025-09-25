'use client';

/**
 * Workspace Context Hook
 * 
 * Provides workspace context information throughout the application:
 * - Current workspace information
 * - User role within workspace
 * - User's workspaces list
 * - Workspace switching functionality
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useMultiTenantAuth } from '@/lib/auth/MultiTenantContext';
import type { WorkspaceMembership, Workspace as AuthWorkspace } from '@/lib/auth/types';

// Re-export the Workspace type from auth
export type Workspace = AuthWorkspace;

// User roles for workspace access
export type UserRole = 'owner' | 'admin' | 'member';

// Workspace API functions
const fetchUserWorkspaces = async (userId: string, memberships?: WorkspaceMembership[]): Promise<Workspace[]> => {
  try {
    console.log('Fetching workspaces for user ID:', userId);
    // If we have memberships from auth context, use them directly
    // This prevents the 404 error while API endpoint is configured
    if (memberships && memberships.length > 0) {
      // Extract workspaces from memberships
      return memberships
        .filter(membership => membership.workspace)
        .map(membership => membership.workspace);
    }
    
    // No API route yet – return empty list when memberships not provided
    return [];
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return []; // Return empty array on error
  }
};

// Workspace context type
interface WorkspaceContextType {
  currentWorkspace: Workspace | null;
  userWorkspaces: Workspace[];
  userRole: UserRole | null;
  isLoading: boolean;
  error: Error | null;
  switchWorkspace: (workspaceSlug: string) => void;
  refreshWorkspaces: () => Promise<void>;
}

// Create context with default values
const WorkspaceContext = createContext<WorkspaceContextType>({
  currentWorkspace: null,
  userWorkspaces: [],
  userRole: null,
  isLoading: true,
  error: null,
  switchWorkspace: () => {},
  refreshWorkspaces: async () => {},
});

// Hook for consuming context
export const useWorkspaceContext = () => useContext(WorkspaceContext);

// Workspace context provider component
export function WorkspaceContextProvider({ children }: { children: React.ReactNode }) {
  // State
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [userWorkspaces, setUserWorkspaces] = useState<Workspace[]>([]);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Get user from auth context
  const { user } = useMultiTenantAuth();

  // Helper function to determine user role in a workspace
  const getUserRole = (user: any, workspaceSlug: string | undefined): UserRole | null => {
    if (!user || !workspaceSlug) return null;
    
    // This is a simplified example - in a real app, you'd likely fetch this from the backend
    // or extract it from the user object based on your data structure
    const userWorkspaceRole = user.workspaces?.find((w: any) => w.slug === workspaceSlug)?.role;
    
    return userWorkspaceRole || null;
  };
  
  // Function to load user workspaces
  const loadWorkspaces = async () => {
    if (!user?.profile?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch user workspaces (pass memberships from auth context to avoid API call)
      const workspaces = await fetchUserWorkspaces(user.profile.id, user.memberships);
      setUserWorkspaces(workspaces);
      
      // Set current workspace if not already set
      if (workspaces.length > 0 && !currentWorkspace) {
        // Try to get last used workspace from localStorage
        const lastWorkspaceSlug = localStorage.getItem('lastWorkspace');
        const lastWorkspace = lastWorkspaceSlug
          ? workspaces.find((w) => w.slug === lastWorkspaceSlug)
          : null;
          
        setCurrentWorkspace(lastWorkspace || workspaces[0]);
        setUserRole(getUserRole(user, lastWorkspace?.slug || workspaces[0]?.slug));
      }
    } catch (e) {
      console.error('Error loading workspaces:', e);
      setError(e instanceof Error ? e : new Error('Failed to load workspaces'));
    } finally {
      setIsLoading(false);
    }
  };

  // Function to switch workspace
  const switchWorkspace = async (workspaceSlug: string) => {
    try {
      const workspace = userWorkspaces.find((w) => w.slug === workspaceSlug);
      if (!workspace) {
        console.error('Workspace not found:', workspaceSlug);
        return;
      }
      
      // Call the API to update the user's default workspace
      const response = await fetch(`/api/workspace/switch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ workspaceSlug })
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Failed to switch workspace:', error);
        return;
      }
      
      // Update local state
      setCurrentWorkspace(workspace);
      localStorage.setItem('lastWorkspace', workspaceSlug);
      
      // Update user role for the new workspace
      setUserRole(getUserRole(user, workspaceSlug));
    } catch (error) {
      console.error('Error switching workspace:', error);
    }
  };

  // Function to refresh workspaces
  const refreshWorkspaces = async () => {
    await loadWorkspaces();
  };

  // Load workspaces on initialization
  useEffect(() => {
    if (user) {
      loadWorkspaces();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  return (
    <WorkspaceContext.Provider value={{
      currentWorkspace,
      userWorkspaces,
      userRole,
      isLoading,
      error,
      switchWorkspace,
      refreshWorkspaces
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

// Helper hook to check workspace permissions
export function useWorkspacePermission(requiredPermission: string) {
  const { userRole } = useWorkspaceContext();
  
  // Define permission hierarchy
  const rolePermissions: Record<UserRole, string[]> = {
    owner: ['manage_workspace', 'manage_team', 'manage_subscription', 'view_subscription', 'edit_content', 'view_content'],
    admin: ['manage_team', 'view_subscription', 'edit_content', 'view_content'],
    member: ['view_content']
  };
  
  // Check if user has the required permission
  const hasPermission = userRole ? rolePermissions[userRole]?.includes(requiredPermission) : false;
  
  return { hasPermission, userRole };
}
