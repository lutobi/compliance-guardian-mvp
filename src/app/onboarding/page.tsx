/**
 * ONBOARDING FLOW FOR NEW USERS
 * 
 * This component handles the complete onboarding experience:
 * 1. Welcome and role selection
 * 2. Workspace creation or invitation acceptance
 * 3. Profile completion
 * 4. Feature tour and setup
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { UserMenu } from '@/components/navigation/UserMenu';
import { 
  Building2, 
  Users, 
  Mail, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Shield,
  BarChart3
} from 'lucide-react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<OnboardingStepProps>;
}

interface OnboardingStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  isLoading: boolean;
}

interface OnboardingData {
  userType: 'create_workspace' | 'join_workspace' | null;
  workspaceName: string;
  workspaceSlug: string;
  industry: string;
  companySize: string;
  invitationToken: string;
  profileName: string;
  timezone: string;
  completedSteps: string[];
}

// ============================================================================
// ONBOARDING STEPS COMPONENTS
// ============================================================================

function WelcomeStep({ data, updateData, nextStep }: OnboardingStepProps) {
  return (
    <div className="text-center space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Welcome to Compliance Guardian</h1>
        <p className="text-gray-600 text-lg">
          Let's get you set up with your compliance management workspace
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <Card 
          className={`cursor-pointer transition-all hover:scale-105 ${
            data.userType === 'create_workspace' ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => updateData({ userType: 'create_workspace' })}
        >
          <CardHeader className="text-center">
            <Building2 className="w-12 h-12 mx-auto text-blue-600" />
            <CardTitle>Create New Workspace</CardTitle>
            <CardDescription>
              Start fresh with your own compliance workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Full administrative control
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Invite team members
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Custom compliance frameworks
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:scale-105 ${
            data.userType === 'join_workspace' ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => updateData({ userType: 'join_workspace' })}
        >
          <CardHeader className="text-center">
            <Users className="w-12 h-12 mx-auto text-green-600" />
            <CardTitle>Join Existing Workspace</CardTitle>
            <CardDescription>
              Join your team's existing compliance workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Access existing data
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Collaborate with team
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Role-based permissions
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Button 
        onClick={nextStep}
        disabled={!data.userType}
        className="w-full max-w-xs"
      >
        Continue
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}

function WorkspaceSetupStep({ data, updateData, nextStep, prevStep, isLoading }: OnboardingStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (data.userType === 'create_workspace') {
      if (!data.workspaceName.trim()) {
        newErrors.workspaceName = 'Workspace name is required';
      }
      if (!data.workspaceSlug.trim()) {
        newErrors.workspaceSlug = 'Workspace URL is required';
      } else if (!/^[a-z0-9-]+$/.test(data.workspaceSlug)) {
        newErrors.workspaceSlug = 'URL can only contain lowercase letters, numbers, and hyphens';
      }
    } else if (data.userType === 'join_workspace') {
      if (!data.invitationToken.trim()) {
        newErrors.invitationToken = 'Invitation code is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      nextStep();
    }
  };

  const generateSlug = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    updateData({ workspaceSlug: slug });
  };

  if (data.userType === 'create_workspace') {
    return (
      <div className="space-y-6 max-w-md mx-auto">
        <div className="text-center space-y-2">
          <Building2 className="w-12 h-12 mx-auto text-blue-600" />
          <h2 className="text-2xl font-bold">Create Your Workspace</h2>
          <p className="text-gray-600">
            Set up your compliance management workspace
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="workspaceName" className="block text-sm font-medium mb-2">
              Workspace Name
            </label>
            <Input
              id="workspaceName"
              value={data.workspaceName}
              onChange={(e) => {
                updateData({ workspaceName: e.target.value });
                generateSlug(e.target.value);
              }}
              placeholder="Acme Corporation"
              className={errors.workspaceName ? 'border-red-500' : ''}
            />
            {errors.workspaceName && (
              <p className="text-red-500 text-sm mt-1">{errors.workspaceName}</p>
            )}
          </div>

          <div>
            <label htmlFor="workspaceSlug" className="block text-sm font-medium mb-2">
              Workspace URL
            </label>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">
                compliance-guardian.com/workspace/
              </span>
              <Input
                id="workspaceSlug"
                value={data.workspaceSlug}
                onChange={(e) => updateData({ workspaceSlug: e.target.value })}
                placeholder="acme-corp"
                className={errors.workspaceSlug ? 'border-red-500' : ''}
              />
            </div>
            {errors.workspaceSlug && (
              <p className="text-red-500 text-sm mt-1">{errors.workspaceSlug}</p>
            )}
          </div>

          <div>
            <label htmlFor="industry" className="block text-sm font-medium mb-2">
              Industry
            </label>
            <select
              id="industry"
              value={data.industry}
              onChange={(e) => updateData({ industry: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Industry</option>
              <option value="agriculture">Agriculture & Food</option>
              <option value="automotive">Automotive</option>
              <option value="construction">Construction</option>
              <option value="energy">Energy & Utilities</option>
              <option value="financial">Financial Services</option>
              <option value="healthcare">Healthcare</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="retail">Retail & Consumer Goods</option>
              <option value="technology">Technology</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="companySize" className="block text-sm font-medium mb-2">
              Company Size
            </label>
            <select
              id="companySize"
              value={data.companySize}
              onChange={(e) => updateData({ companySize: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Size</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-1000">201-1000 employees</option>
              <option value="1000+">1000+ employees</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={prevStep} className="flex-1">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleNext} disabled={isLoading} className="flex-1">
            {isLoading ? 'Creating...' : 'Create Workspace'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div className="text-center space-y-2">
        <Mail className="w-12 h-12 mx-auto text-green-600" />
        <h2 className="text-2xl font-bold">Join Workspace</h2>
        <p className="text-gray-600">
          Enter your invitation code to join your team
        </p>
      </div>

      <div>
        <label htmlFor="invitationToken" className="block text-sm font-medium mb-2">
          Invitation Code
        </label>
        <Input
          id="invitationToken"
          value={data.invitationToken}
          onChange={(e) => updateData({ invitationToken: e.target.value })}
          placeholder="Enter invitation code"
          className={errors.invitationToken ? 'border-red-500' : ''}
        />
        {errors.invitationToken && (
          <p className="text-red-500 text-sm mt-1">{errors.invitationToken}</p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          You should have received this code via email
        </p>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={prevStep} className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleNext} disabled={isLoading} className="flex-1">
          {isLoading ? 'Joining...' : 'Join Workspace'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function ProfileSetupStep({ data, updateData, nextStep, prevStep }: OnboardingStepProps) {
  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div className="text-center space-y-2">
        <Users className="w-12 h-12 mx-auto text-purple-600" />
        <h2 className="text-2xl font-bold">Complete Your Profile</h2>
        <p className="text-gray-600">
          Help your team recognize you
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="profileName" className="block text-sm font-medium mb-2">
            Full Name
          </label>
          <Input
            id="profileName"
            value={data.profileName}
            onChange={(e) => updateData({ profileName: e.target.value })}
            placeholder="John Doe"
          />
        </div>

        <div>
          <label htmlFor="timezone" className="block text-sm font-medium mb-2">
            Timezone
          </label>
          <select
            id="timezone"
            value={data.timezone}
            onChange={(e) => updateData({ timezone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Europe/London">London</option>
            <option value="Europe/Paris">Paris</option>
            <option value="Asia/Tokyo">Tokyo</option>
            <option value="Asia/Singapore">Singapore</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={prevStep} className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={nextStep} className="flex-1">
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function CompletionStep({ data, updateData, nextStep }: OnboardingStepProps) {
  const router = useRouter();

  const handleFinish = async () => {
    try {
      // 1) Ensure we have session tokens (retry briefly), prefer dev-sync for cookie setting
      const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
      const getLocalStorageSession = (): any | null => {
        try {
          const key = Object.keys(localStorage || {}).find(k => /^sb-.*-auth-token$/.test(k));
          const raw = key ? localStorage.getItem(key) : null;
          if (!raw) return null;
          let parsed: any = null;
          try { parsed = JSON.parse(raw); } catch {}
          if (parsed?.access_token && parsed?.refresh_token) return parsed;
          if (parsed?.currentSession?.access_token && parsed?.currentSession?.refresh_token) return parsed.currentSession;
          if (Array.isArray(parsed) && parsed[0]?.access_token && parsed[0]?.refresh_token) return parsed[0];
          if (parsed?.data?.session?.access_token && parsed?.data?.session?.refresh_token) return parsed.data.session;
        } catch {}
        return null;
      };

      let { data: { session } } = await supabase.auth.getSession();
      try {
        const { data: { session: refreshed } } = await supabase.auth.refreshSession();
        if (refreshed) session = refreshed;
      } catch (e) {
        console.warn('[Onboarding] refreshSession failed:', e);
      }

      // Wait/retry up to ~3s for a session to appear
      if (!session) {
        for (let i = 0; i < 12 && !session; i++) {
          const ls = typeof window !== 'undefined' ? getLocalStorageSession() : null;
          if (ls) session = ls;
          if (!session) {
            await wait(250);
            ({ data: { session } } = await supabase.auth.getSession());
          }
        }
      }

      if (!session?.access_token || !session?.refresh_token) {
        toast.error('Session not ready. Please try again in a moment.');
        return;
      }

      // 2) Prefer dev-sync to set HttpOnly cookies
      let cookieSynced = false;
      try {
        const ds = await fetch('/api/auth/dev-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ access_token: session.access_token, refresh_token: session.refresh_token })
        });
        cookieSynced = ds.ok;
      } catch (e) {
        cookieSynced = false;
      }

      if (!cookieSynced) {
        // Fallback to callback using event/session only if we have a session
        try {
          const res = await fetch('/api/auth/callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ event: 'SIGNED_IN', session })
          });
          cookieSynced = res.ok;
        } catch (e) {
          cookieSynced = false;
        }
      }

      if (!cookieSynced) {
        toast.error('Session sync failed. Please try again.');
        return;
      }
      await wait(400);

      // 3) Confirm server recognizes the session before proceeding (more retries)
      const pollWhoami = async (attempts = 16, delayMs = 300) => {
        for (let i = 0; i < attempts; i++) {
          try {
            const who = await fetch('/api/dev/whoami', { credentials: 'include', cache: 'no-store' }).then(r => r.json());
            if (who && who.authenticated) return true;
          } catch {}
          await wait(delayMs);
        }
        return false;
      };
      let authed = await pollWhoami();
      if (!authed) {
        // One more dev-sync retry
        try {
          const ds2 = await fetch('/api/auth/dev-sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ access_token: session.access_token, refresh_token: session.refresh_token })
          });
          if (ds2.ok) authed = await pollWhoami(12, 300);
        } catch {}
      }
      if (!authed) {
        toast.error('Your session is not ready yet. Please wait a moment and try again.');
        return;
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      // Final refresh to ensure we have a valid, fresh access token
      try {
        await supabase.auth.refreshSession();
      } catch (e) {
        console.warn('[Onboarding] final refreshSession failed:', e);
      }
      ({ data: { session } } = await supabase.auth.getSession());
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
        console.log('[Onboarding] Using Authorization token prefix:', session.access_token.slice(0, 12));
      }

      // Session should be synced by now

      // Initialize workspace with retries
      let response = await fetch('/api/team/init', {
        method: 'POST',
        headers,
        credentials: 'include',
        cache: 'no-store',
        body: JSON.stringify({
          workspaceName: data.workspaceName,
          workspaceSlug: data.workspaceSlug,
          industry: data.industry,
          companySize: data.companySize,
          profileName: data.profileName,
          timezone: data.timezone
        })
      });

      // If unauthorized, refresh and retry once
      if (response.status === 401) {
        console.warn('[Onboarding] 401 from /api/team/init, refreshing and retrying');
        await supabase.auth.refreshSession();
        ({ data: { session } } = await supabase.auth.getSession());
        
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        response = await fetch('/api/team/init', {
          method: 'POST', 
          headers,
          credentials: 'include',
          cache: 'no-store',
          body: JSON.stringify({
            workspaceName: data.workspaceName,
            workspaceSlug: data.workspaceSlug,
            industry: data.industry,
            companySize: data.companySize,
            profileName: data.profileName,
            timezone: data.timezone
          })
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Workspace creation failed:', errorText);
        toast.error('Failed to create workspace. Please try again.');
        return;
      }

      const result = await response.json();
      console.log('Team init result:', result);

      if (result.success && result.data?.workspaceSlug) {
        console.log('Redirecting to workspace:', result.data.workspaceSlug);
        window.location.href = `/workspace/${result.data.workspaceSlug}/dashboard`;
        return;
      }

      // Fallback to workspace selection
      console.log('Redirecting to workspace selection');
      window.location.href = '/workspace/select';
    } catch (error) {
      console.error('Error during workspace creation:', error);
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="text-center space-y-6 max-w-md mx-auto">
      <div className="space-y-2">
        <CheckCircle className="w-16 h-16 mx-auto text-green-600" />
        <h2 className="text-2xl font-bold">You're All Set!</h2>
        <p className="text-gray-600">
          Welcome to your compliance management workspace
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold">What's Next?</h3>
        <div className="space-y-2 text-sm text-left">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span>Explore your dashboard and key features</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-500" />
            <span>Set up your first compliance framework</span>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-green-500" />
            <span>Create your first assessment</span>
          </div>
        </div>
      </div>

      <Button onClick={handleFinish} className="w-full">
        Go to Dashboard
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}

// ============================================================================
// MAIN ONBOARDING COMPONENT
// ============================================================================

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome',
    description: 'Choose how to get started',
    component: WelcomeStep
  },
  {
    id: 'workspace',
    title: 'Workspace',
    description: 'Set up your workspace',
    component: WorkspaceSetupStep
  },
  {
    id: 'profile',
    title: 'Profile',
    description: 'Complete your profile',
    component: ProfileSetupStep
  },
  {
    id: 'completion',
    title: 'Complete',
    description: 'Ready to go!',
    component: CompletionStep
  }
];

export default function OnboardingPage() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    userType: null,
    workspaceName: '',
    workspaceSlug: '',
    industry: '',
    companySize: '',
    invitationToken: '',
    profileName: '',
    timezone: 'UTC',
    completedSteps: []
  });

  const currentStep = ONBOARDING_STEPS[currentStepIndex];
  const progress = ((currentStepIndex + 1) / ONBOARDING_STEPS.length) * 100;

  const updateData = (newData: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  const nextStep = async () => {
    setIsLoading(true);
    
    try {
      // Move to next step
      if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error in onboarding step:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const CurrentStepComponent = currentStep.component;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <div className="flex flex-1 items-center gap-x-4">
            <h1 className="text-lg font-semibold">Getting Started</h1>
            <button 
              onClick={() => {
                const baseUrl = window.location.origin;
                window.location.href = `${baseUrl}/workspace/select`;
              }}
              className="text-sm text-gray-500 hover:text-primary"
              data-testid="workspace-menu"
            >
              Switch Workspace
            </button>
          </div>
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <UserMenu />
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        {/* Progress Header */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold">Getting Started</h1>
              <Badge variant="secondary">
                Step {currentStepIndex + 1} of {ONBOARDING_STEPS.length}
              </Badge>
            </div>
            <div className="text-sm text-gray-500">
              {Math.round(progress)}% Complete
            </div>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        {/* Step Content */}
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8">
            <CurrentStepComponent
              data={data}
              updateData={updateData}
              nextStep={nextStep}
              prevStep={prevStep}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        {/* Step Indicators */}
        <div className="max-w-2xl mx-auto mt-8">
          <div className="flex justify-center gap-2">
            {ONBOARDING_STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index <= currentStepIndex ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
