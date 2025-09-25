/**
 * WORKSPACE INVITATION ACCEPTANCE PAGE
 * 
 * Handles workspace invitation acceptance flow:
 * - Token validation
 * - User authentication/registration
 * - Workspace joining
 */

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMultiTenantAuth } from '@/lib/auth/MultiTenantContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Building2,
  Users,
  Mail,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface InvitationDetails {
  id: string;
  workspace: {
    id: string;
    name: string;
    slug: string;
    industry?: string;
  };
  role: string;
  invited_by: {
    name: string;
    email: string;
  };
  email: string;
  message?: string;
  expires_at: string;
  status: string;
}

export default function AcceptInvitation() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, signIn, signUp, loading } = useMultiTenantAuth();

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [validating, setValidating] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authData, setAuthData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      validateInvitation(token);
    } else {
      setError('Invalid invitation link');
      setValidating(false);
    }
  }, [token]);

  const validateInvitation = async (invitationToken: string) => {
    try {
      setValidating(true);
      
      // This would typically be an API call to validate the invitation token
      // For now, simulate with mock data
      const mockInvitation: InvitationDetails = {
        id: '1',
        workspace: {
          id: 'ws-1',
          name: 'Acme Corp',
          slug: 'acme-corp',
          industry: 'Technology'
        },
        role: 'editor',
        invited_by: {
          name: 'John Doe',
          email: 'john@acme.com'
        },
        email: 'new-user@example.com',
        message: 'Welcome to our compliance team!',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending'
      };
      
      setInvitation(mockInvitation);
      setAuthData(prev => ({ ...prev, email: mockInvitation.email }));
      
    } catch (error) {
      console.error('Error validating invitation:', error);
      setError('Invalid or expired invitation');
    } finally {
      setValidating(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!invitation || !user) {
      toast.error('Please sign in first to accept the invitation');
      return;
    }

    try {
      setAccepting(true);
      
      // This would typically make an API call to accept the invitation
      console.log('Accepting invitation:', invitation.id, 'for user:', user.profile.id);
      
      // Simulate successful acceptance
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Successfully joined ${invitation.workspace.name}!`);
      
      // Redirect to the new workspace
      router.push(`/workspace/${invitation.workspace.slug}/dashboard`);
      
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error('Failed to accept invitation');
    } finally {
      setAccepting(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authData.email || !authData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (authMode === 'signup') {
        if (!authData.name) {
          toast.error('Name is required for registration');
          return;
        }
        await signUp(authData.email, authData.password, {
          name: authData.name
        });
      } else {
        await signIn(authData.email, authData.password);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error('Authentication failed');
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Validating invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Invalid Invitation</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/')}>
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  // Check if invitation has expired
  const isExpired = new Date(invitation.expires_at) < new Date();
  if (isExpired) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Invitation Expired</h2>
            <p className="text-gray-600 mb-4">
              This invitation has expired. Please request a new invitation from your workspace administrator.
            </p>
            <Button onClick={() => router.push('/')}>
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Invitation Details */}
        <Card>
          <CardHeader className="text-center">
            <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <CardTitle>You're Invited!</CardTitle>
            <CardDescription>
              {invitation.invited_by.name} has invited you to join
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold">{invitation.workspace.name}</h3>
              {invitation.workspace.industry && (
                <p className="text-sm text-gray-600">{invitation.workspace.industry}</p>
              )}
              <div className="flex justify-center mt-2">
                <Badge className="capitalize">
                  {invitation.role} Access
                </Badge>
              </div>
            </div>

            {invitation.message && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 italic">
                  "{invitation.message}"
                </p>
              </div>
            )}

            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <span>Invited by {invitation.invited_by.email}</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                <span>Role: {invitation.role}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Authentication or Accept */}
        {!user ? (
          <Card>
            <CardHeader>
              <CardTitle>
                {authMode === 'signin' ? 'Sign In to Accept' : 'Create Account'}
              </CardTitle>
              <CardDescription>
                {authMode === 'signin' 
                  ? 'Sign in to your account to accept this invitation'
                  : 'Create a new account to join the workspace'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={authData.email}
                    onChange={(e) => setAuthData({...authData, email: e.target.value})}
                    required
                    disabled={loading}
                  />
                </div>

                {authMode === 'signup' && (
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={authData.name}
                      onChange={(e) => setAuthData({...authData, name: e.target.value})}
                      required
                      disabled={loading}
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={authData.password}
                    onChange={(e) => setAuthData({...authData, password: e.target.value})}
                    required
                    disabled={loading}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : authMode === 'signin' ? (
                    'Sign In & Accept'
                  ) : (
                    'Create Account & Accept'
                  )}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {authMode === 'signin' 
                    ? "Don't have an account? Create one"
                    : "Already have an account? Sign in"
                  }
                </button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                Ready to Join
              </CardTitle>
              <CardDescription>
                Welcome {user.profile.name}! Accept this invitation to join the workspace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleAcceptInvitation} 
                className="w-full"
                disabled={accepting}
              >
                {accepting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Joining Workspace...
                  </>
                ) : (
                  <>
                    <Building2 className="h-4 w-4 mr-2" />
                    Accept & Join {invitation.workspace.name}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
