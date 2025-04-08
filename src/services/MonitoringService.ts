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

    if (error) throw error;
    return data;
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
}

export const monitoringService = MonitoringService.getInstance();
