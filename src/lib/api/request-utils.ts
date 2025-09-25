/**
 * ENHANCED API REQUEST UTILITIES
 * 
 * Centralized utilities for handling workspace context, permissions,
 * and common API patterns to reduce code duplication
 */

import { NextRequest } from 'next/server';
import { requirePermissionForApi } from '@/lib/auth/multi-tenant-auth';
import type { AuthenticatedUser } from '@/lib/auth/types';
import { createErrorResponse, createSuccessResponse } from './responses';
import { Permission } from '@/lib/auth/permissions';
import { extractWorkspaceContext, WorkspaceContext, validateWorkspaceAccess } from '@/lib/auth/workspace-context';

export interface APIRequestContext {
  user: AuthenticatedUser;
  workspaceContext: WorkspaceContext;
  body?: any;
}

/**
 * Enhanced API handler wrapper that handles common patterns:
 * - Workspace context extraction
 * - Permission checking
 * - Error handling
 * - Request body parsing
 */
export async function withWorkspaceContext<T>(
  request: NextRequest,
  permission: Permission,
  handler: (context: APIRequestContext) => Promise<T>
) {
  try {
    // Parse request body first for write methods to avoid double-read conflicts
    let body: any = undefined;
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      try {
        body = await request.json();
      } catch {
        body = undefined;
      }
    }

    // Determine workspace slug from path, query, header, then body
    let workspaceSlug: string | null = null;
    const pathname = request.nextUrl.pathname;
    const pathMatch = pathname.match(/\/workspace\/([^\/]+)/);
    if (pathMatch && pathMatch[1] !== 'select') {
      workspaceSlug = pathMatch[1];
    }
    if (!workspaceSlug) {
      workspaceSlug = request.nextUrl.searchParams.get('workspace');
    }
    if (!workspaceSlug) {
      workspaceSlug = request.headers.get('x-workspace-slug');
    }
    if (!workspaceSlug && body && typeof body === 'object') {
      workspaceSlug = body.workspace_slug || body.workspaceSlug || null;
    }

    // Fallback: use user's current workspace
    if (!workspaceSlug) {
      try {
        const { requireAuthForApi } = await import('@/lib/auth/multi-tenant-auth');
        const userForWs = await requireAuthForApi();
        workspaceSlug = userForWs?.currentWorkspace?.slug || null;
      } catch {}
    }

    if (!workspaceSlug) {
      return createErrorResponse('Workspace context required', 400, 'validation');
    }

    const workspaceContext = { slug: workspaceSlug, source: 'query' as const };

    // Require permission with workspace context (API-safe variant)
    const user = await requirePermissionForApi(permission as any, workspaceContext.slug);
    
    // Validate user has access to the workspace
    if (!validateWorkspaceAccess(user, workspaceContext.slug)) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[withWorkspaceContext] validateWorkspaceAccess failed but continuing in dev', {
          requested: workspaceContext.slug,
          current: user.currentWorkspace?.slug,
          memberships: (user.memberships || []).map((m: any) => m?.workspace?.slug)
        });
      } else {
        return createErrorResponse('Access denied to workspace', 403, 'auth');
      }
    }

    // Create request context
    const context: APIRequestContext = {
      user,
      workspaceContext,
      body
    };

    // Execute the handler
    const result = await handler(context);
    
    return createSuccessResponse(result);

  } catch (error: any) {
    console.error(`API Error [${request.method} ${request.url}]:`, error);
    
    const msg = String(error?.message || 'Internal server error');
    const lower = msg.toLowerCase();

    // Map common cases to accurate status codes
    if (lower.includes('auth') || lower.includes('session') || lower.includes('not authenticated') || lower.includes('authentication required')) {
      return createErrorResponse(msg, 401, 'auth');
    }

    if (lower.includes('permission') || lower.includes('access denied') || lower.includes('forbidden') || lower.includes('row-level security')) {
      return createErrorResponse(msg, 403, 'auth');
    }

    if (lower.includes('validation') || lower.includes('required') || lower.includes('bad request')) {
      return createErrorResponse(msg, 400, 'validation');
    }

    if (lower.includes('not found')) {
      return createErrorResponse(msg, 404, 'client');
    }
    
    // Default server error
    return createErrorResponse(msg, 500, 'server');
  }
}

/**
 * Simple API handler for endpoints that don't require workspace context
 * (e.g., health checks, auth endpoints)
 */
export async function withSimpleAuth<T>(
  request: NextRequest,
  requireAuth: boolean,
  handler: (user: AuthenticatedUser | null) => Promise<T>
) {
  try {
    let user: AuthenticatedUser | null = null;
    
    if (requireAuth) {
      const { getAuthenticatedUser } = await import('@/lib/auth/multi-tenant-auth');
      user = await getAuthenticatedUser();
      
      if (!user) {
        return createErrorResponse('Authentication required', 401, 'auth');
      }
    }

    const result = await handler(user);
    return createSuccessResponse(result);

  } catch (error: any) {
    console.error(`API Error [${request.method} ${request.url}]:`, error);
    return createErrorResponse('Internal server error', 500, 'server');
  }
}

/**
 * Utility for checking resource ownership
 * (e.g., user can only edit their own evidence documents)
 */
export function checkResourceOwnership(
  user: AuthenticatedUser,
  resourceOwnerId: string,
  allowAdminOverride: boolean = true
): boolean {
  // User owns the resource
  if (resourceOwnerId === user.profile.id) {
    return true;
  }

  // Admin/owner can override if allowed
  if (allowAdminOverride && user.currentMembership) {
    return ['owner', 'admin'].includes(user.currentMembership.role);
  }

  return false;
}

/**
 * Get workspace-scoped database client with enhanced error handling
 */
export function getWorkspaceScopedClient(workspaceId: string) {
  const { createWorkspaceScopedClient } = require('@/lib/auth/multi-tenant-auth');
  
  if (!workspaceId) {
    throw new Error('Workspace ID is required for database operations');
  }

  return createWorkspaceScopedClient(workspaceId);
}

/**
 * Standard workspace metadata for API responses
 */
export function getWorkspaceMetadata(user: AuthenticatedUser) {
  if (!user.currentWorkspace) {
    throw new Error('Current workspace not available');
  }

  return {
    id: user.currentWorkspace.id,
    name: user.currentWorkspace.name,
    slug: user.currentWorkspace.slug,
    subscription_tier: user.currentWorkspace.subscription_tier,
    user_role: user.currentMembership?.role || 'viewer'
  };
}

/**
 * Pagination utilities for API responses
 */
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export function extractPaginationParams(request: NextRequest): PaginationParams {
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20')));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  pagination: PaginationParams,
  additionalData?: Record<string, any>
) {
  const totalPages = Math.ceil(total / pagination.limit);
  
  return {
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages,
      hasNext: pagination.page < totalPages,
      hasPrev: pagination.page > 1
    },
    ...additionalData
  };
}
