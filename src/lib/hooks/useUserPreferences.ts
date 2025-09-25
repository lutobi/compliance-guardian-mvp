/**
 * User Preferences Hook
 * 
 * A React hook for managing user preferences with workspace context
 * Handles fetching, updating, and resetting user preferences
 * with proper multi-tenant security
 */

import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '@/providers/workspace-provider';
import { useToast } from '@/components/ui/use-toast';

// Define preference types
export interface UserPreferences {
  theme?: string;
  notification_preferences?: {
    email: boolean;
    inapp: boolean;
  };
  display_preferences?: {
    compactView: boolean;
    showHelpTips: boolean;
  };
  dashboard_layout?: {
    widgets: string[];
  };
  [key: string]: any; // Allow for extensible preferences
}

// Hook return type
interface UseUserPreferencesReturn {
  preferences: UserPreferences | null;
  isLoading: boolean;
  error: string | null;
  updatePreferences: (newPreferences: Partial<UserPreferences>) => Promise<void>;
  resetPreferences: () => Promise<void>;
  refreshPreferences: () => Promise<void>;
}

/**
 * Hook for managing user preferences within workspace context
 */
export function useUserPreferences(): UseUserPreferencesReturn {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { currentWorkspace } = useWorkspace();
  const { toast } = useToast();

  /**
   * Fetch user preferences from API
   */
  const fetchPreferences = useCallback(async () => {
    if (!currentWorkspace?.slug) {
      setError("No active workspace");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/preferences', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-workspace-slug': currentWorkspace.slug,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch preferences');
      }

      const result = await response.json();
      setPreferences(result.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load preferences');
      console.error('Error loading preferences:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspace?.slug]);

  /**
   * Update user preferences
   */
  const updatePreferences = useCallback(async (newPreferences: Partial<UserPreferences>) => {
    if (!currentWorkspace?.slug) {
      setError("No active workspace");
      return;
    }

    try {
      setError(null);
      
      // Optimistic update
      setPreferences(prev => ({
        ...prev,
        ...newPreferences
      }));

      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-workspace-slug': currentWorkspace.slug,
        },
        body: JSON.stringify(newPreferences),
      });

      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }

      const result = await response.json();
      setPreferences(result.data);
      
      toast({
        title: "Preferences updated",
        description: "Your preferences have been saved",
        variant: "default",
      });
    } catch (err: any) {
      setError(err.message || 'Failed to update preferences');
      console.error('Error updating preferences:', err);
      
      // Refresh to get current state
      fetchPreferences();
      
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive",
      });
    }
  }, [currentWorkspace?.slug, toast, fetchPreferences]);

  /**
   * Reset preferences to defaults
   */
  const resetPreferences = useCallback(async () => {
    if (!currentWorkspace?.slug) {
      setError("No active workspace");
      return;
    }

    try {
      setError(null);

      const response = await fetch('/api/preferences', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-workspace-slug': currentWorkspace.slug,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to reset preferences');
      }

      const result = await response.json();
      setPreferences(result.data);
      
      toast({
        title: "Preferences reset",
        description: "Your preferences have been reset to defaults",
        variant: "default",
      });
    } catch (err: any) {
      setError(err.message || 'Failed to reset preferences');
      console.error('Error resetting preferences:', err);
      
      toast({
        title: "Error",
        description: "Failed to reset preferences",
        variant: "destructive",
      });
    }
  }, [currentWorkspace?.slug, toast]);

  // Initial fetch on mount or workspace change
  useEffect(() => {
    if (currentWorkspace?.slug) {
      fetchPreferences();
    }
  }, [currentWorkspace?.slug, fetchPreferences]);

  return {
    preferences,
    isLoading,
    error,
    updatePreferences,
    resetPreferences,
    refreshPreferences: fetchPreferences,
  };
}
