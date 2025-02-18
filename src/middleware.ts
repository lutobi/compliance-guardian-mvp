import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient(
    { req, res },
    {
      supabaseUrl: 'https://nrfpsbbkynykubcaarpg.supabase.co',
      supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZnBzYmJreW55a3ViY2FhcnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIyMzA0MjMsImV4cCI6MjA0NzgwNjQyM30.OkcS6Q-4fGKwpAoYfG3UTjK4UDQEisXTT-YSq1Ny_kE'
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Auth condition
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/auth/login'
    redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/frameworks/:path*',
    '/assessments/:path*',
  ],
}
