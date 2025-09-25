/**
 * WORKSPACE SUBSCRIPTION API - MULTI-TENANT
 * 
 * Manages workspace subscription operations:
 * - GET: Get current workspace subscription details
 * - POST: Update or change subscription tier
 */

import { NextRequest, NextResponse } from 'next/server';
import { withWorkspaceContext, Permission } from '@/lib/api/request-utils';

/**
 * GET: Retrieve workspace subscription details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  return withWorkspaceContext(
    request,
    Permission.VIEW_SUBSCRIPTION,
    async (context) => {
      console.log(`[API] GET /api/workspaces/${params.workspaceId}/subscription`);
      
      const { data: subscription, error } = await context.supabase
        .from('workspace_subscriptions')
        .select(`
          id,
          status,
          trial_end,
          current_period_start,
          current_period_end,
          cancel_at_period_end,
          stripe_subscription_id,
          subscription_tiers:tier_id (
            id,
            name,
            code,
            description,
            features,
            monthly_price,
            annual_price,
            max_team_members,
            max_workspaces,
            max_assessments
          )
        `)
        .eq('workspace_id', context.workspaceId)
        .single();
      
      if (error) {
        console.error('Error fetching subscription:', error);
        return { error: 'Failed to fetch subscription details' };
      }
      
      // Enhance with remaining trial days if applicable
      let enhancedData = { ...subscription };
      if (subscription.trial_end) {
        const now = new Date();
        const trialEndDate = new Date(subscription.trial_end);
        const diffTime = trialEndDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        enhancedData.trial_days_remaining = diffDays > 0 ? diffDays : 0;
      }
      
      return {
        data: enhancedData
      };
    }
  );
}

/**
 * POST: Update subscription tier
 * Note: In production, this would integrate with Stripe for payment processing
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  return withWorkspaceContext(
    request,
    Permission.MANAGE_SUBSCRIPTION,
    async (context) => {
      console.log(`[API] POST /api/workspaces/${params.workspaceId}/subscription`);
      
      try {
        const body = await context.requestBody;
        const { tierId } = body;
        
        if (!tierId) {
          return { error: 'Subscription tier ID is required', status: 400 };
        }
        
        // Verify the tier exists
        const { data: tier, error: tierError } = await context.supabase
          .from('subscription_tiers')
          .select('id, name, code, monthly_price')
          .eq('id', tierId)
          .single();
        
        if (tierError || !tier) {
          return { error: 'Invalid subscription tier', status: 400 };
        }
        
        // For free tier, simply update the database
        if (tier.monthly_price === 0) {
          const { error: updateError } = await context.supabase
            .from('workspace_subscriptions')
            .update({
              tier_id: tierId,
              status: 'active',
              updated_at: new Date().toISOString()
            })
            .eq('workspace_id', context.workspaceId);
          
          if (updateError) {
            console.error('Error updating subscription:', updateError);
            return { error: 'Failed to update subscription', status: 500 };
          }
          
          return {
            data: { tier: tier.name, status: 'active' },
            message: 'Subscription updated successfully'
          };
        }
        
        // For paid tiers, this is where we would integrate with Stripe
        // In this placeholder implementation, we'll just update the tier
        // In a real implementation, we would:
        // 1. Create or update a Stripe subscription
        // 2. Store the Stripe subscription ID
        // 3. Set up webhooks for subscription state changes
        
        const { error: updateError } = await context.supabase
          .from('workspace_subscriptions')
          .update({
            tier_id: tierId,
            status: 'active', // In reality, this would depend on Stripe payment success
            updated_at: new Date().toISOString(),
            // In production: Add stripe_subscription_id, current_period_start, etc.
          })
          .eq('workspace_id', context.workspaceId);
        
        if (updateError) {
          console.error('Error updating subscription:', updateError);
          return { error: 'Failed to update subscription', status: 500 };
        }
        
        return {
          data: { tier: tier.name, status: 'active' },
          message: 'Subscription updated successfully'
        };
      } catch (error) {
        console.error('Error processing subscription update:', error);
        return { error: 'Failed to process subscription update', status: 500 };
      }
    }
  );
}
