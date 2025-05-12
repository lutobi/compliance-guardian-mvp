'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from '@/lib/auth/context';
import { toast } from 'sonner';

interface UserPreferences {
  emailNotifications: boolean;
  reviewReminders: boolean;
  complianceAlerts: boolean;
  dashboardView: 'simple' | 'detailed';
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    emailNotifications: true,
    reviewReminders: true,
    complianceAlerts: true,
    dashboardView: 'detailed',
  });

  const handleSavePreferences = async () => {
    try {
      // TODO: Implement save to backend
      toast.success('Preferences saved successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to save preferences');
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={user.email || ''}
                disabled
                className="mt-1"
              />
            </div>
            <div>
              <Label>Account Type</Label>
              <Input
                type="text"
                value="Standard User"
                disabled
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Notification Preferences</span>
              {!isEditing && (
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-gray-500">
                  Receive important updates via email
                </p>
              </div>
              <Switch
                checked={preferences.emailNotifications}
                disabled={!isEditing}
                onCheckedChange={(checked) =>
                  setPreferences(prev => ({ ...prev, emailNotifications: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Review Reminders</Label>
                <p className="text-sm text-gray-500">
                  Get reminded about upcoming reviews
                </p>
              </div>
              <Switch
                checked={preferences.reviewReminders}
                disabled={!isEditing}
                onCheckedChange={(checked) =>
                  setPreferences(prev => ({ ...prev, reviewReminders: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Compliance Alerts</Label>
                <p className="text-sm text-gray-500">
                  Receive alerts for compliance issues
                </p>
              </div>
              <Switch
                checked={preferences.complianceAlerts}
                disabled={!isEditing}
                onCheckedChange={(checked) =>
                  setPreferences(prev => ({ ...prev, complianceAlerts: checked }))
                }
              />
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSavePreferences}
                >
                  Save Changes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
