import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const origin = requestUrl.origin
    const code = requestUrl.searchParams.get('code')
    const error = requestUrl.searchParams.get('error')
    const error_description = requestUrl.searchParams.get('error_description')
    // Check for redirect URL in the query params
    const returnUrl = requestUrl.searchParams.get('returnUrl')

    // If there's an error, redirect to login with error message
    if (error || error_description) {
      console.error('Auth error:', error, error_description)
      return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(error_description || error || 'Unknown error')}`)
    }

    if (!code) {
      console.error('No code in request')
      return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent('No code provided')}`)
    }

    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)

    // Get user data after session exchange
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent('Authentication failed')}`)
    }

    // If returnUrl is provided and valid, redirect there
    if (returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//')) {
      return NextResponse.redirect(`${origin}${returnUrl}`)
    }

    try {
      // Optimized user role query with explicit join
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          id, 
          email, 
          workspace_id,
          roles:role_id (
            id,
            name,
            capabilities
          )
        `)
        .eq('id', user.id)
        .single()

      if (userError) {
        console.error('Error fetching user data:', userError)
        throw userError
      }

      if (userData) {
        // First check if we can determine the user type from the roles join
        const userType = userData.roles?.capabilities?.type
        
        if (userType === 'system') {
          return NextResponse.redirect(`${origin}/system/dashboard`)
        } else if (userType === 'customer') {
          // For customer users, check if they need to select a workspace
          const hasWorkspace = !!userData.workspace_id
          if (hasWorkspace) {
            // Get associated customer for this workspace
            const { data: customerData } = await supabase
              .from('customers')
              .select('id')
              .eq('workspace_id', userData.workspace_id)
              .single()
            
            if (customerData) {
              // User has a valid customer workspace, go to dashboard
              return NextResponse.redirect(`${origin}/customer/dashboard`)
            }
          }
          // Either no workspace or no customer data, redirect to workspace selection
          return NextResponse.redirect(`${origin}/customer/select-workspace`)
        } 
        
        // If we get here, the user has a role but we couldn't determine the type
        // Try to infer from the role name as a fallback
        const roleName = userData.roles?.name?.toLowerCase() || ''
        if (roleName.includes('system')) {
          return NextResponse.redirect(`${origin}/system/dashboard`)
        } else if (roleName.includes('customer')) {
          return NextResponse.redirect(`${origin}/customer/select-workspace`)
        }
      }
      
      // Instead of duplicating role-based redirect logic, use our dedicated API endpoint
      return NextResponse.redirect(`${origin}/api/auth/redirect`)
    } catch (error) {
      console.error('Error handling user redirect:', error)
      // Default fallback - redirect to api endpoint which will handle role-based redirect
      return NextResponse.redirect(`${origin}/api/auth/redirect`)
    }
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent('Authentication failed')}`)
  }
}
