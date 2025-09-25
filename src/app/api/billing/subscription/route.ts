/**
 * BILLING SUBSCRIPTION API - MULTI-TENANT (MIGRATED TO NEW SECURE PATTERN)
 * 
 * Handles workspace subscription management with workspace context:
 * - GET: Retrieve current workspace subscription details
 * - PUT: Update workspace subscription plan
 */

import { NextRequest } from 'next/server';
import { 
  withWorkspaceContext, 
  getWorkspaceScopedClient,
  getWorkspaceMetadata 
} from '@/lib/api/request-utils';

export async function GET(request: NextRequest) {
  return withWorkspaceContext(request, 'view_billing', async (context) => {
    const { user } = context;
    
    console.log(`[API] GET /api/billing/subscription - User: ${user.profile.email}, Workspace: ${user.currentWorkspace?.name}`);

    // Get workspace-scoped database client
    const supabase = getWorkspaceScopedClient(user.currentWorkspace!.id);

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('workspace_id', user.currentWorkspace!.id)
      .maybeSingle();

    if (error) {
      console.error('Database error fetching subscription:', error);
      throw new Error(`Failed to fetch subscription: ${error.message}`);
    }

    return {
      success: true,
      data: {
        subscription: data,
        workspace: getWorkspaceMetadata(user)
      }
    };
  });
}

export async function PUT(request: NextRequest) {
  return withWorkspaceContext(request, 'manage_billing', async (context) => {
    const { user, body } = context;
    
    const { subscription_plan, stripe_customer_id, stripe_subscription_id } = body;
    if (!subscription_plan) {
      throw new Error('Subscription plan is required');
    }
    
    console.log(`[API] PUT /api/billing/subscription - User: ${user.profile.email}, Plan: ${subscription_plan}`);

    // Get workspace-scoped database client
    const supabase = getWorkspaceScopedClient(user.currentWorkspace!.id);
    
    // Prepare subscription data
    const subscriptionData = {
      workspace_id: user.currentWorkspace!.id,
      subscription_plan,
      stripe_customer_id,
      stripe_subscription_id,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('subscriptions')
      .upsert(subscriptionData, { 
        onConflict: 'workspace_id',
        ignoreDuplicates: false 
      })
      .select('*')
      .single();

    if (error) {
      console.error('Database error updating subscription:', error);
      throw new Error(`Failed to update subscription: ${error.message}`);
    }

    return {
      success: true,
      data: { 
        subscription: data,
        message: 'Subscription updated successfully'
      },
      workspace: getWorkspaceMetadata(user)
    };
  });
}
