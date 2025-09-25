/**
 * MULTI-TENANT MIDDLEWARE
 * 
 * Handles authentication, workspace routing, and access control
 * for the multi-tenant architecture
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { isPlatformAdmin } from '@/lib/auth/admin';

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/signup', 
  '/auth/callback',
  '/api/auth/callback',
  '/api/test/seed-user',
  // Dev utilities (must be public so we can sync cookies before auth)
  '/dev'
];

// Authentication routes that redirect if already logged in
const authRoutes = ['/auth/login', '/auth/signup'];

// Routes that require workspace context
const workspaceRoutes = ['/workspace'];

// API routes that need special handling
const apiRoutes = ['/api'];

export async function middleware(request: NextRequest) {
  // Ensure Authorization and other headers are forwarded to downstream handlers
  const requestHeaders = new Headers(request.headers);
  const auth = request.headers.get('authorization') || request.headers.get('Authorization');
  if (auth && !requestHeaders.get('authorization')) {
    requestHeaders.set('authorization', auth);
  }

  const pathname = request.nextUrl.pathname;

  // Dev-only bypass for E2E tests when a special header or query param is present
  const isE2E = request.headers.get('x-e2e') === '1' || request.nextUrl.searchParams.get('e2e') === '1';
  try {
    console.log('[MW] NODE_ENV=%s isE2E=%s path=%s cookies=%s', process.env.NODE_ENV, String(isE2E), pathname, Array.from(request.cookies.getAll() || []).map(c => c.name).join(','));
  } catch {}
  if (process.env.NODE_ENV !== 'production' && isE2E) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Hard-bypass middleware for auth sync and dev helper routes
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/dev')
  ) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // We'll prepare response later after we possibly mutate requestHeaders for API routing
  let response = NextResponse.next({ request: { headers: requestHeaders } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Get authentication state
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  try {
    console.log('[MW] getUser user=%s authError=%s path=%s', user?.id || 'null', authError?.message || 'none', pathname);
  } catch {}

  // pathname already defined above

  // Check route types
  // Important: '/' would match every path with startsWith('/'), so handle it explicitly
  const isPublicRoute = pathname === '/' || publicRoutes.some(route => route !== '/' && (pathname === route || pathname.startsWith(route)));
  const isAuthRoute = authRoutes.includes(pathname);
  const isWorkspaceRoute = workspaceRoutes.some(route => pathname.startsWith(route));
  const isApiRoute = apiRoutes.some(route => pathname.startsWith(route));
  
  // Get the session to check if it's a new sign-in
  const { data: { session } } = await supabase.auth.getSession();
  const isNewSignIn = request.nextUrl.searchParams.has('isNewSignIn');

  // If user is not authenticated and trying to access protected route, redirect to login
  // But if Supabase cookies are present, allow pass-through to let client hydrate/session resolve
  const hasSbCookie = (() => {
    try {
      return (request.cookies.getAll() || []).some(c => c.name.startsWith('sb-'));
    } catch {
      return false;
    }
  })();
  if (!user && !publicRoutes.some(route => pathname.startsWith(route))) {
    if (hasSbCookie) {
      try { console.log('[MW] has sb-* cookie; skipping redirect to allow client hydration'); } catch {}
      return response;
    }
    // Don't redirect if we're already going to login
    if (!pathname.startsWith('/auth/login')) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirectedFrom', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  // Restrict all /system/* routes to platform admins only
  if (pathname.startsWith('/system')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    if (!isPlatformAdmin(user.email)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // Platform admins allowed to proceed
    return response;
  }

  // If user is authenticated and trying to access auth routes, redirect to dashboard
  if (user && authRoutes.some(route => pathname.startsWith(route))) {
    // Special case: if this is a callback route or has special params, don't redirect
    if (pathname.includes('/callback') || request.nextUrl.searchParams.has('code') || isNewSignIn) {
      return response;
    }

    // Platform admin bypass: go to system dashboard
    if (isPlatformAdmin(user.email)) {
      return NextResponse.redirect(new URL('/system/dashboard', request.url));
    }

    // For authenticated users accessing auth pages, redirect to their workspace dashboard if available
    try {
      const { getOrFetchUserSession } = await import('@/lib/auth/session-cache');
      const authenticatedUser = await getOrFetchUserSession(user.id, supabase);

      const targetMembership = authenticatedUser?.memberships?.find(m => m.invitation_status === 'active');
      const targetSlug = authenticatedUser?.currentWorkspace?.slug || targetMembership?.workspace?.slug;
      if (targetSlug) {
        return NextResponse.redirect(new URL(`/workspace/${targetSlug}/dashboard`, request.url));
      }
    } catch (e) {
      try { console.warn('[MW] Auth route redirect failed to resolve workspace, falling back:', e); } catch {}
    }

    // Fallback: workspace selection
    return NextResponse.redirect(new URL('/workspace/select', request.url));
  }

  // Handle workspace routes and authentication
  if (user && (isWorkspaceRoute || pathname === '/dashboard' || pathname.startsWith('/admin'))) {
    try {
      // Use cached session data to avoid database queries on every request
      const { getOrFetchUserSession } = await import('@/lib/auth/session-cache');
      const authenticatedUser = await getOrFetchUserSession(user.id, supabase);

      if (!authenticatedUser || !authenticatedUser.profile) {
        console.error('No profile found for user:', user.id);
        // Platform admin bypass onboarding
        if (isPlatformAdmin(user.email)) {
          return NextResponse.redirect(new URL('/system/dashboard', request.url));
        }
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }

      // If user has no workspace memberships, redirect to the selection page,
      // which also handles creation. Avoid redirect loops.
      if ((!authenticatedUser.memberships || authenticatedUser.memberships.length === 0) && pathname !== '/workspace/select') {
        return NextResponse.redirect(new URL('/workspace/select', request.url));
      }

      // Restrict Frameworks list to platform admins
      if (pathname.startsWith('/dashboard/frameworks') && !isPlatformAdmin(user.email)) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      // Handle workspace-specific routes
      const workspaceMatch = pathname.match(/^\/workspace\/([^\/]+)/);
      if (workspaceMatch) {
        const workspaceSlug = workspaceMatch[1];
        
        // Skip validation for workspace selection page
        if (workspaceSlug === 'select') {
          return response;
        }

        // Find membership for this workspace
        const membership = authenticatedUser.memberships.find(
          (m) => m.workspace.slug === workspaceSlug && m.invitation_status === 'active'
        );

        if (!membership) {
          console.error(`User ${user.id} does not have access to workspace: ${workspaceSlug}`);
          return NextResponse.redirect(new URL('/workspace/select', request.url));
        }

        // Add workspace context to headers for downstream use
        response.headers.set('x-workspace-id', membership.workspace.id);
        response.headers.set('x-workspace-slug', workspaceSlug);
        response.headers.set('x-workspace-role', membership.role);
        response.headers.set('x-user-id', user.id);

        // Role-based route protection
        const adminRoutes = ['/settings', '/team', '/billing'];
        const isAdminRoute = adminRoutes.some(route => 
          pathname.includes(route)
        );

        if (isAdminRoute && !['owner', 'admin'].includes(membership.role)) {
          return NextResponse.redirect(new URL(`/workspace/${workspaceSlug}/dashboard`, request.url));
        }
      }

      // Handle legacy dashboard redirect
      if (pathname === '/dashboard') {
        // Redirect to first available workspace
        const firstMembership = authenticatedUser.memberships.find(m => m.invitation_status === 'active');
        if (firstMembership) {
          return NextResponse.redirect(
            new URL(`/workspace/${firstMembership.workspace.slug}/dashboard`, request.url)
          );
        }
      }

      // Handle root redirect for authenticated users
      if (pathname === '/') {
        // Platform admin default landing
        if (isPlatformAdmin(user.email)) {
          return NextResponse.redirect(new URL('/system/dashboard', request.url));
        }
        try {
          const { getOrFetchUserSession } = await import('@/lib/auth/session-cache');
          const userForRoot = await getOrFetchUserSession(user.id, supabase);
          const targetMembership = userForRoot?.memberships?.find(m => m.invitation_status === 'active');
          const targetSlug = userForRoot?.currentWorkspace?.slug || targetMembership?.workspace?.slug;
          if (targetSlug) {
            return NextResponse.redirect(new URL(`/workspace/${targetSlug}/dashboard`, request.url));
          }
        } catch (e) {
          try { console.warn('[MW] Root redirect failed to resolve workspace, falling back:', e); } catch {}
        }
        return NextResponse.redirect(new URL('/workspace/select', request.url));
      }

    } catch (error) {
      console.error('Middleware error:', error);
      // On error, redirect to workspace selection to be safe
      return NextResponse.redirect(new URL('/workspace/select', request.url));
    }
  }

  // Handle API routes
  if (isApiRoute) {
    // Forward or inject Authorization into the forwarded REQUEST headers so route handlers can read it
    const incomingAuth = request.headers.get('authorization');
    if (incomingAuth) {
      requestHeaders.set('authorization', incomingAuth);
    } else if (session?.access_token) {
      requestHeaders.set('authorization', `Bearer ${session.access_token}`);
    } else if (user) {
      // If we have a user but no explicit token, try to obtain a fresh session token from cookies
      const { data: { session: freshSession } } = await supabase.auth.getSession();
      if (freshSession?.access_token) {
        requestHeaders.set('authorization', `Bearer ${freshSession.access_token}`);
      }
    }

    // Recreate response so the updated request headers are forwarded
    response = NextResponse.next({ request: { headers: requestHeaders } });

    // Add user context if authenticated to the RESPONSE headers (optional diagnostics)
    if (user) {
      response.headers.set('x-user-id', user.id);
      const workspaceSlug = request.nextUrl.searchParams.get('workspace');
      if (workspaceSlug) {
        response.headers.set('x-workspace-slug', workspaceSlug);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/ (all Next.js internal assets: static, image, webpack-hmr, chunks, etc.)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    // Exclude Next internals and public endpoints used for auth sync and dev helper during dev
    // Disable middleware for any /api/*, /auth/*, and /dev/* routes
    '/((?!_next/|favicon.ico|public/|api/|auth/|dev).*)',
  ],
};
