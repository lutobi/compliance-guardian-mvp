/**
 * WORKSPACE SETTINGS PAGE
 * 
 * Allows workspace owners/admins to manage workspace configuration,
 * team members, billing, and general settings
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMultiTenantAuth } from '@/lib/auth/MultiTenantContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Settings,
  Users,
  CreditCard,
  Bell,
  Shield,
  Building,
  Mail,
  Trash2,
  Save,
  Plus,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface WorkspaceSettings {
  name: string;
  industry: string;
  company_size: string;
  billing_email: string;
  features: string[];
  settings: {
    notifications_enabled: boolean;
    auto_backup: boolean;
    data_retention_days: number;
    require_2fa: boolean;
  };
}

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  invitation_status: string;
  user: {
    name: string;
    email: string;
    avatar_url?: string;
  };
  joined_at: string;
}

export default function WorkspaceSettings() {
  const params = useParams();
  const router = useRouter();
  const { 
    user, 
    currentWorkspace, 
    currentMembership, 
    hasPermission,
    loading 
  } = useMultiTenantAuth();

  const [settings, setSettings] = useState<WorkspaceSettings | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('viewer');
  const [activeTab, setActiveTab] = useState('general');

  const workspaceSlug = params.slug as string;

  // Check permissions
  const canManageSettings = hasPermission('manage_settings');
  const canManageTeam = hasPermission('manage_team');
  const canManageBilling = hasPermission('manage_billing');

  useEffect(() => {
    if (currentWorkspace && !loading) {
      if (!canManageSettings) {
        toast.error('You do not have permission to access workspace settings');
        router.push(`/workspace/${workspaceSlug}/dashboard`);
        return;
      }
      loadWorkspaceSettings();
      loadTeamMembers();
    }
  }, [currentWorkspace, loading, canManageSettings]);

  const loadWorkspaceSettings = async () => {
    try {
      // This would typically be an API call
      // For now, using mock data based on currentWorkspace
      const mockSettings: WorkspaceSettings = {
        name: currentWorkspace?.name || '',
        industry: currentWorkspace?.industry || '',
        company_size: currentWorkspace?.company_size || '',
        billing_email: currentWorkspace?.billing_email || '',
        features: currentWorkspace?.features || [],
        settings: {
          notifications_enabled: true,
          auto_backup: true,
          data_retention_days: 365,
          require_2fa: false
        }
      };
      setSettings(mockSettings);
    } catch (error) {
      console.error('Error loading workspace settings:', error);
      toast.error('Failed to load workspace settings');
    }
  };

  const loadTeamMembers = async () => {
    try {
      // This would typically be an API call
      // For now, using mock data
      const mockTeamMembers: TeamMember[] = [
        {
          id: '1',
          user_id: user?.profile.id || '',
          role: 'owner',
          invitation_status: 'active',
          user: {
            name: user?.profile.name || 'Current User',
            email: user?.profile.email || ''
          },
          joined_at: '2024-01-01'
        }
      ];
      setTeamMembers(mockTeamMembers);
    } catch (error) {
      console.error('Error loading team members:', error);
      toast.error('Failed to load team members');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      
      // This would typically be an API call to update workspace settings
      // For now, just show success message
      toast.success('Workspace settings updated successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save workspace settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInviteTeamMember = async () => {
    if (!newMemberEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      // This would typically be an API call to send invitation
      toast.success(`Invitation sent to ${newMemberEmail}`);
      setNewMemberEmail('');
    } catch (error) {
      console.error('Error inviting team member:', error);
      toast.error('Failed to send invitation');
    }
  };

  const handleRemoveTeamMember = async (memberId: string) => {
    try {
      // This would typically be an API call to remove team member
      setTeamMembers(members => members.filter(m => m.id !== memberId));
      toast.success('Team member removed');
    } catch (error) {
      console.error('Error removing team member:', error);
      toast.error('Failed to remove team member');
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings, permission: 'manage_settings' },
    { id: 'team', label: 'Team', icon: Users, permission: 'manage_team' },
    { id: 'billing', label: 'Billing', icon: CreditCard, permission: 'manage_billing' },
    { id: 'security', label: 'Security', icon: Shield, permission: 'manage_settings' }
  ];

  const availableTabs = tabs.filter(tab => hasPermission(tab.permission));

  if (loading || loadingData || !settings) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Workspace Settings</h1>
        <p className="text-gray-600">Manage your workspace configuration and team</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {availableTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Workspace Information</span>
              </CardTitle>
              <CardDescription>
                Basic information about your workspace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Workspace Name</Label>
                  <Input
                    id="name"
                    data-testid="workspace-name"
                    value={settings.name}
                    onChange={(e) => setSettings({...settings, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={settings.industry}
                    onChange={(e) => setSettings({...settings, industry: e.target.value})}
                    placeholder="e.g., Technology, Healthcare"
                  />
                </div>
                <div>
                  <Label htmlFor="company_size">Company Size</Label>
                  <select
                    id="company_size"
                    value={settings.company_size}
                    onChange={(e) => setSettings({...settings, company_size: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-1000">201-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="billing_email">Billing Email</Label>
                  <Input
                    id="billing_email"
                    type="email"
                    value={settings.billing_email}
                    onChange={(e) => setSettings({...settings, billing_email: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveSettings} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'team' && canManageTeam && (
        <div className="space-y-6">
          {/* Invite Member */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Invite Team Member</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter email address"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="flex-1"
                />
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
                <Button onClick={handleInviteTeamMember}>
                  <Mail className="h-4 w-4 mr-2" />
                  Invite
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Manage your workspace team members and their roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-white font-medium">
                          {member.user.name?.[0] || member.user.email[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{member.user.name}</p>
                        <p className="text-sm text-gray-500">{member.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={member.role === 'owner' ? 'default' : 'outline'}
                        className="capitalize"
                      >
                        {member.role}
                      </Badge>
                      {member.role !== 'owner' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveTeamMember(member.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'billing' && canManageBilling && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Subscription & Billing</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg bg-gray-50">
                <h3 className="font-medium">Current Plan</h3>
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <Badge className="capitalize">
                      {currentWorkspace?.subscription_tier || 'Free'}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-1">
                      Status: {currentWorkspace?.subscription_status || 'active'}
                    </p>
                  </div>
                  <Button variant="outline">Upgrade Plan</Button>
                </div>
              </div>
              
              <div>
                <Label>Billing Email</Label>
                <Input
                  value={settings.billing_email}
                  onChange={(e) => setSettings({...settings, billing_email: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-600">Require all team members to use 2FA</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.settings.require_2fa}
                  onChange={(e) => setSettings({
                    ...settings,
                    settings: {...settings.settings, require_2fa: e.target.checked}
                  })}
                  className="rounded"
                />
              </div>
              
              <div>
                <Label>Data Retention (Days)</Label>
                <Input
                  type="number"
                  value={settings.settings.data_retention_days}
                  onChange={(e) => setSettings({
                    ...settings,
                    settings: {...settings.settings, data_retention_days: parseInt(e.target.value)}
                  })}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
