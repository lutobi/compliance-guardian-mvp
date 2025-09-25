/**
 * Subscription Management Component
 * 
 * A comprehensive interface for managing workspace subscription plans:
 * - Current subscription details
 * - Plan comparison
 * - Upgrade/downgrade options
 * - Billing information
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, CreditCard, Calendar, Loader2, Shield, Users, CheckCheck } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { useWorkspaceContext, useWorkspacePermission } from '@/lib/hooks/WorkspaceContext';

interface SubscriptionTier {
  id: string;
  name: string;
  code: string;
  description: string;
  features: string[];
  monthly_price: number;
  annual_price: number | null;
  max_team_members: number;
  max_workspaces: number;
  max_assessments: number | null;
}

interface SubscriptionDetails {
  id: string;
  status: string;
  trial_end: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  stripe_subscription_id: string | null;
  trial_days_remaining?: number;
  subscription_tiers: SubscriptionTier;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    return 'Invalid date';
  }
};

const SubscriptionManagement = () => {
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [availableTiers, setAvailableTiers] = useState<SubscriptionTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { currentWorkspace } = useWorkspaceContext();
  const { hasPermission } = useWorkspacePermission('manage_subscription');
  const canViewSubscription = useWorkspacePermission('view_subscription').hasPermission;
  
  // Fetch subscription details
  const fetchSubscriptionDetails = async () => {
    if (!currentWorkspace?.id) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/workspaces/${currentWorkspace.id}/subscription`);
      const result = await response.json();
      
      if (result.data) {
        setSubscription(result.data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscription details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch available subscription tiers
  const fetchAvailableTiers = async () => {
    try {
      const response = await fetch('/api/subscription-tiers');
      const result = await response.json();
      
      if (result.data) {
        setAvailableTiers(result.data);
      }
    } catch (error) {
      console.error('Error fetching subscription tiers:', error);
    }
  };
  
  // Change subscription tier
  const changeSubscriptionTier = async (tierId: string) => {
    if (!currentWorkspace?.id) return;
    
    setIsUpdating(true);
    
    try {
      const response = await fetch(`/api/workspaces/${currentWorkspace.id}/subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tierId
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update subscription');
      }
      
      toast({
        title: 'Subscription Updated',
        description: 'Your subscription has been updated successfully',
      });
      
      // Refresh subscription details
      fetchSubscriptionDetails();
      
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update subscription',
        variant: 'destructive',
      });
      console.error('Subscription update error:', error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Load data on component mount and workspace change
  useEffect(() => {
    fetchAvailableTiers();
    if (currentWorkspace?.id) {
      fetchSubscriptionDetails();
    }
  }, [currentWorkspace?.id]);
  
  // If no workspace selected
  if (!currentWorkspace) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>No workspace selected</AlertTitle>
        <AlertDescription>
          Please select a workspace to manage subscription
        </AlertDescription>
      </Alert>
    );
  }
  
  // No permission to view subscription
  if (!canViewSubscription) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Permission Denied</AlertTitle>
        <AlertDescription>
          You do not have permission to view subscription details in this workspace
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Details</CardTitle>
          <CardDescription>
            Current subscription plan for {currentWorkspace.name}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : subscription ? (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-xl font-semibold flex items-center">
                    {subscription.subscription_tiers.name} Plan
                    <Badge className="ml-3" variant={subscription.status === 'active' ? 'default' : 'outline'}>
                      {subscription.status.toUpperCase()}
                    </Badge>
                  </h3>
                  <p className="text-muted-foreground">{subscription.subscription_tiers.description}</p>
                </div>
                
                <div className="mt-4 md:mt-0">
                  <p className="text-3xl font-bold">
                    {formatCurrency(subscription.subscription_tiers.monthly_price)}<span className="text-sm font-normal text-muted-foreground">/month</span>
                  </p>
                  {subscription.subscription_tiers.annual_price && (
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(subscription.subscription_tiers.annual_price)}/year
                    </p>
                  )}
                </div>
              </div>
              
              {subscription.trial_end && subscription.trial_days_remaining && subscription.trial_days_remaining > 0 && (
                <Alert>
                  <Calendar className="h-4 w-4" />
                  <AlertTitle>Trial Period</AlertTitle>
                  <AlertDescription>
                    Your trial ends in {subscription.trial_days_remaining} days on {formatDate(subscription.trial_end)}.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Team Members</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      <Users className="inline h-4 w-4 mr-1" />
                      {subscription.subscription_tiers.max_team_members} members
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Workspaces</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      <Shield className="inline h-4 w-4 mr-1" />
                      {subscription.subscription_tiers.max_workspaces} workspaces
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Billing Period</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      {subscription.current_period_end ? 
                        formatDate(subscription.current_period_end) : 
                        'Not applicable'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-2">Features</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {subscription.subscription_tiers.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCheck className="h-4 w-4 mr-2 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>No Subscription Found</AlertTitle>
              <AlertDescription>
                No active subscription found for this workspace.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      {/* Subscription Plans */}
      {hasPermission && (
        <Card>
          <CardHeader>
            <CardTitle>Available Plans</CardTitle>
            <CardDescription>
              Compare subscription plans and upgrade your workspace
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-6">
              <Tabs defaultValue="monthly">
                <TabsList className="mb-4">
                  <TabsTrigger value="monthly">Monthly Billing</TabsTrigger>
                  <TabsTrigger value="annual">Annual Billing</TabsTrigger>
                </TabsList>
                
                <TabsContent value="monthly" className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {availableTiers.map((tier) => (
                      <Card key={tier.id} className={tier.id === subscription?.subscription_tiers.id ? 'border-primary' : ''}>
                        <CardHeader className="pb-2">
                          <CardTitle>{tier.name}</CardTitle>
                          <CardDescription>{tier.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="text-2xl font-bold mb-4">
                            {formatCurrency(tier.monthly_price)}<span className="text-sm font-normal text-muted-foreground">/month</span>
                          </p>
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-2" />
                              <span className="text-sm">{tier.max_team_members} team members</span>
                            </div>
                            <div className="flex items-center">
                              <Shield className="h-4 w-4 mr-2" />
                              <span className="text-sm">{tier.max_workspaces} workspaces</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            {tier.features.slice(0, 4).map((feature, index) => (
                              <div key={index} className="flex items-center">
                                <CheckCircle className="h-3 w-3 mr-2 text-primary" />
                                <span className="text-xs">{feature}</span>
                              </div>
                            ))}
                            {tier.features.length > 4 && (
                              <p className="text-xs text-muted-foreground mt-1">+ {tier.features.length - 4} more features</p>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button
                            className="w-full"
                            variant={tier.id === subscription?.subscription_tiers.id ? 'outline' : 'default'}
                            disabled={tier.id === subscription?.subscription_tiers.id || isUpdating}
                            onClick={() => changeSubscriptionTier(tier.id)}
                          >
                            {isUpdating && tier.id !== subscription?.subscription_tiers.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                              </>
                            ) : tier.id === subscription?.subscription_tiers.id ? (
                              'Current Plan'
                            ) : (
                              tier.monthly_price > (subscription?.subscription_tiers.monthly_price || 0) ? 
                                'Upgrade' : 'Downgrade'
                            )}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="annual" className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {availableTiers.map((tier) => (
                      <Card key={tier.id} className={tier.id === subscription?.subscription_tiers.id ? 'border-primary' : ''}>
                        <CardHeader className="pb-2">
                          <CardTitle>{tier.name}</CardTitle>
                          <CardDescription>{tier.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="text-2xl font-bold mb-4">
                            {formatCurrency(tier.annual_price ? tier.annual_price / 12 : tier.monthly_price)}
                            <span className="text-sm font-normal text-muted-foreground">/month</span>
                          </p>
                          {tier.annual_price && (
                            <Badge variant="outline" className="mb-4">
                              Save {Math.round((1 - tier.annual_price / (tier.monthly_price * 12)) * 100)}%
                            </Badge>
                          )}
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-2" />
                              <span className="text-sm">{tier.max_team_members} team members</span>
                            </div>
                            <div className="flex items-center">
                              <Shield className="h-4 w-4 mr-2" />
                              <span className="text-sm">{tier.max_workspaces} workspaces</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            {tier.features.slice(0, 4).map((feature, index) => (
                              <div key={index} className="flex items-center">
                                <CheckCircle className="h-3 w-3 mr-2 text-primary" />
                                <span className="text-xs">{feature}</span>
                              </div>
                            ))}
                            {tier.features.length > 4 && (
                              <p className="text-xs text-muted-foreground mt-1">+ {tier.features.length - 4} more features</p>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button
                            className="w-full"
                            variant={tier.id === subscription?.subscription_tiers.id ? 'outline' : 'default'}
                            disabled={tier.id === subscription?.subscription_tiers.id || isUpdating}
                            onClick={() => changeSubscriptionTier(tier.id)}
                          >
                            {isUpdating && tier.id !== subscription?.subscription_tiers.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                              </>
                            ) : tier.id === subscription?.subscription_tiers.id ? (
                              'Current Plan'
                            ) : (
                              tier.monthly_price > (subscription?.subscription_tiers.monthly_price || 0) ? 
                                'Upgrade' : 'Downgrade'
                            )}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubscriptionManagement;
