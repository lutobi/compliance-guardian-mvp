/**
 * WORKSPACE TEAM MANAGEMENT API
 * 
 * Handles team member operations:
 * - GET: List team members
 * - POST: Invite new team member
 * - PUT: Update member role/permissions
 * - DELETE: Remove team member
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, requirePermission } from '@/lib/auth/multi-tenant-auth';

interface InviteTeamMemberRequest {
  email: string;
  role: 'viewer' | 'editor' | 'admin';
  message?: string;
}

interface UpdateMemberRequest {
  role: 'viewer' | 'editor' | 'admin';
  permissions?: string[];
}

/**
 * GET /api/workspace/[slug]/team
 * List all team members in the workspace
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const workspaceSlug = params.slug;
    
    // Require team management permission
    const user = await requirePermission('view_team', workspaceSlug);
    
    if (!user.currentWorkspace) {
      return NextResponse.json(
        { error: 'Workspace context required' },
        { status: 400 }
      );
    }

    // This would typically query the database
    // For now, return mock data structure
    const teamMembers = [
      {
        id: '1',
        user_id: user.profile.id,
        workspace_id: user.currentWorkspace.id,
        role: user.currentMembership?.role || 'owner',
        permissions: user.currentMembership?.permissions || [],
        invitation_status: 'active',
        invited_by: null,
        invited_at: '2024-01-01T00:00:00Z',
        joined_at: '2024-01-01T00:00:00Z',
        last_accessed_at: new Date().toISOString(),
        user: {
          id: user.profile.id,
          email: user.profile.email,
          name: user.profile.name,
          avatar_url: user.profile.avatar_url
        }
      }
    ];

    return NextResponse.json({
      success: true,
      data: {
        members: teamMembers,
        total: teamMembers.length,
        workspace: {
          id: user.currentWorkspace.id,
          name: user.currentWorkspace.name,
          slug: user.currentWorkspace.slug
        }
      }
    });

  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workspace/[slug]/team
 * Invite a new team member to the workspace
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const workspaceSlug = params.slug;
    const body: InviteTeamMemberRequest = await request.json();
    
    // Require team management permission
    const user = await requirePermission('manage_team', workspaceSlug);
    
    if (!user.currentWorkspace) {
      return NextResponse.json(
        { error: 'Workspace context required' },
        { status: 400 }
      );
    }

    // Validate request body
    if (!body.email || !body.role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['viewer', 'editor', 'admin'];
    if (!validRoles.includes(body.role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be viewer, editor, or admin' },
        { status: 400 }
      );
    }

    // Check if user already exists in workspace
    // This would typically query the database
    // For now, simulate the invitation process
    
    const invitationToken = generateInvitationToken();
    
    // In a real implementation, this would:
    // 1. Check if user exists in system
    // 2. Create workspace invitation record
    // 3. Send invitation email
    // 4. Return invitation details
    
    const invitation = {
      id: generateId(),
      workspace_id: user.currentWorkspace.id,
      email: body.email,
      role: body.role,
      token: invitationToken,
      status: 'pending',
      invited_by: user.profile.id,
      invited_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      message: body.message
    };

    return NextResponse.json({
      success: true,
      data: {
        invitation,
        invitation_url: `${process.env.NEXTAUTH_URL}/invite/accept?token=${invitationToken}`
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error inviting team member:', error);
    return NextResponse.json(
      { error: 'Failed to invite team member' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/workspace/[slug]/team/[memberId]
 * Update team member role or permissions
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const workspaceSlug = params.slug;
    const body: UpdateMemberRequest = await request.json();
    
    // Extract member ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const memberId = pathParts[pathParts.length - 1];
    
    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      );
    }
    
    // Require team management permission
    const user = await requirePermission('manage_team', workspaceSlug);
    
    // Validate request body
    if (!body.role) {
      return NextResponse.json(
        { error: 'Role is required' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['viewer', 'editor', 'admin'];
    if (!validRoles.includes(body.role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be viewer, editor, or admin' },
        { status: 400 }
      );
    }

    // In a real implementation, this would:
    // 1. Check if member exists in workspace
    // 2. Verify user has permission to change this member's role
    // 3. Update the member's role and permissions
    // 4. Log the change for audit
    
    const updatedMember = {
      id: memberId,
      role: body.role,
      permissions: body.permissions || [],
      updated_at: new Date().toISOString(),
      updated_by: user.profile.id
    };

    return NextResponse.json({
      success: true,
      data: { member: updatedMember }
    });

  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json(
      { error: 'Failed to update team member' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/workspace/[slug]/team/[memberId]
 * Remove team member from workspace
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const workspaceSlug = params.slug;
    
    // Extract member ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const memberId = pathParts[pathParts.length - 1];
    
    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      );
    }
    
    // Require team management permission
    const user = await requirePermission('manage_team', workspaceSlug);
    
    // In a real implementation, this would:
    // 1. Check if member exists in workspace
    // 2. Verify user has permission to remove this member
    // 3. Prevent removal of workspace owner
    // 4. Remove the member from workspace
    // 5. Log the removal for audit
    // 6. Optionally notify the removed member
    
    // Simulate member removal
    console.log(`Removing member ${memberId} from workspace ${workspaceSlug} by ${user.profile.email}`);

    return NextResponse.json({
      success: true,
      data: {
        message: 'Team member removed successfully',
        member_id: memberId,
        removed_by: user.profile.id,
        removed_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error removing team member:', error);
    return NextResponse.json(
      { error: 'Failed to remove team member' },
      { status: 500 }
    );
  }
}

// Helper functions
function generateInvitationToken(): string {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64url');
}

function generateId(): string {
  return crypto.randomUUID();
}
