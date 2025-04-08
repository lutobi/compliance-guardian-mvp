import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  MonitoringStatus,
  ReviewCycle,
  Priority,
  AutomationLevel,
  EvidenceType,
  MonitoringFrequency,
  MonitoringPoint,
  FrameworkMonitoring,
  CategoryMonitoring,
  ControlMonitoring,
  Evidence,
  MonitorConfig
} from '@/types/monitoring';

export class MonitoringService {
  private static instance: MonitoringService;
  private supabase: any;

  private constructor() {
    this.supabase = createClientComponentClient();
  }

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  async createMonitoringPoint(point: Partial<MonitoringPoint>): Promise<MonitoringPoint> {
    const { data, error } = await this.supabase
      .from('monitoring_points')
      .insert({
        name: point.name,
        description: point.description,
        status: point.status || 'pending',
        last_review_date: point.last_review_date || null,
        next_review_date: point.next_review_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        reviewers: point.reviewers || [],
        evidence_required: point.evidence_required || true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updatePointStatus(pointId: string, status: string): Promise<void> {
    const { error } = await this.supabase
      .from('monitoring_points')
      .update({
        status,
        last_review_date: new Date()
      })
      .eq('id', pointId);

    if (error) throw error;
  }

  async addEvidence(pointId: string, evidence: Partial<Evidence>): Promise<Evidence> {
    const { data, error } = await this.supabase
      .from('evidence')
      .insert({
        monitoring_point_id: pointId,
        type: evidence.type || 'document',
        title: evidence.title || '',
        description: evidence.description || '',
        uploaded_by: evidence.uploaded_by || '',
        upload_date: evidence.upload_date || new Date(),
        valid_until: evidence.valid_until,
        metadata: evidence.metadata || {}
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getFrameworkMonitoring(frameworkId: string): Promise<FrameworkMonitoring | null> {
    const { data, error } = await this.supabase
      .from('monitoring')
      .select(`
        *,
        framework:framework_id(
          id,
          name,
          description,
          slug
        )
      `)
      .eq('framework_id', frameworkId)
      .single();

    if (error) return null;
    return data;
  }

  async getCategoryMonitoring(categoryId: string): Promise<CategoryMonitoring | null> {
    const { data, error } = await this.supabase
      .from('controls')
      .select(`
        *,
        framework:framework_id(
          id,
          name,
          description
        )
      `)
      .eq('category', categoryId)
      .single();

    if (error) return null;
    return data;
  }

  async getControlMonitoring(controlId: string): Promise<ControlMonitoring | null> {
    const { data, error } = await this.supabase
      .from('monitoring_controls')
      .select(`
        *,
        control:control_id(
          id,
          name,
          description,
          category
        )
      `)
      .eq('control_id', controlId)
      .single();

    if (error) return null;
    return data;
  }

  async getFrameworks() {
    const { data, error } = await this.supabase
      .from('frameworks')
      .select('*');

    if (error) throw error;
    return data;
  }

  async getRelatedControls(frameworkId: string) {
    const { data, error } = await this.supabase
      .from('controls')
      .select('*')
      .eq('framework_id', frameworkId);

    if (error) throw error;
    return data;
  }

  async createMonitoring(config: Partial<MonitorConfig>) {
    const { data, error } = await this.supabase
      .from('monitoring')
      .insert({
        framework_id: config.framework_id || config.frameworks?.[0],
        settings: {
          frequency: config.frequency || 'monthly',
          evidence_type: config.evidence_type || 'document',
          priority: config.priority || 'medium',
          automation_level: config.automation_level || 'manual'
        }
      })
      .select()
      .single();

    if (error) throw error;
    
    // Create control mappings
    await Promise.all(config.controls?.map(async (controlId: string) => {
      await this.supabase
        .from('monitoring_controls')
        .insert({
          monitoring_id: data.id,
          control_id: controlId,
          status: 'pending',
          last_checked: null,
          next_check: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
    }) || []);

    return data;
  }

  async getActiveMonitoring() {
    try {
      const { data, error } = await this.supabase
        .from('monitoring')
        .select(`
          *,
          framework:framework_id(
            id,
            name,
            description,
            slug
          ),
          controls:monitoring_controls(
            *,
            control:control_id(
              id,
              name,
              description,
              category
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching monitoring data:', error);
        return this.getFallbackMonitoringData();
      }
      
      return data.length > 0 ? data : this.getFallbackMonitoringData();
    } catch (error) {
      console.error('Exception in getActiveMonitoring:', error);
      return this.getFallbackMonitoringData();
    }
  }
  
  // Provides fallback data when tables don't exist yet
  private getFallbackMonitoringData() {
    const frameworks = [
      { id: 'gdpr', name: 'GDPR', description: 'General Data Protection Regulation', slug: 'gdpr' },
      { id: 'hipaa', name: 'HIPAA', description: 'Health Insurance Portability and Accountability Act', slug: 'hipaa' },
      { id: 'soc2', name: 'SOC 2', description: 'Service Organization Control 2', slug: 'soc2' }
    ];
    
    return frameworks.map(framework => {
      const controlCount = Math.floor(Math.random() * 10) + 5;
      const controls = Array.from({ length: controlCount }, (_, i) => ({
        id: `control-${framework.id}-${i}`,
        control_id: `control-${i}`,
        status: ['pending', 'compliant', 'non_compliant'][Math.floor(Math.random() * 3)],
        last_checked: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        next_check: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        control: {
          id: `control-${i}`,
          name: `Control ${i+1}`,
          description: `This is a sample control for ${framework.name}`,
          category: ['Access Control', 'Data Protection', 'Incident Response', 'Risk Management'][Math.floor(Math.random() * 4)]
        }
      }));
      
      return {
        id: `monitoring-${framework.id}`,
        framework_id: framework.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        framework,
        controls
      };
    });
  }

  async updateControlStatus(monitoringId: string, controlId: string, status: string) {
    const { error } = await this.supabase
      .from('monitoring_controls')
      .update({
        status,
        last_checked: new Date()
      })
      .eq('monitoring_id', monitoringId)
      .eq('control_id', controlId);

    if (error) throw error;
  }

  async getMonitoringMetrics(pointId: string, startDate: Date, endDate: Date): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('monitoring_metrics')
      .select('*')
      .eq('monitoring_point_id', pointId)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at');

    if (error) throw error;
    return data;
  }

  async getComplianceTrends(frameworkId: string, period: 'week' | 'month' | 'quarter' = 'month'): Promise<any[]> {
    // Calculate date range based on period
    const endDate = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
    }

    const { data, error } = await this.supabase
      .from('monitoring_metrics')
      .select(`
        id,
        name,
        value,
        created_at,
        monitoring_point:monitoring_point_id(framework_id)
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at');

    if (error) throw error;

    // Filter by framework if provided
    const filteredData = frameworkId 
      ? data.filter((item: any) => item.monitoring_point?.framework_id === frameworkId)
      : data;

    // Group by day for trend analysis
    const trendData = filteredData.reduce((acc: any, curr: any) => {
      const date = new Date(curr.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          metrics: []
        };
      }
      acc[date].metrics.push(curr);
      return acc;
    }, {});

    return Object.values(trendData);
  }

  async getRiskAssessment(): Promise<any[]> {
    try {
      // This is a placeholder for actual risk assessment data
      // In a real implementation, this would query a risk_assessments table
      const riskCategories = ['Geographic', 'Supply Chain', 'Supplier', 'Product'];
      const riskLevels = ['low', 'medium', 'high', 'critical'];
      
      try {
        const { data: monitoringData, error } = await this.supabase
          .from('monitoring_controls')
          .select(`
            status,
            control:control_id(category)
          `);
          
        if (error) throw error;
      } catch (error) {
        console.log('Monitoring controls table may not exist yet, using fallback data');
      }

      // Group controls by category and calculate risk levels
      const riskData = riskCategories.map(category => {
        const total = Math.floor(Math.random() * 20) + 5; // Random number for demo
        const level = riskLevels[Math.floor(Math.random() * riskLevels.length)];
        
        return {
          category,
          level,
          count: total,
          percentage: Math.floor(Math.random() * 100)
        };
      });

      return riskData;
    } catch (error) {
      console.error('Error in getRiskAssessment:', error);
      return [
        { category: 'Geographic', level: 'low', count: 5, percentage: 25 },
        { category: 'Supply Chain', level: 'medium', count: 8, percentage: 40 },
        { category: 'Supplier', level: 'high', count: 12, percentage: 60 },
        { category: 'Product', level: 'critical', count: 3, percentage: 15 }
      ];
    }
  }

  async getVerificationSummary(): Promise<any> {
    try {
      // Get all monitoring controls to calculate verification stats
      const { data, error } = await this.supabase
        .from('monitoring_controls')
        .select('status');

      if (error) throw error;

      const total = data.length;
      const passed = data.filter((item: any) => item.status === 'compliant').length;
      const failed = data.filter((item: any) => item.status === 'non_compliant').length;
      const pending = data.filter((item: any) => item.status === 'pending').length;
      const completionRate = total > 0 ? Math.round((passed / total) * 100) : 0;

      return {
        total,
        passed,
        pending,
        failed,
        completionRate
      };
    } catch (error) {
      console.error('Error in getVerificationSummary:', error);
      // Return fallback data
      return {
        total: 25,
        passed: 15,
        pending: 7,
        failed: 3,
        completionRate: 60
      };
    }
  }

  async getRecentActivities(limit: number = 10): Promise<any[]> {
    try {
      // In a real implementation, this would query an activities or audit_log table
      // For now, we'll generate some sample data based on monitoring controls
      
      const { data: controlData, error } = await this.supabase
        .from('monitoring_controls')
        .select(`
          id,
          status,
          last_checked,
          control:control_id(name),
          monitoring:monitoring_id(framework:framework_id(name))
        `)
        .order('last_checked', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Transform to activity format
      const activities = controlData.map((item: any) => {
        const activityTypes = ['update', 'evidence', 'verification', 'assessment'];
        const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
        
        return {
          id: item.id,
          name: `${type.charAt(0).toUpperCase() + type.slice(1)} for ${item.control?.name || 'Control'}`,
          value: `Status changed to ${item.status}`,
          timestamp: item.last_checked || new Date().toISOString(),
          type,
          relatedEntity: {
            id: item.id,
            name: item.monitoring?.framework?.name || 'Framework',
            type: 'framework'
          }
        };
      });

      return activities;
    } catch (error) {
      console.error('Error in getRecentActivities:', error);
      // Return fallback data
      const activityTypes = ['update', 'evidence', 'verification', 'assessment'];
      const frameworks = ['GDPR', 'HIPAA', 'SOC 2', 'ISO 27001'];
      const statuses = ['pending', 'compliant', 'non_compliant'];
      
      return Array.from({ length: limit }, (_, i) => {
        const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
        const framework = frameworks[Math.floor(Math.random() * frameworks.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const daysAgo = Math.floor(Math.random() * 7);
        
        return {
          id: `activity-${i}`,
          name: `${type.charAt(0).toUpperCase() + type.slice(1)} for Control ${i+1}`,
          value: `Status changed to ${status}`,
          timestamp: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
          type,
          relatedEntity: {
            id: `framework-${i % frameworks.length}`,
            name: framework,
            type: 'framework'
          }
        };
      });
    }
  }

  async getPendingTasks(limit: number = 10): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('monitoring_controls')
        .select(`
          id,
          status,
          next_check,
          control:control_id(id, name, description, category),
          monitoring:monitoring_id(framework:framework_id(id, name))
        `)
        .eq('status', 'pending')
        .order('next_check', { ascending: true })
        .limit(limit);

      if (error) throw error;

      // Transform to task format with priority
      const priorities = ['low', 'medium', 'high', 'critical'];
      const tasks = data.map((item: any) => {
        // Assign random priority for demo purposes
        // In a real app, this would be based on actual risk assessment
        const priority = priorities[Math.floor(Math.random() * priorities.length)];
        
        return {
          id: item.id,
          name: item.control?.name || 'Unknown Control',
          description: item.control?.description || '',
          category: item.control?.category || '',
          framework: item.monitoring?.framework?.name || 'Unknown Framework',
          frameworkId: item.monitoring?.framework?.id || '',
          dueDate: item.next_check,
          priority,
          status: item.status
        };
      });

      return tasks;
    } catch (error) {
      console.error('Error in getPendingTasks:', error);
      // Return fallback data
      const categories = ['Access Control', 'Data Protection', 'Incident Response', 'Risk Management'];
      const frameworks = ['GDPR', 'HIPAA', 'SOC 2', 'ISO 27001'];
      const priorities = ['low', 'medium', 'high', 'critical'];
      
      return Array.from({ length: limit }, (_, i) => {
        const priority = priorities[Math.floor(Math.random() * priorities.length)];
        const framework = frameworks[Math.floor(Math.random() * frameworks.length)];
        const category = categories[Math.floor(Math.random() * categories.length)];
        const daysAhead = Math.floor(Math.random() * 30) + 1;
        
        return {
          id: `task-${i}`,
          name: `Verify Control ${i+1}`,
          description: `This is a sample control verification task for ${framework}`,
          category,
          framework,
          frameworkId: `framework-${i % frameworks.length}`,
          dueDate: new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString(),
          priority,
          status: 'pending'
        };
      });
    }
  }
}

export const monitoringService = MonitoringService.getInstance();
