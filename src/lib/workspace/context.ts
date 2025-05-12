import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Workspace, Context } from '@/types/core';
import { useAuth } from '../auth/context';

interface WorkspaceState {
  workspace: Workspace | null;
  context: Context;
  loading: boolean;
}

interface WorkspaceContextType extends WorkspaceState {
  switchWorkspace: (workspaceId: string) => Promise<void>;
  updateContext: (context: Partial<Context>) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<WorkspaceState>({
    workspace: null,
    context: {
      environment: 'production'
    },
    loading: true
  });

  useEffect(() => {
    if (user) {
      loadWorkspace(user.role.context.workspace);
    }
  }, [user]);

  const loadWorkspace = async (workspaceId: string) => {
    const { data: workspace, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', workspaceId)
      .single();

    if (error) {
      console.error('Error loading workspace:', error);
      setState(s => ({ ...s, loading: false }));
      return;
    }

    setState({
      workspace,
      context: {
        ...state.context,
        ...workspace.context
      },
      loading: false
    });
  };

  const value = {
    ...state,
    switchWorkspace: async (workspaceId: string) => {
      setState(s => ({ ...s, loading: true }));
      await loadWorkspace(workspaceId);
    },
    updateContext: (newContext: Partial<Context>) => {
      setState(s => ({
        ...s,
        context: { ...s.context, ...newContext }
      }));
    }
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within WorkspaceProvider');
  }
  return context;
};
