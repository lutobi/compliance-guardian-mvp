/**
 * WORKSPACE CONTEXT UTILITIES
 * 
 * Centralized utilities for extracting and validating workspace context
 * from API requests to avoid code duplication
 */

import { NextRequest } from 'next/server';
import type { AuthenticatedUser } from './types';

export interface WorkspaceContext {
  slug: string;
  source: 'query' | 'header' | 'path' | 'body';
}

/**
 * Extract workspace slug from various sources in order of precedence:
 * 1. URL path parameter (e.g., /api/workspace/[slug]/...)
 * 2. Query parameter (?workspace=slug)
 * 3. Header (x-workspace-slug)
 * 4. Request body (workspace_slug)
 */
export async function extractWorkspaceContext(request: NextRequest): Promise<WorkspaceContext | null> {
  // 1. Check URL path parameter (highest precedence)
  const pathname = request.nextUrl.pathname;
  const pathMatch = pathname.match(/\/workspace\/([^\/]+)/);
  if (pathMatch && pathMatch[1] !== 'select') {
    return {
      slug: pathMatch[1],
      source: 'path'
    };
  }

  // 2. Check query parameter
  const querySlug = request.nextUrl.searchParams.get('workspace');
  if (querySlug) {
    return {
      slug: querySlug,
      source: 'query'
    };
  }

  // 3. Check header
  const headerSlug = request.headers.get('x-workspace-slug');
  if (headerSlug) {
    return {
      slug: headerSlug,
      source: 'header'
    };
  }

  // 4. Check request body for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    try {
      const body = await request.json();
      if (body.workspace_slug) {
        return {
          slug: body.workspace_slug,
          source: 'body'
        };
      }
    } catch {
      // Body is not JSON or already consumed, skip
    }
  }

  return null;
}

/**
 * Validate that the authenticated user has access to the workspace
 */
export function validateWorkspaceAccess(user: AuthenticatedUser, workspaceSlug: string): boolean {
  // If currentWorkspace is set and matches, allow
  if (user.currentWorkspace && user.currentWorkspace.slug === workspaceSlug) {
    return true;
  }

  // Fallback: allow if the user has any active membership matching the slug
  try {
    return !!user.memberships?.some(
      (m: any) => m?.workspace?.slug === workspaceSlug && m?.invitation_status === 'active'
    );
  } catch {
    return false;
  }
}

/**
 * Get user's workspace membership for a specific workspace
 */
export function getUserWorkspaceMembership(user: AuthenticatedUser, workspaceSlug: string) {
  return user.memberships.find(m => m.workspace.slug === workspaceSlug && m.invitation_status === 'active');
}

/**
 * Check if user is workspace owner
 */
export function isWorkspaceOwner(user: AuthenticatedUser, workspaceSlug?: string): boolean {
  if (!workspaceSlug && user.currentMembership) {
    return user.currentMembership.role === 'owner';
  }
  
  if (workspaceSlug) {
    const membership = getUserWorkspaceMembership(user, workspaceSlug);
    return membership?.role === 'owner';
  }
  
  return false;
}

/**
 * Check if user is workspace admin or owner
 */
export function isWorkspaceAdmin(user: AuthenticatedUser, workspaceSlug?: string): boolean {
  if (!workspaceSlug && user.currentMembership) {
    return ['owner', 'admin'].includes(user.currentMembership.role);
  }
  
  if (workspaceSlug) {
    const membership = getUserWorkspaceMembership(user, workspaceSlug);
    return membership ? ['owner', 'admin'].includes(membership.role) : false;
  }
  
  return false;
}
