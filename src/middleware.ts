import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired - required for Server Components
  const { data: { session }, error } = await supabase.auth.getSession()

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

  // Check if the current path starts with any of the protected paths
  const isProtectedPath = protectedPaths.some(p => path.startsWith(p))
  const isPublicPath = publicPaths.some(p => path === p || path.startsWith('/api/'))

  // If trying to access a protected path while not authenticated
  if (isProtectedPath && !session) {
    const redirectUrl = new URL('/auth/login', req.url)
    redirectUrl.searchParams.set('returnUrl', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // If already authenticated and trying to access auth pages
  if (session && (path === '/auth/login' || path === '/auth/signup')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
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
