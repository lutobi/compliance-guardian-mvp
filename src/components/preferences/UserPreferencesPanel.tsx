'use client';

import { useState } from 'react';
import { useUserPreferences } from '@/lib/hooks/useUserPreferences';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, RotateCcw } from 'lucide-react';

/**
 * User Preferences Panel Component
 * 
 * Displays and manages user preferences with multi-tenant context
 */
export function UserPreferencesPanel() {
  const { 
    preferences, 
    isLoading, 
    error, 
    updatePreferences, 
    resetPreferences 
  } = useUserPreferences();
  
  const [isSaving, setIsSaving] = useState(false);

  // Form state management
  const [theme, setTheme] = useState(preferences?.theme || 'light');
  const [emailNotifications, setEmailNotifications] = useState(
    preferences?.notification_preferences?.email || true
  );
  const [inAppNotifications, setInAppNotifications] = useState(
    preferences?.notification_preferences?.inapp || true
  );
  const [compactView, setCompactView] = useState(
    preferences?.display_preferences?.compactView || false
  );
  const [showHelpTips, setShowHelpTips] = useState(
    preferences?.display_preferences?.showHelpTips || true
  );

  // Update form state when preferences load
  if (preferences && !isLoading && theme !== preferences.theme) {
    setTheme(preferences.theme || 'light');
    setEmailNotifications(preferences.notification_preferences?.email || true);
    setInAppNotifications(preferences.notification_preferences?.inapp || true);
    setCompactView(preferences.display_preferences?.compactView || false);
    setShowHelpTips(preferences.display_preferences?.showHelpTips || true);
  }

  // Save preferences
  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      await updatePreferences({
        theme,
        notification_preferences: {
          email: emailNotifications,
          inapp: inAppNotifications
        },
        display_preferences: {
          compactView,
          showHelpTips
        }
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to defaults
  const handleReset = async () => {
    try {
      setIsSaving(true);
      await resetPreferences();
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2">Loading preferences...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full border-destructive">
        <CardHeader>
          <CardTitle>Error Loading Preferences</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>User Preferences</CardTitle>
            <CardDescription>Customize your experience for this workspace</CardDescription>
          </div>
          <Badge variant="outline">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="appearance">
          <TabsList className="mb-4">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="display">Display</TabsTrigger>
          </TabsList>
          
          <TabsContent value="appearance" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={theme}
                onValueChange={(value) => setTheme(value)}
              >
                <SelectTrigger id="theme">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email alerts for important events
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="in-app-notifications">In-App Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Show notifications within the application
                </p>
              </div>
              <Switch
                id="in-app-notifications"
                checked={inAppNotifications}
                onCheckedChange={setInAppNotifications}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="display" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="compact-view">Compact View</Label>
                <p className="text-sm text-muted-foreground">
                  Display more items with less spacing
                </p>
              </div>
              <Switch
                id="compact-view"
                checked={compactView}
                onCheckedChange={setCompactView}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="help-tips">Help Tips</Label>
                <p className="text-sm text-muted-foreground">
                  Show helpful tooltips throughout the interface
                </p>
              </div>
              <Switch
                id="help-tips"
                checked={showHelpTips}
                onCheckedChange={setShowHelpTips}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={isLoading || isSaving}
        >
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
          Reset
        </Button>
        <Button
          onClick={handleSave}
          disabled={isLoading || isSaving}
        >
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Preferences
        </Button>
      </CardFooter>
    </Card>
  );
}
