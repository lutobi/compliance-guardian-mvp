import { supabase } from '@/lib/supabase';
import logger from '@/utils/logger';
import { toast } from 'sonner';

export class MonitoringService {
  private static instance: MonitoringService;
  // Using shared supabase client to avoid duplicate GoTrueClient
  private logger = logger;
  private supabase = supabase;

  private constructor() {}

  public static getInstance(): MonitoringService {
    if (!this.instance) {
      this.instance = new MonitoringService();
    }
    return this.instance;
  }

  /** Static wrappers for legacy methods used by existing UI */
  public static getActiveMonitoring(): Promise<any[]> { return this.getInstance().getActiveMonitoring(); }
  public static getRecentActivities(limit: number): Promise<any[]> { return this.getInstance().getRecentActivities(limit); }
  public static getPendingTasks(limit: number): Promise<any[]> { return this.getInstance().getPendingTasks(limit); }
  public static getRiskAssessment(): Promise<any[]> { return this.getInstance().getRiskAssessment(); }
  public static getVerificationSummary(): Promise<any | null> { return this.getInstance().getVerificationSummary(); }
  public static updatePointStatus(pointId: string, status: string): Promise<boolean> { return this.getInstance().updatePointStatus(pointId, status); }
  public static deleteMonitoringPoint(pointId: string): Promise<boolean> { return this.getInstance().deleteMonitoringPoint(pointId); }
  public static createMonitoringPoint(point: any): Promise<any> { return this.getInstance().createMonitoringPoint(point); }
  public static checkMonitoringPoint(point: any): Promise<{status:string;value:any;timestamp:string}> { return this.getInstance().checkMonitoringPoint(point); }

  /** Fetch all frameworks */
  public async getFrameworks(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('frameworks')
      .select('*');
    if (error) this.logger.error('getFrameworks failed', { error });
    return data || [];
  }

  /** Fetch monitoring details for one framework */
  public async getFrameworkMonitoring(frameworkId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('monitoring')
      .select('*,frameworks(id,name,description,slug),monitoring_controls(control:controls(id,name,description,category))')
      .eq('framework_id', frameworkId)
      .single();
    if (error) {
      this.logger.error('getFrameworkMonitoring failed', { frameworkId, error });
      return null;
    }
    return data;
  }

  /** Legacy instance methods required by existing UI */
  public async getActiveMonitoring(): Promise<any[]> {
    try {
      // Check if monitoring table exists
      const { count, error: checkError } = await this.supabase
        .from('monitoring')
        .select('*', { count: 'exact', head: true });
        
      if (checkError) {
        // Table might not exist
        this.logger.warn('Monitoring table might not exist', { error: checkError });
        toast.error('Monitoring data unavailable. System maintenance may be in progress.');
        return [];
      }
      
      if (count === 0) {
        this.logger.info('Monitoring table exists but no records found');
        return [];
      }
      
      const { data, error } = await this.supabase
        .from('monitoring')
        .select('*,frameworks(id,name,description,slug),monitoring_controls(control:controls(id,name,description,category))')
        .eq('status', 'active');
      if (error) {
        this.logger.error('getActiveMonitoring failed', { error });
        return [];
      }
      return data || [];
    } catch (err) {
      this.logger.error('getActiveMonitoring exception', { err });
      return [];
    }
  }

