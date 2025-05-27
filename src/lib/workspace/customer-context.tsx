'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export interface CustomerSettings {
  theme: {
    primary: string;
    brandColors: Record<string, string>;
  };
  features: {
    enabledModules: string[];
    customizations: Record<string, any>;
  };
  compliance: {
    frameworks: string[];
    customControls: string[];
  };
  notifications: {
    email: boolean;
    slack?: boolean;
    teams?: boolean;
  };
  timezone?: string;
  dateFormat?: string;
}

export interface CustomerWorkspace {
  id: string;
  name: string;
  customerId: string;
  industry?: string;
  settings: CustomerSettings;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  workspaceId: string;
  industry?: string;
  settings: Record<string, any>;
}

export interface CustomerContextType {
  workspace: CustomerWorkspace | null;
  workspaces: CustomerWorkspace[];
  settings: CustomerSettings;
  customerData: Customer | null;
  loading: boolean;
  error: string | null;
  updateSettings: (settings: Partial<CustomerSettings>) => Promise<void>;
  selectWorkspace: (workspaceId: string) => Promise<void>;
  createWorkspace: (name: string, industry?: string) => Promise<CustomerWorkspace | null>;
  refreshWorkspaces: () => Promise<void>;
}

const defaultSettings: CustomerSettings = {
  theme: {
    primary: '#0066cc',
    brandColors: {}
  },
  features: {
    enabledModules: [],
    customizations: {}
  },
  compliance: {
    frameworks: [],
    customControls: []
  },
  notifications: {
    email: true,
    slack: false,
    teams: false
  },
  timezone: 'UTC',
  dateFormat: 'MM/DD/YYYY'
};

export const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export function useCustomerWorkspace() {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomerWorkspace must be used within a CustomerProvider');
  }
  return context;
}

