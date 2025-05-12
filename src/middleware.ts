import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Bypass favicon requests to avoid 500 errors
  if (req.nextUrl.pathname === '/favicon.ico') {
    return NextResponse.next();
  }
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired - required for Server Components
  const { data: { session }, error } = await supabase.auth.getSession()

  // Define protected paths that require authentication
  const protectedPaths = [
    '/dashboard',
    '/compare',
    '/learning',
    '/profile',
    '/settings',
    '/monitoring'
  ]

  // System-only paths
  const systemPaths = [
    '/system',
    '/frameworks'
  ]

  // Customer-only paths
  const customerPaths = [
    '/customer'
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

  // Check if the current path starts with any of the protected paths
  const isProtectedPath = protectedPaths.some(p => path.startsWith(p))
  const isSystemPath = systemPaths.some(p => path.startsWith(p))
  const isCustomerPath = customerPaths.some(p => path.startsWith(p))
  const isPublicPath = publicPaths.some(p => path === p || path.startsWith('/api/'))

  // If trying to access a protected path while not authenticated
  if ((isProtectedPath || isSystemPath || isCustomerPath) && !session) {
    // Only redirect if not already on a public path
    if (!isPublicPath) {
      const redirectUrl = new URL('/auth/login', req.url)
      redirectUrl.searchParams.set('returnUrl', req.url)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Handle role-based access for system and customer paths
  if (session && !isPublicPath) {
    try {
      // Get user role from the session with optimized query
      const { data: userData, error } = await supabase
        .from('users')
        .select(`
          id, 
          role_id, 
          workspace_id,
          roles:role_id (
            id,
            name,
            capabilities
          )
        `)
        .eq('id', session.user.id)
        .single()

      if (userData?.roles) {
        // First try to get type from capabilities if available
        const role = userData.roles as { capabilities?: { type?: string }, name?: string };
        let userType = role.capabilities?.type;
        
        // If not found in capabilities, try to infer from role name
        if (!userType && role.name) {
          const roleName = role.name.toLowerCase();
          if (roleName.includes('system')) {
            userType = 'system';
          } else if (roleName.includes('customer')) {
            userType = 'customer';
          }
        }
        
        // Only enforce path-based access control for specific paths
        if (isSystemPath && userType !== 'system') {
          return NextResponse.redirect(new URL('/dashboard', req.url))
        }

        if (isCustomerPath && userType !== 'customer' && userType !== 'system') {
          return NextResponse.redirect(new URL('/dashboard', req.url))
        }

        // Handle root path redirection for authenticated users
        if (path === '/') {
          return NextResponse.redirect(new URL('/dashboard', req.url))
        }
      }
    } catch (error) {
      console.error('Error checking user role in middleware:', error)
      // On error, allow the request to continue
      return res
    }
  }

  // Add security headers
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'same-origin')
  res.headers.set(
    'Permissions-Policy',
    'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
  )

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
