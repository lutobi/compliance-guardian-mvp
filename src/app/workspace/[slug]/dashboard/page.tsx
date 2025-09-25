/**
 * WORKSPACE DASHBOARD
 * 
 * Main dashboard for workspace-scoped operations showing:
 * - Workspace overview metrics
 * - Recent assessments
 * - Compliance status
 * - Quick actions
 * - Team activity
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMultiTenantAuth } from '@/lib/auth/MultiTenantContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus,
  FileText,
  Shield,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Calendar,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

interface DashboardMetrics {
  totalAssessments: number;
  completedAssessments: number;
  pendingAssessments: number;
  riskScore: number;
  complianceRate: number;
  teamMembers: number;
}

interface RecentAssessment {
  id: string;
  title: string;
  status: 'draft' | 'in_review' | 'completed';
  riskLevel: 'low' | 'medium' | 'high';
  createdAt: string;
  assignee?: string;
}

export default function WorkspaceDashboard() {
  const params = useParams();
  const router = useRouter();
  const { 
    user, 
    currentWorkspace, 
    currentMembership, 
    hasPermission,
    loading 
  } = useMultiTenantAuth();

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentAssessments, setRecentAssessments] = useState<RecentAssessment[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const workspaceSlug = params?.slug as string || '';

  // Redirect out if no workspace is set once auth has loaded
  useEffect(() => {
    if (!loading && !currentWorkspace) {
      router.replace('/dashboard');
    }
  }, [loading, currentWorkspace, router]);

  // Load dashboard data
  useEffect(() => {
    if (currentWorkspace && !loading) {
      loadDashboardData();
    }
  }, [currentWorkspace, loading]);

  const loadDashboardData = async () => {
    try {
      setLoadingData(true);
      
      // Load metrics and recent assessments
      // This would typically make API calls to fetch real data
      // For now, using mock data to demonstrate the structure
      
      const mockMetrics: DashboardMetrics = {
        totalAssessments: 24,
        completedAssessments: 18,
        pendingAssessments: 6,
        riskScore: 72,
        complianceRate: 85,
        // TODO: Replace with real member count once available from API/context
        teamMembers: 1
      };

      const mockRecentAssessments: RecentAssessment[] = [
        {
          id: '1',
          title: 'Q4 Security Review',
          status: 'completed',
          riskLevel: 'medium',
          createdAt: '2024-01-15',
          assignee: 'John Doe'
        },
        {
          id: '2',
          title: 'Data Privacy Assessment',
          status: 'in_review',
          riskLevel: 'high',
          createdAt: '2024-01-14',
          assignee: 'Jane Smith'
        },
        {
          id: '3',
          title: 'Vendor Risk Evaluation',
          status: 'draft',
          riskLevel: 'low',
          createdAt: '2024-01-13'
        }
      ];

      setMetrics(mockMetrics);
      setRecentAssessments(mockRecentAssessments);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoadingData(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_review': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // While redirecting, show a minimal placeholder
  if (!currentWorkspace) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to {currentWorkspace.name}</p>
        </div>
        
        {hasPermission('create_assessments') && (
          <Button
            className="flex items-center space-x-2"
            onClick={() => router.push(`/workspace/${currentWorkspace.slug}/assessments/new`)}
          >
            <Plus className="h-4 w-4" />
            <span>New Assessment</span>
          </Button>
        )}
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalAssessments}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.completedAssessments} completed, {metrics.pendingAssessments} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.riskScore}/100</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full ${metrics.riskScore >= 80 ? 'bg-red-500' : metrics.riskScore >= 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${metrics.riskScore}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.complianceRate}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="h-2 bg-green-500 rounded-full"
                  style={{ width: `${metrics.complianceRate}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.teamMembers}</div>
              <p className="text-xs text-muted-foreground">
                Active workspace members
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Assessments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Recent Assessments</span>
            </CardTitle>
            <CardDescription>
              Latest compliance assessments in your workspace
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingData ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : recentAssessments.length > 0 ? (
              <div className="space-y-3">
                {recentAssessments.map((assessment) => (
                  <div key={assessment.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{assessment.title}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={`text-xs ${getStatusColor(assessment.status)}`}>
                          {assessment.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={`text-xs ${getRiskColor(assessment.riskLevel)}`}>
                          {assessment.riskLevel} risk
                        </Badge>
                      </div>
                      {assessment.assignee && (
                        <p className="text-sm text-gray-600 mt-1">
                          Assigned to {assessment.assignee}
                        </p>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(assessment.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No assessments yet</p>
                <p className="text-sm">Create your first assessment to get started</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions & Status */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks for your workspace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {hasPermission('create_assessments') && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push(`/workspace/${currentWorkspace.slug}/assessments/new`)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Assessment
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push(`/workspace/${currentWorkspace.slug}/analytics`)}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push(`/workspace/${currentWorkspace.slug}/reviews/schedule`)}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Review
              </Button>
              {hasPermission('manage_settings') && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push(`/workspace/${currentWorkspace.slug}/settings`)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Workspace Settings
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Compliance Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Compliance Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Completed Reviews</span>
                </div>
                <span className="text-sm font-medium">{metrics?.completedAssessments || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Pending Reviews</span>
                </div>
                <span className="text-sm font-medium">{metrics?.pendingAssessments || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">High Risk Items</span>
                </div>
                <span className="text-sm font-medium">
                  {recentAssessments.filter(a => a.riskLevel === 'high').length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
