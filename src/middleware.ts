import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

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
    return res
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
  const response = NextResponse.next()
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'same-origin')
  response.headers.set(
    'Permissions-Policy',
    'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
  )

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
