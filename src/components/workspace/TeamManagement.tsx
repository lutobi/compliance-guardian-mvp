/**
 * Team Management Component
 * 
 * A comprehensive interface for managing workspace team members:
 * - Current member list with roles
 * - Role management
 * - Member removal
 * - Team invitations with tracking
 */

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, UserPlus, X, Mail, Calendar, Check, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useWorkspaceContext, useWorkspacePermission } from '@/lib/hooks/WorkspaceContext';

interface Member {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profiles: {
    email: string;
    first_name: string | null;
    last_name: string | null;
  };
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  expires_at: string;
  created_at: string;
  profiles: {
    email: string;
    first_name: string | null;
    last_name: string | null;
  };
}

interface InviteFormData {
  email: string;
  role: string;
}

// Helper to get initials from name
const getInitials = (firstName?: string | null, lastName?: string | null): string => {
  if (!firstName && !lastName) return '?';
  return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;
};

// Helper to format role for display
const formatRole = (role: string): string => {
  return role.charAt(0).toUpperCase() + role.slice(1);
};

// Helper to format date for display
const formatDate = (dateString: string): string => {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch (error) {
    return 'Invalid date';
  }
};

const TeamManagement = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [isLoadingInvites, setIsLoadingInvites] = useState(true);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [subscriptionLimits, setSubscriptionLimits] = useState({
    maxMembers: 0,
    currentCount: 0,
    canInviteMore: true
  });
  
  const { currentWorkspace } = useWorkspaceContext();
  const { hasPermission } = useWorkspacePermission('manage_team');
  
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<InviteFormData>({
    defaultValues: {
      email: '',
      role: 'member'
    }
  });
  
  // Fetch members
  const fetchMembers = async () => {
    if (!currentWorkspace?.id) return;
    
    setIsLoadingMembers(true);
    
    try {
      const response = await fetch(`/api/workspaces/${currentWorkspace.id}/members`);
      const result = await response.json();
      
      if (result.data) {
        setMembers(result.data);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      toast({
        title: 'Error',
        description: 'Failed to load team members',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingMembers(false);
    }
  };
  
  // Fetch invitations
  const fetchInvitations = async () => {
    if (!currentWorkspace?.id) return;
    
    setIsLoadingInvites(true);
    
    try {
      const response = await fetch(`/api/workspaces/${currentWorkspace.id}/invitations`);
      const result = await response.json();
      
      if (result.data) {
        setInvitations(result.data);
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pending invitations',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingInvites(false);
    }
  };
  
  // Fetch subscription limits
  const fetchSubscriptionLimits = async () => {
    if (!currentWorkspace?.id) return;
    
    try {
      const response = await fetch(`/api/workspaces/${currentWorkspace.id}/subscription`);
      const result = await response.json();
      
      if (result.data) {
        const maxMembers = result.data.subscription_tiers?.max_team_members || 1;
        const currentCount = members.length + invitations.filter(inv => inv.status === 'pending').length;
        
        setSubscriptionLimits({
          maxMembers,
          currentCount,
          canInviteMore: currentCount < maxMembers
        });
      }
    } catch (error) {
      console.error('Error fetching subscription limits:', error);
    }
  };
  
  // Send invitation
  const sendInvitation = async (data: InviteFormData) => {
    if (!currentWorkspace?.id) return;
    
    setIsSendingInvite(true);
    
    try {
      const response = await fetch(`/api/workspaces/${currentWorkspace.id}/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          role: data.role
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send invitation');
      }
      
      toast({
        title: 'Invitation Sent',
        description: `Invitation email sent to ${data.email}`,
      });
      
      // Reset form and refresh invitations
      reset();
      fetchInvitations();
      fetchSubscriptionLimits();
      
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send invitation',
        variant: 'destructive',
      });
      console.error('Invitation error:', error);
    } finally {
      setIsSendingInvite(false);
    }
  };
  
  // Cancel invitation
  const cancelInvitation = async (invitationId: string) => {
    if (!currentWorkspace?.id) return;
    
    try {
      const response = await fetch(`/api/workspaces/${currentWorkspace.id}/invitations`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invitationId
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to cancel invitation');
      }
      
      toast({
        title: 'Invitation Cancelled',
        description: 'The invitation has been cancelled',
      });
      
      // Refresh invitations
      fetchInvitations();
      fetchSubscriptionLimits();
      
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel invitation',
        variant: 'destructive',
      });
      console.error('Cancel invitation error:', error);
    }
  };
  
  // Update member role
  const updateMemberRole = async (memberId: string, newRole: string) => {
    if (!currentWorkspace?.id) return;
    
    try {
      const response = await fetch(`/api/workspaces/${currentWorkspace.id}/members/${memberId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: newRole
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update member role');
      }
      
      toast({
        title: 'Role Updated',
        description: 'Member role has been updated successfully',
      });
      
      // Refresh members
      fetchMembers();
      
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update role',
        variant: 'destructive',
      });
      console.error('Role update error:', error);
    }
  };
  
  // Remove member
  const removeMember = async (memberId: string) => {
    if (!currentWorkspace?.id) return;
    
    try {
      const response = await fetch(`/api/workspaces/${currentWorkspace.id}/members/${memberId}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to remove member');
      }
      
      toast({
        title: 'Member Removed',
        description: 'The team member has been removed from the workspace',
      });
      
      // Refresh members
      fetchMembers();
      fetchSubscriptionLimits();
      
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove member',
        variant: 'destructive',
      });
      console.error('Member removal error:', error);
    }
  };
  
  // Load data on component mount and workspace change
  useEffect(() => {
    if (currentWorkspace?.id) {
      fetchMembers();
      fetchInvitations();
    }
  }, [currentWorkspace?.id]);
  
  // Update subscription limits whenever members or invitations change
  useEffect(() => {
    fetchSubscriptionLimits();
  }, [members, invitations]);
  
  // If no workspace selected
  if (!currentWorkspace) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>No workspace selected</AlertTitle>
        <AlertDescription>
          Please select a workspace to manage team members
        </AlertDescription>
      </Alert>
    );
  }
  
  // No permission to manage team
  if (!hasPermission) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Permission Denied</AlertTitle>
        <AlertDescription>
          You do not have permission to manage team members in this workspace
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Team Management</CardTitle>
          <CardDescription>
            Manage team members and permissions for {currentWorkspace.name}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="members">
            <TabsList className="mb-4">
              <TabsTrigger value="members">
                Members ({isLoadingMembers ? '...' : members.length})
              </TabsTrigger>
              <TabsTrigger value="invitations">
                Invitations ({isLoadingInvites ? '...' : invitations.filter(i => i.status === 'pending').length})
              </TabsTrigger>
            </TabsList>
            
            {/* Members Tab */}
            <TabsContent value="members">
              <div className="space-y-4">
                {isLoadingMembers ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : members.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      No team members found. Invite your first team member below.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4 border rounded-md">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarFallback>
                              {getInitials(member.profiles.first_name, member.profiles.last_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {member.profiles.first_name} {member.profiles.last_name || ''}
                            </p>
                            <p className="text-sm text-muted-foreground">{member.profiles.email}</p>
                            <div className="flex items-center mt-1">
                              <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                Joined {formatDate(member.joined_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge variant={member.role === 'owner' ? 'default' : 'outline'}>
                            {formatRole(member.role)}
                          </Badge>
                          
                          {/* Role management (disabled for owners) */}
                          {member.role !== 'owner' && (
                            <Select
                              defaultValue={member.role}
                              onValueChange={(value) => updateMemberRole(member.id, value)}
                              disabled={!hasPermission}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="member">Member</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                          
                          {/* Remove button (disabled for owners) */}
                          {member.role !== 'owner' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMember(member.id)}
                              disabled={!hasPermission}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Invitations Tab */}
            <TabsContent value="invitations">
              <div className="space-y-4">
                {isLoadingInvites ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : invitations.filter(i => i.status === 'pending').length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      No pending invitations. Invite team members using the form below.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {invitations
                      .filter(i => i.status === 'pending')
                      .map((invitation) => (
                        <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-md">
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarFallback>
                                <Mail className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{invitation.email}</p>
                              <Badge variant="outline">{formatRole(invitation.role)}</Badge>
                              <div className="flex items-center mt-1">
                                <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  Expires {formatDate(invitation.expires_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => cancelInvitation(invitation.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Invite Form */}
      <Card>
        <CardHeader>
          <CardTitle>Invite Team Members</CardTitle>
          <CardDescription>
            Send invitations to collaborate in your workspace
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit(sendInvitation)}>
          <CardContent>
            {!subscriptionLimits.canInviteMore && (
              <Alert className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Team Member Limit Reached</AlertTitle>
                <AlertDescription>
                  You have reached the maximum number of team members ({subscriptionLimits.maxMembers}) 
                  for your current subscription. Upgrade your plan to add more team members.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@example.com"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  disabled={!subscriptionLimits.canInviteMore || isSendingInvite}
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="role">Role</Label>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!subscriptionLimits.canInviteMore || isSendingInvite}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button
              type="submit"
              disabled={!subscriptionLimits.canInviteMore || isSendingInvite}
            >
              {isSendingInvite ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Send Invitation
                </>
              )}
            </Button>
            
            {subscriptionLimits.maxMembers > 0 && (
              <p className="ml-4 text-sm text-muted-foreground">
                {subscriptionLimits.currentCount} of {subscriptionLimits.maxMembers} team members
              </p>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default TeamManagement;
