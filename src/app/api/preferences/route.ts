/**
 * USER PREFERENCES API - MULTI-TENANT (STANDARDIZED)
 * 
 * Manages user preferences with workspace context:
 * - GET: Retrieve user preferences for current workspace
 * - POST: Create or update user preferences for current workspace
 * - DELETE: Reset user preferences to defaults
 */

import { NextRequest, NextResponse } from "next/server";
import { 
  withWorkspaceContext,
  getWorkspaceScopedClient 
} from "@/lib/api/request-utils";

/**
 * Default preferences values for new users
 */
const DEFAULT_PREFERENCES = {
  theme: 'light',
  notification_preferences: { email: true, inapp: true },
  display_preferences: { compactView: false, showHelpTips: true },
  dashboard_layout: { widgets: ['summary', 'recent', 'tasks'] }
};

/**
 * GET: Retrieve user preferences for current workspace
 */
export async function GET(request: NextRequest) {
  return withWorkspaceContext(request, 'view_workspace', async (context) => {
    const { user, workspaceContext } = context;
    console.log(`[API] GET /api/preferences - User: ${user.profile.email}`);

    try {
      // Get workspace-scoped database client
      const supabase = getWorkspaceScopedClient(workspaceContext.slug);
      
      // Get user preferences for this workspace
      const { data, error } = await supabase
        .from('workspace_preferences')
        .select('*')
        .eq('user_id', user.id)
        .eq('workspace_id', workspaceContext.id)
        .single();

      // If no preferences found, return defaults
      if (error || !data) {
        // Create default preferences object
        const defaultPrefs = {
          user_id: user.id,
          workspace_id: workspaceContext.id,
          ...DEFAULT_PREFERENCES
        };

        return NextResponse.json({
          data: defaultPrefs,
          workspace: workspaceContext,
          message: "Using default preferences"
        });
      }
      
      // Return found preferences
      return NextResponse.json({
        data,
        workspace: workspaceContext
      });

    } catch (error) {
      console.error("Error fetching user preferences:", error);
      throw new Error("Failed to retrieve user preferences");
    }
  });
}

/**
 * POST: Create or update user preferences
 */
export async function POST(request: NextRequest) {
  return withWorkspaceContext(request, 'view_workspace', async (context) => {
    const { user, workspaceContext, body } = context;
    console.log(`[API] POST /api/preferences - User: ${user.profile.email}`);

    try {
      // Get workspace-scoped database client
      const supabase = getWorkspaceScopedClient(workspaceContext.slug);
      
      // Input validation
      if (!body) {
        throw new Error("Request body is required");
      }
      
      // Check if preferences exist for this user in this workspace
      const { data: existingPrefs, error: queryError } = await supabase
        .from('workspace_preferences')
        .select('id')
        .eq('user_id', user.id)
        .eq('workspace_id', workspaceContext.id)
        .single();

      // Prepare preference data
      const preferencesData = {
        user_id: user.id,
        workspace_id: workspaceContext.id,
        ...body
      };

      let result;
      
      // Update or insert based on existence check
      if (existingPrefs?.id) {
        // Update existing preferences
        result = await supabase
          .from('workspace_preferences')
          .update(preferencesData)
          .eq('id', existingPrefs.id)
          .select('*')
          .single();
      } else {
        // Insert new preferences
        result = await supabase
          .from('workspace_preferences')
          .insert(preferencesData)
          .select('*')
          .single();
      }
      
      // Check for errors
      if (result.error) {
        throw new Error(`Failed to save preferences: ${result.error.message}`);
      }
      
      // Return saved preferences
      return NextResponse.json({
        data: result.data,
        workspace: workspaceContext,
        message: "Preferences saved successfully"
      });

    } catch (error) {
      console.error("Error saving user preferences:", error);
      throw new Error("Failed to save user preferences");
    }
  });
}

/**
 * DELETE: Reset user preferences to defaults
 */
export async function DELETE(request: NextRequest) {
  return withWorkspaceContext(request, 'view_workspace', async (context) => {
    const { user, workspaceContext } = context;
    console.log(`[API] DELETE /api/preferences - User: ${user.profile.email}`);

    try {
      // Get workspace-scoped database client
      const supabase = getWorkspaceScopedClient(workspaceContext.slug);
      
      // Delete preferences for this user in this workspace
      await supabase
        .from('workspace_preferences')
        .delete()
        .eq('user_id', user.id)
        .eq('workspace_id', workspaceContext.id);
      
      // Return default preferences
      return NextResponse.json({
        data: {
          user_id: user.id,
          workspace_id: workspaceContext.id,
          ...DEFAULT_PREFERENCES
        },
        workspace: workspaceContext,
        message: "Preferences reset to defaults"
      });

    } catch (error) {
      console.error("Error deleting user preferences:", error);
      throw new Error("Failed to reset user preferences");
    }
  });
}
