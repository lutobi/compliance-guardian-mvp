import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  console.log('Middleware - Request path:', req.nextUrl.pathname);
  console.log('Middleware - Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired
  await supabase.auth.getSession()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log('Middleware - User:', user ? 'Authenticated' : 'Not authenticated');

  // Auth routes handling
  if (req.nextUrl.pathname.startsWith('/auth')) {
    if (user) {
      // If user is signed in and tries to access auth pages, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    // Allow access to auth pages for non-authenticated users
    return res
  }

  // Protected routes handling
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      // If user is not signed in and tries to access dashboard, redirect to login
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/auth/login'
      redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
    // Allow access to dashboard for authenticated users
    return res
  }

  // Public routes - allow access
  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
