/**
 * Workspace Settings Page
 * 
 * Comprehensive workspace management UI with:
 * - Team management
 * - Subscription management
 * - Workspace details
 */

'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { useWorkspaceContext } from '@/lib/hooks/WorkspaceContext';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Users, CreditCard, Settings, AlertTriangle } from 'lucide-react';
import TeamManagement from '@/components/workspace/TeamManagement';
import SubscriptionManagement from '@/components/workspace/SubscriptionManagement';

interface WorkspaceDetailsForm {
  name: string;
  slug: string;
  industry: string;
}

export default function WorkspaceSettingsPage() {
  const [isUpdating, setIsUpdating] = useState(false);
  const { currentWorkspace, refreshWorkspaces } = useWorkspaceContext();
  
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<WorkspaceDetailsForm>({
    defaultValues: {
      name: currentWorkspace?.name || '',
      slug: currentWorkspace?.slug || '',
      industry: currentWorkspace?.industry || ''
    }
  });
  
  // Update form values when workspace changes
  React.useEffect(() => {
    if (currentWorkspace) {
      setValue('name', currentWorkspace.name || '');
      setValue('slug', currentWorkspace.slug || '');
      setValue('industry', currentWorkspace.industry || '');
    }
  }, [currentWorkspace, setValue]);
  
  const updateWorkspaceDetails = async (data: WorkspaceDetailsForm) => {
    if (!currentWorkspace?.id) return;
    
    setIsUpdating(true);
    
    try {
      const response = await fetch(`/api/workspaces/${currentWorkspace.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          industry: data.industry
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update workspace');
      }
      
      toast({
        title: 'Workspace Updated',
        description: 'Workspace details have been updated successfully',
      });
      
      // Refresh workspace data
      refreshWorkspaces();
      
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update workspace details',
        variant: 'destructive',
      });
      console.error('Workspace update error:', error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  // If no workspace selected
  if (!currentWorkspace) {
    return (
      <div className="container py-10">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No workspace selected</AlertTitle>
          <AlertDescription>
            Please select a workspace to manage workspace settings
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-2">{currentWorkspace.name} Settings</h1>
      <p className="text-muted-foreground mb-8">Manage your workspace settings and preferences</p>
      
      <Tabs defaultValue="team" className="space-y-8">
        <TabsList>
          <TabsTrigger value="team">
            <Users className="h-4 w-4 mr-2" />
            Team
          </TabsTrigger>
          <TabsTrigger value="subscription">
            <CreditCard className="h-4 w-4 mr-2" />
            Subscription
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="team" className="space-y-4">
          <TeamManagement />
        </TabsContent>
        
        <TabsContent value="subscription" className="space-y-4">
          <SubscriptionManagement />
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workspace Details</CardTitle>
              <CardDescription>
                View and update your workspace information
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit(updateWorkspaceDetails)}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Workspace Name</Label>
                  <Input 
                    id="name"
                    {...register('name', { required: 'Workspace name is required' })}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="slug">Workspace Slug</Label>
                  <Input 
                    id="slug"
                    disabled
                    {...register('slug')}
                  />
                  <p className="text-xs text-muted-foreground">
                    The workspace slug cannot be changed after creation
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input 
                    id="industry"
                    {...register('industry')}
                  />
                </div>
              </CardContent>
              
              <div className="p-6 pt-0 flex justify-end">
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
