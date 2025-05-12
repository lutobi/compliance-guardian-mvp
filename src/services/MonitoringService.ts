import { supabase } from '@/lib/supabase';
import logger from '@/utils/logger';

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
    // TODO: implement actual query using supabase
    return [];
  }

  public async getPendingTasks(limit: number = 10): Promise<any[]> {
    // TODO: implement actual query using supabase
    return [];
  }

  public async getRiskAssessment(): Promise<any[]> {
    // TODO: implement actual query using supabase
    return [];
  }

  public async getVerificationSummary(): Promise<any | null> {
    // TODO: implement actual query using supabase
    return null;
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
