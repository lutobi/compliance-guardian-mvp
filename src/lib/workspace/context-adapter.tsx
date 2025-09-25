'use client';

/**
 * Workspace Context Adapter
 * 
 * This component bridges the legacy CustomerContext with our new multi-tenant WorkspaceContext.
 * It wraps the WorkspaceContextProvider and provides a compatible CustomerContext for
 * existing components that expect the old interface.
 */

import React, { useEffect, useMemo } from 'react';
import { CustomerContext, CustomerSettings, defaultSettings } from './customer-context';
import { useWorkspaceContext } from '@/lib/hooks/WorkspaceContext';

export function WorkspaceContextAdapter({ children }: { children: React.ReactNode }) {
  const {
    currentWorkspace,
    userWorkspaces,
    isLoading,
    error,
    switchWorkspace,
    refreshWorkspaces
  } = useWorkspaceContext();

  // Map our new workspace format to the legacy CustomerWorkspace format
  const mappedWorkspace = useMemo(() => {
    if (!currentWorkspace) return null;
    
    return {
      id: currentWorkspace.id,
      name: currentWorkspace.name,
      customerId: currentWorkspace.id, // Use workspace ID as customer ID for compatibility
      industry: currentWorkspace.settings?.industry || '',
      settings: currentWorkspace.settings as CustomerSettings || defaultSettings,
      createdAt: currentWorkspace.created_at || new Date().toISOString(),
      updatedAt: currentWorkspace.created_at || new Date().toISOString(),
    };
  }, [currentWorkspace]);

  // Map our new workspaces list to the legacy format
  const mappedWorkspaces = useMemo(() => {
    return userWorkspaces.map(w => ({
      id: w.id,
      name: w.name,
      customerId: w.id, // Use workspace ID as customer ID for compatibility
      industry: w.settings?.industry || '',
      settings: w.settings as CustomerSettings || defaultSettings,
      createdAt: w.created_at || new Date().toISOString(),
      updatedAt: w.created_at || new Date().toISOString(),
    }));
  }, [userWorkspaces]);

  // Create a customer data object for compatibility
  const customerData = useMemo(() => {
    if (!currentWorkspace) return null;
    
    return {
      id: currentWorkspace.id,
      name: currentWorkspace.name,
      workspaceId: currentWorkspace.id,
      industry: currentWorkspace.settings?.industry || '',
      settings: currentWorkspace.settings || {},
    };
  }, [currentWorkspace]);

  // Implementation of legacy methods using new context
  const updateSettings = async (newSettings: Partial<CustomerSettings>) => {
    if (!currentWorkspace?.id) return;
    
    try {
      const response = await fetch(`/api/workspaces/${currentWorkspace.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          settings: {
            ...currentWorkspace.settings,
            ...newSettings
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update settings');
      }
      
      // Refresh workspaces to get updated settings
      refreshWorkspaces();
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const updateWorkspaceName = async (name: string) => {
    if (!currentWorkspace?.id) return;
    
    try {
      const response = await fetch(`/api/workspaces/${currentWorkspace.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update workspace name');
      }
      
      // Refresh workspaces to get updated name
      refreshWorkspaces();
    } catch (error) {
      console.error('Error updating workspace name:', error);
    }
  };

  const selectWorkspace = async (workspaceId: string) => {
    await switchWorkspace(workspaceId);
  };

  const createWorkspace = async (name: string, industry?: string) => {
    try {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name,
          industry,
          settings: defaultSettings
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create workspace');
      }
      
      const result = await response.json();
      
      // Refresh workspaces to include the new one
      await refreshWorkspaces();
      
      // Map to legacy format and return
      return {
        id: result.data.id,
        name: result.data.name,
        customerId: result.data.id,
        industry: result.data.industry || '',
        settings: defaultSettings,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error creating workspace:', error);
      return null;
    }
  };

  const deleteWorkspace = async (workspaceId: string) => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete workspace');
      }
      
      // Refresh workspaces to update the list
      refreshWorkspaces();
    } catch (error) {
      console.error('Error deleting workspace:', error);
    }
  };

  return (
    <CustomerContext.Provider
      value={{
        workspace: mappedWorkspace,
        workspaces: mappedWorkspaces,
        settings: mappedWorkspace?.settings || defaultSettings,
        customerData,
        loading: isLoading,
        error: error,
        updateSettings,
        updateWorkspaceName,
        selectWorkspace,
        createWorkspace,
        refreshWorkspaces,
        deleteWorkspace
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}
