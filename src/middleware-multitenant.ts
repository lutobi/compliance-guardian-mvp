/**
 * MULTI-TENANT MIDDLEWARE
 * 
 * This middleware handles:
 * - Authentication verification
 * - Workspace-based routing
 * - Role-based access control
 * - Request context injection
 */

import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

// ============================================================================
// ROUTE CONFIGURATION
// ============================================================================

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/auth/callback',
  '/auth/reset-password',
  '/auth/verify-email',
  '/api/auth/callback',
  '/invite/accept', // Invitation acceptance page
  '/privacy',
  '/terms',
  '/pricing'
];

// Routes that require authentication but no workspace context
const AUTH_ONLY_ROUTES = [
  '/onboarding',
  '/workspace/select',
  '/workspace/create',
  '/profile'
];

// System admin routes (system workspace only)
const SYSTEM_ROUTES = [
  '/system',
  '/admin'
];

// Workspace-scoped routes pattern: /workspace/[slug]/...
const WORKSPACE_ROUTE_PATTERN = /^\/workspace\/([^\/]+)(\/.*)?$/;

// API routes that need workspace context
const WORKSPACE_API_PATTERN = /^\/api\/workspace\/([^\/]+)(\/.*)?$/;

// ============================================================================
// MIDDLEWARE IMPLEMENTATION
// ============================================================================

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  
  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res: response });

  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    // ========================================================================
    // HANDLE PUBLIC ROUTES
    // ========================================================================
    
    const isPublicRoute = PUBLIC_ROUTES.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );

    if (isPublicRoute) {
      // Redirect authenticated users away from auth pages
      if (session && (pathname.startsWith('/auth/') || pathname === '/')) {
        return NextResponse.redirect(new URL('/workspace/select', request.url));
      }
      return response;
    }

    // ========================================================================
    // REQUIRE AUTHENTICATION FOR ALL OTHER ROUTES
    // ========================================================================

    if (!session) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname + request.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }

    // ========================================================================
    // HANDLE AUTH-ONLY ROUTES (NO WORKSPACE REQUIRED)
    // ========================================================================

    const isAuthOnlyRoute = AUTH_ONLY_ROUTES.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );

    if (isAuthOnlyRoute) {
      return response;
    }

    // ========================================================================
    // HANDLE WORKSPACE-SCOPED ROUTES
    // ========================================================================

    const workspaceMatch = pathname.match(WORKSPACE_ROUTE_PATTERN);
    const apiWorkspaceMatch = pathname.match(WORKSPACE_API_PATTERN);
    
    if (workspaceMatch || apiWorkspaceMatch) {
      const workspaceSlug = workspaceMatch?.[1] || apiWorkspaceMatch?.[1];
      
      if (!workspaceSlug) {
        return NextResponse.redirect(new URL('/workspace/select', request.url));
      }

      // Verify user has access to this workspace
      const { data: membership, error: membershipError } = await supabase
        .from('workspace_members')
        .select(`
          role,
          invitation_status,
          workspace:workspaces!inner (
            id,
            slug,
            name,
            type,
            subscription_status
          )
        `)
        .eq('user_id', session.user.id)
        .eq('invitation_status', 'active')
        .eq('workspaces.slug', workspaceSlug)
        .single();

      if (membershipError || !membership) {
        // User doesn't have access to this workspace
        const errorUrl = new URL('/unauthorized', request.url);
        errorUrl.searchParams.set('reason', 'workspace_access');
        errorUrl.searchParams.set('workspace', workspaceSlug);
        return NextResponse.redirect(errorUrl);
      }

      // Check if workspace is suspended
      if (membership.workspace.subscription_status === 'suspended') {
        const suspendedUrl = new URL('/workspace/suspended', request.url);
        suspendedUrl.searchParams.set('workspace', workspaceSlug);
        return NextResponse.redirect(suspendedUrl);
      }

      // Add workspace context to request headers for API routes
      response.headers.set('x-workspace-id', membership.workspace.id);
      response.headers.set('x-workspace-slug', workspaceSlug);
      response.headers.set('x-user-role', membership.role);

      return response;
    }

    // ========================================================================
    // HANDLE SYSTEM ADMIN ROUTES
    // ========================================================================

    const isSystemRoute = SYSTEM_ROUTES.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );

    if (isSystemRoute) {
      // Verify user has system access
      const { data: systemMembership } = await supabase
        .from('workspace_members')
        .select(`
          role,
          workspace:workspaces!inner (type)
        `)
        .eq('user_id', session.user.id)
        .eq('invitation_status', 'active')
        .eq('workspaces.type', 'system')
        .single();

      if (!systemMembership) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      return response;
    }

    // ========================================================================
    // HANDLE LEGACY ROUTES - REDIRECT TO WORKSPACE SELECTION
    // ========================================================================

    // If user is accessing old routes without workspace context, redirect to workspace selection
    const legacyRoutes = ['/dashboard', '/assessments', '/compliance', '/settings'];
    const isLegacyRoute = legacyRoutes.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );

    if (isLegacyRoute) {
      return NextResponse.redirect(new URL('/workspace/select', request.url));
    }

    // ========================================================================
    // DEFAULT: REDIRECT TO WORKSPACE SELECTION
    // ========================================================================

    return NextResponse.redirect(new URL('/workspace/select', request.url));

  } catch (error) {
    console.error('Middleware error:', error);
    
    // On error, redirect to login to be safe
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('error', 'middleware_error');
    return NextResponse.redirect(loginUrl);
  }
}

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
