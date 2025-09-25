/**
 * COMPATIBILITY LAYER FOR WORKSPACE CONTEXT
 * 
 * This file provides backward compatibility for components still importing from the legacy path.
 * All workspace context functionality is now implemented in WorkspaceContext.tsx.
 * 
 * IMPORTANT: New code should import directly from '@/lib/hooks/WorkspaceContext'
 * 
 * This compatibility shim will be removed in a future version once all components
 * are migrated to import directly from the new location.
 */

// Re-export everything from the modern implementation
export { 
  useWorkspaceContext, 
  useWorkspacePermission 
} from './WorkspaceContext';

// Re-export types for type compatibility
export type { 
  Workspace, 
  UserRole 
} from './WorkspaceContext';

// Re-export the provider, but we need to handle it differently since it contains JSX
// which can't be directly in a .ts file
import { WorkspaceContextProvider as OriginalProvider } from './WorkspaceContext';
export const WorkspaceContextProvider = OriginalProvider;
