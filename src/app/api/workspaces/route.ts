/**
 * WORKSPACES API - MULTI-TENANT (STANDARDIZED)
 * 
 * Manages workspace creation and listing:
 * - GET: List all workspaces the user has access to
 * - POST: Create a new workspace with self-service flow
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import slugify from 'slugify';
import { 
  withWorkspaceContext, 
  extractUser 
} from '@/lib/api/request-utils';

// Constants
const FREE_TIER_ID = '00000000-0000-0000-0000-000000000000'; // Replace with actual UUID

/**
 * Generate a unique slug from workspace name
 */
async function generateUniqueSlug(name: string, supabase: any): Promise<string> {
  // Generate base slug
  let slug = slugify(name, {
    lower: true,
    strict: true,
    trim: true
  });
  
  // Check if slug exists
  const { data } = await supabase
    .from('workspaces')
    .select('slug')
    .eq('slug', slug);
  
  // If slug exists, append a random string
  if (data && data.length > 0) {
    const randomStr = Math.random().toString(36).substring(2, 7);
    slug = `${slug}-${randomStr}`;
  }
  
  return slug;
}

/**
 * GET: List workspaces the user has access to
 */
export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user
    const user = await extractUser(request);
    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`[API] GET /api/workspaces - User: ${user.profile.email}`);
    
    // Use standard Supabase client (not workspace-scoped)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Fetch workspaces where user is a member
    const { data: workspaces, error } = await supabase
      .from('workspace_members')
      .select(`
        workspace_id,
        role,
        workspaces:workspace_id(
          id,
          name,
          slug,
          description,
          created_at,
          logo_url,
          onboarding_completed,
          settings
        )
      `)
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error fetching workspaces:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to fetch workspaces' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Format response
    const formattedWorkspaces = workspaces?.map(item => ({
      ...item.workspaces,
      role: item.role
    })) || [];
    
    return NextResponse.json({
      data: formattedWorkspaces,
      count: formattedWorkspaces.length,
      user: { id: user.id, email: user.profile.email }
    });
    
  } catch (error: any) {
    console.error('Workspace listing error:', error);
    return new NextResponse(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * POST: Create a new workspace
 */
export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const user = await extractUser(request);
    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`[API] POST /api/workspaces - User: ${user.profile.email}`);
    
    // Parse request body
    const body = await request.json();
    const { name, industry, companySize, settings } = body;
    
    if (!name || name.trim() === '') {
      return new NextResponse(
        JSON.stringify({ error: 'Workspace name is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Use standard Supabase client (not workspace-scoped)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Check user workspace creation limits
    const { data: userLimits } = await supabase
      .from('user_limits')
      .select('current_workspace_count, max_workspaces')
      .eq('user_id', user.id)
      .single();
    
    const currentCount = userLimits?.current_workspace_count || 0;
    const maxWorkspaces = userLimits?.max_workspaces || 1;
    
    if (currentCount >= maxWorkspaces) {
      return new NextResponse(
        JSON.stringify({ error: 'Maximum workspace limit reached for your account' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Start transaction
    const { data, error } = await supabase.rpc('create_workspace', {
      workspace_name: name,
      workspace_description: '',
      user_id: user.id,
      workspace_industry: industry || null,
      workspace_company_size: companySize || null,
      workspace_settings: settings || {},
    });

    if (error) {
      console.error('Error creating workspace:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to create workspace' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return NextResponse.json({
      data: data,
      message: 'Workspace created successfully'
    });
    
  } catch (error: any) {
    console.error('Workspace creation error:', error);
    return new NextResponse(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