  public async getRecentActivities(limit: number = 10): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) this.logger.error('getRecentActivities failed', { error });
    return data || [];
  }

  public async getPendingTasks(limit: number = 10): Promise<any[]> {
    try {
      // Check if monitoring_controls table exists
      const { count, error: checkError } = await this.supabase
        .from('monitoring_controls')
        .select('*', { count: 'exact', head: true });
        
      if (checkError) {
        // Table might not exist
        this.logger.warn('Monitoring controls table might not exist', { error: checkError });
        toast.error('Task data unavailable. Please try again later.');
        return [];
      }
      
      if (count === 0) {
        this.logger.info('Monitoring controls table exists but no records found');
        return [];
      }
      
      const { data, error } = await this.supabase
        .from('monitoring_controls')
        .select('id,control:controls(name,description,category),monitoring(framework:frameworks(id,name)),next_check,status,monitoring(settings)')
        .neq('status', 'compliant')
        .order('next_check', { ascending: true })
        .limit(limit);
        
      if (error) {
        this.logger.error('getPendingTasks failed', { error });
        return [];
      }
      
      return (
        data?.map((item: any) => ({
          id: item.id,
          name: item.control?.name || 'Unknown Control',
          description: item.control?.description || 'No description available',
          category: item.control?.category || 'Uncategorized',
          framework: item.monitoring?.framework?.name || 'Unknown Framework',
          frameworkId: item.monitoring?.framework?.id || null,
          dueDate: item.next_check,
          priority: (item.monitoring?.settings?.priority as any) || 'medium',
          status: item.status || 'pending',
        })) || []
      );
    } catch (err) {
      this.logger.error('getPendingTasks exception', { err });
      return [];
    }
  }

  public async getRiskAssessment(): Promise<any[]> {
    try {
      // Check if risk_assessments table exists
      const { count, error: checkError } = await this.supabase
        .from('risk_assessments')
        .select('*', { count: 'exact', head: true });
        
      if (checkError) {
        // Table might not exist
        this.logger.warn('Risk assessments table might not exist', { error: checkError });
        // Return fallback data for development
        return [
          { category: 'Geographic', level: 'high', count: 2, percentage: 20 },
          { category: 'Geographic', level: 'medium', count: 3, percentage: 30 },
          { category: 'Supply Chain', level: 'low', count: 1, percentage: 10 },
          { category: 'Supply Chain', level: 'medium', count: 2, percentage: 20 },
          { category: 'Product', level: 'high', count: 1, percentage: 10 },
          { category: 'Supplier', level: 'medium', count: 1, percentage: 10 }
        ];
      }
      
      if (count === 0) {
        this.logger.info('Risk assessments table exists but no records found');
        return [];
      }
      
      const { data, error } = await this.supabase
        .from('risk_assessments')
        .select('*');
        
      if (error) {
        this.logger.error('getRiskAssessment failed', { error });
        return [];
      }
      
      const rows = data || [];
      const total = rows.length;
      const summary = rows.reduce((acc: any, r: any) => {
        const key = `${r.category}-${r.risk_level}`;
        if (!acc[key]) acc[key] = { category: r.category, level: r.risk_level, count: 0 };
        acc[key].count++;
        return acc;
      }, {});
      return Object.values(summary).map((item: any) => ({
        ...item,
        percentage: total ? Math.round((item.count / total) * 100) : 0,
      }));
    } catch (err) {
      this.logger.error('getRiskAssessment exception', { err });
      return [];
    }
  }

  public async getVerificationSummary(): Promise<any | null> {
    try {
      // Check if verifications table exists
      const { count, error: checkError } = await this.supabase
        .from('verifications')
        .select('*', { count: 'exact', head: true });
        
      if (checkError) {
        // Table might not exist
        this.logger.warn('Verifications table might not exist', { error: checkError });
        // Return fallback data for development
        return {
          total: 100,
          passed: 60,
          pending: 30,
          failed: 10,
          completionRate: 60
        };
      }
      
      if (count === 0) {
        this.logger.info('Verifications table exists but no records found');
        return {
          total: 0,
          passed: 0,
          pending: 0,
          failed: 0,
          completionRate: 0
        };
      }
      
      const { data, error } = await this.supabase
        .from('verifications')
        .select('total_checks,passed_checks,pending_checks,failed_checks');
        
      if (error) {
        this.logger.error('getVerificationSummary failed', { error });
        return null;
      }
      
      const rows = data || [];
      const summary = rows.reduce(
        (acc: any, r: any) => {
          acc.total += r.total_checks || 0;
          acc.passed += r.passed_checks || 0;
          acc.pending += r.pending_checks || 0;
          acc.failed += r.failed_checks || 0;
          return acc;
        },
        { total: 0, passed: 0, pending: 0, failed: 0 }
      );
      const completionRate = summary.total
        ? Math.round((summary.passed / summary.total) * 100)
        : 0;
      return { ...summary, completionRate };
    } catch (err) {
      this.logger.error('getVerificationSummary exception', { err });
      return null;
    }
  }

  public async updatePointStatus(pointId: string, status: string): Promise<boolean> {
    // TODO: implement actual update using supabase
    return true;
  }

  public async deleteMonitoringPoint(pointId: string): Promise<boolean> {
    // TODO: implement actual delete using supabase
    return true;
  }

  public async createMonitoringPoint(point: any): Promise<any> {
    // TODO: implement actual insert using supabase
    return point;
  }

  public async checkMonitoringPoint(point: any): Promise<{status:string;value:any;timestamp:string}> {
    // TODO: implement actual check using supabase
    return { status: 'passed', value: null, timestamp: new Date().toISOString() };
  }
}

export const monitoringService = MonitoringService.getInstance();
