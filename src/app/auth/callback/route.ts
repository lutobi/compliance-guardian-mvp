import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const error = requestUrl.searchParams.get('error')
    const error_description = requestUrl.searchParams.get('error_description')

    // If there's an error, redirect to login with error message
    if (error || error_description) {
      console.error('Auth error:', error, error_description)
      return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=${encodeURIComponent(error_description || error || 'Unknown error')}`)
    }

    if (!code) {
      console.error('No code in request')
      return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=${encodeURIComponent('No code provided')}`)
    }

    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)

    return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=${encodeURIComponent('Authentication failed')}`)
  }
}
