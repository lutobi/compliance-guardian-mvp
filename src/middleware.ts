import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default withAuth(
  async function middleware(req: NextRequest) {
    const supabase = createMiddlewareClient({ req, res: NextResponse.next() })

    // Refresh session if expired - required for Server Components
    const { data: { session } } = await supabase.auth.getSession()

    // Define protected paths that require authentication
    const protectedPaths = [
      '/dashboard',
      '/frameworks',
      '/compare',
      '/learning',
      '/profile',
      '/settings',
      '/monitoring'
    ]

    // Public paths that should always be accessible
    const publicPaths = [
      '/',
      '/auth/login',
      '/auth/signup',
      '/auth/verify-email',
      '/auth/callback',
      '/icon'
    ]

    const path = req.nextUrl.pathname

    // Allow public paths
    if (publicPaths.some(p => path === p || path.startsWith('/api/'))) {
      return NextResponse.next()
    }

    // Check if the current path starts with any of the protected paths
    const isProtectedPath = protectedPaths.some(p => path.startsWith(p))

    // If trying to access a protected path while not authenticated
    if (isProtectedPath && !session) {
      const redirectUrl = new URL('/auth/login', req.url)
      redirectUrl.searchParams.set('returnUrl', req.url)
      return NextResponse.redirect(redirectUrl)
    }

    // Add security headers
    const res = NextResponse.next()
    res.headers.set('X-Content-Type-Options', 'nosniff')
    res.headers.set('X-Frame-Options', 'DENY')
    res.headers.set('X-XSS-Protection', '1; mode=block')
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-url", req.url);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  },
  {
    // Ensure these paths are accessible without authentication
    publicRoutes: ["/", "/auth/login", "/auth/signup", "/auth/callback"],
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