export function CustomerProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [workspace, setWorkspace] = useState<CustomerWorkspace | null>(null);
  const [workspaces, setWorkspaces] = useState<CustomerWorkspace[]>([]);
  const [customerData, setCustomerData] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // Memoize the current user's ID to prevent unnecessary reloads
  const userId = useMemo(() => user?.id, [user?.id]);
  const customerId = useMemo(() => user?.customerId, [user?.customerId]);
  
  const loadWorkspaces = useCallback(async () => {
    if (!userId) {
      setWorkspace(null);
      setWorkspaces([]);
      setCustomerData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First get user's current workspace_id
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('workspace_id')
        .eq('id', userId)
        .maybeSingle();

      if (userError) {
        console.error('Error fetching user data:', userError);
      }

      // Get all customer workspaces accessible to this user
      const { data: workspacesData, error: workspacesError } = await supabase
        .from('workspaces')
        .select(`
          id, 
          name, 
          settings,
          created_at,
          updated_at,
          customers (
            id,
            name,
            industry,
            settings
          )
        `)
        .eq('type', 'customer');

      if (workspacesError) {
        setError('Failed to load workspaces');
        console.error('Error fetching workspaces:', workspacesError);
        return;
      }

      // Transform data to match our expected structure
      const transformedWorkspaces = workspacesData.map(w => ({
        id: w.id,
        name: w.customers?.[0]?.name || w.name,
        customerId: w.customers?.[0]?.id,
        industry: w.customers?.[0]?.industry,
        settings: {
          ...defaultSettings,
          ...(w.settings || {})
        },
        createdAt: w.created_at,
        updatedAt: w.updated_at
      }));

      setWorkspaces(transformedWorkspaces);

      // Set current workspace based on user data or customerId
      const currentWorkspaceId = userData?.workspace_id || customerId;
      
      if (currentWorkspaceId) {
        const currentWorkspace = transformedWorkspaces.find(w => 
          w.id === currentWorkspaceId || w.customerId === currentWorkspaceId
        );
        
        if (currentWorkspace) {
          setWorkspace(currentWorkspace);
          
          // Also set customer data if available
          const customerInfo = workspacesData.find(w => 
            w.id === currentWorkspace.id
          )?.customers?.[0];
          
          if (customerInfo) {
            setCustomerData({
              id: customerInfo.id,
              name: customerInfo.name,
              workspaceId: currentWorkspace.id,
              industry: customerInfo.industry,
              settings: customerInfo.settings || {}
            });
          }
        } else {
          // If workspace not found but had an ID, error
          setError('Selected workspace not found');
        }
      } else if (transformedWorkspaces.length === 1) {
        // If only one workspace, auto-select it
        setWorkspace(transformedWorkspaces[0]);
        
        // Get customer data
        const customerInfo = workspacesData[0].customers?.[0];
        if (customerInfo) {
          setCustomerData({
            id: customerInfo.id,
            name: customerInfo.name,
            workspaceId: transformedWorkspaces[0].id,
            industry: customerInfo.industry,
            settings: customerInfo.settings || {}
          });
        }
      } else {
        // Multiple workspaces but none selected
        setWorkspace(null);
        setCustomerData(null);
      }
    } catch (error) {
      console.error('Error loading workspaces:', error);
      setError('Failed to load workspace data');
    } finally {
      setLoading(false);
    }
  }, [userId, customerId]);

  // Load workspaces on mount/user change
  useEffect(() => {
    if (userId) {
      loadWorkspaces();
    }
  }, [userId, loadWorkspaces]);

  const updateSettings = async (newSettings: Partial<CustomerSettings>) => {
    if (!workspace) {
      setError('No workspace selected');
      return;
    }

    setLoading(true);
    try {
      // Merge the new settings with existing ones
      const mergedSettings = {
        ...workspace.settings,
        ...newSettings,
        // Handle nested objects
        theme: {
          ...workspace.settings.theme,
          ...(newSettings.theme || {})
        },
        features: {
          ...workspace.settings.features,
          ...(newSettings.features || {})
        },
        compliance: {
          ...workspace.settings.compliance,
          ...(newSettings.compliance || {})
        },
        notifications: {
          ...workspace.settings.notifications,
          ...(newSettings.notifications || {})
        }
      };

      const { error } = await supabase
        .from('workspaces')
        .update({ settings: mergedSettings })
        .eq('id', workspace.id);

      if (error) throw error;

      // Update local state
      setWorkspace({
        ...workspace,
        settings: mergedSettings
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      setError('Failed to update settings');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const selectWorkspace = async (workspaceId: string) => {
    if (!userId) {
      setError('No user is logged in');
      return;
    }

    setLoading(true);
    try {
      // Update user's workspace_id
      const { error } = await supabase
        .from('users')
        .update({ workspace_id: workspaceId })
        .eq('id', userId);

      if (error) throw error;

      // Reload workspace data
      await loadWorkspaces();
      
      // Navigate to customer dashboard
      router.push('/customer/dashboard');
    } catch (error) {
      const err: any = error;
      console.error('Error selecting workspace:', err.message, err.details);
      setError('Failed to select workspace: ' + (err.message ?? 'Unknown error'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createWorkspace = async (name: string, industry?: string): Promise<CustomerWorkspace | null> => {
    if (!userId) {
      setError('No user is logged in');
      return null;
    }

    setLoading(true);
    try {
      // Create new workspace
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('workspaces')
        .insert({
          name,
          type: 'customer',
          settings: defaultSettings
        })
        .select('id')
        .single();

      if (workspaceError) throw workspaceError;
      if (!workspaceData) throw new Error('Failed to create workspace');

      // Create associated customer
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .insert({
          name,
          workspace_id: workspaceData.id,
          industry,
          settings: {}
        })
        .select('id')
        .single();

      if (customerError) throw customerError;
      if (!customerData) throw new Error('Failed to create customer record');

      // Auto-select this workspace for the user
      await selectWorkspace(workspaceData.id);

      // Create and return the new workspace
      const newWorkspace: CustomerWorkspace = {
        id: workspaceData.id,
        name,
        customerId: customerData.id,
        industry,
        settings: defaultSettings,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return newWorkspace;
    } catch (error) {
      const err: any = error;
      console.error('Error creating workspace:', err.message, err.details);
      setError('Failed to create workspace: ' + (err.message ?? 'Unknown error'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const refreshWorkspaces = async () => {
    await loadWorkspaces();
  };

  return (
    <CustomerContext.Provider
      value={{
        workspace,
        workspaces,
        settings: workspace?.settings ?? defaultSettings,
        customerData,
        loading,
        error,
        updateSettings,
        selectWorkspace,
        createWorkspace,
        refreshWorkspaces
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}
