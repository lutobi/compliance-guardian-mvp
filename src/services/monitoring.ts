import { EnhancedControl, MonitoringPoint, EvidenceRequirement } from '../types/enhanced-framework';

export class MonitoringService {
  private static instance: MonitoringService;
  private monitoringIntervals: Map<string, ReturnType<typeof setInterval>> = new Map();
  private statusCache: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  startMonitoring(control: EnhancedControl) {
    control.monitoringPoints.forEach(point => {
      const intervalKey = `${control.id}-${point.metric}`;
      
      // Clear existing interval if any
      if (this.monitoringIntervals.has(intervalKey)) {
        const existingInterval = this.monitoringIntervals.get(intervalKey);
        if (existingInterval) clearInterval(existingInterval);
      }

      // Set up new monitoring interval
      const interval = setInterval(
        () => this.checkMonitoringPoint(control, point),
        this.getCheckFrequency(point.frequency)
      );

      this.monitoringIntervals.set(intervalKey, interval);
    });
  }

  private async checkMonitoringPoint(control: EnhancedControl, point: MonitoringPoint) {
    try {
      const status = await this.getMonitoringStatus(control, point);
      this.statusCache.set(`${control.id}-${point.metric}`, status);

      if (!this.isCompliant(status, point.threshold)) {
        this.triggerAlert(control, point, status);
      }

      // Update evidence if needed
      if (this.shouldCollectEvidence(control, point)) {
        await this.collectEvidence(control, point, status);
      }
    } catch (error) {
      console.error(`Monitoring error for ${control.id}:`, error);
      this.triggerAlert(control, point, 'ERROR');
    }
  }

  private getCheckFrequency(frequency: string): number {
    const frequencies: Record<string, number> = {
      'real-time': 1000 * 60, // 1 minute
      'hourly': 1000 * 60 * 60,
      'daily': 1000 * 60 * 60 * 24,
      'weekly': 1000 * 60 * 60 * 24 * 7,
      'monthly': 1000 * 60 * 60 * 24 * 30,
      'quarterly': 1000 * 60 * 60 * 24 * 90
    };

    return frequencies[frequency] || frequencies['daily'];
  }

  private async getMonitoringStatus(control: EnhancedControl, point: MonitoringPoint) {
    // This would integrate with actual monitoring systems
    switch (point.source) {
      case 'IAM system':
        return this.checkIAMStatus(control, point);
      case 'Policy management system':
        return this.checkPolicyStatus(control, point);
      default:
        return this.checkGenericStatus(control, point);
    }
  }

  private async checkIAMStatus(control: EnhancedControl, point: MonitoringPoint) {
    // Implement IAM system integration
    return {
      status: 'compliant',
      lastCheck: new Date(),
      metric: point.metric,
      value: '100%'
    };
  }

  private async checkPolicyStatus(control: EnhancedControl, point: MonitoringPoint) {
    // Implement policy management system integration
    return {
      status: 'compliant',
      lastCheck: new Date(),
      metric: point.metric,
      value: 'current'
    };
  }

  private async checkGenericStatus(control: EnhancedControl, point: MonitoringPoint) {
    // Generic status check
    return {
      status: 'unknown',
      lastCheck: new Date(),
      metric: point.metric,
      value: 'unchecked'
    };
  }

  private isCompliant(status: any, threshold?: string): boolean {
    if (!threshold) return status.status === 'compliant';
    
    // Parse threshold and compare
    const thresholdValue = parseInt(threshold);
    const actualValue = parseInt(status.value);
    return !isNaN(thresholdValue) && !isNaN(actualValue) && actualValue >= thresholdValue;
  }

  private triggerAlert(control: EnhancedControl, point: MonitoringPoint, status: any) {
    // Implement alert system integration
    console.log(`Alert: ${control.id} - ${point.metric} - Non-compliant status: ${status}`);
  }

  private shouldCollectEvidence(control: EnhancedControl, point: MonitoringPoint): boolean {
    const evidenceReq = control.evidence?.find(
      e => e.type === point.metric
    );
    
    if (!evidenceReq) return false;

    const lastCollection = this.statusCache.get(`${control.id}-${point.metric}-evidence`);
    if (!lastCollection) return true;

    return this.isEvidenceCollectionDue(lastCollection, evidenceReq);
  }

  private isEvidenceCollectionDue(lastCollection: Date, requirement: EvidenceRequirement): boolean {
    const now = new Date();
    const last = new Date(lastCollection);
    const frequency = this.getCheckFrequency(requirement.frequency);
    
    return now.getTime() - last.getTime() >= frequency;
  }

  private async collectEvidence(control: EnhancedControl, point: MonitoringPoint, status: any) {
    // Implement evidence collection
    const evidence = {
      controlId: control.id,
      metric: point.metric,
      timestamp: new Date(),
      status: status,
      source: point.source
    };

    // Store evidence
    this.statusCache.set(`${control.id}-${point.metric}-evidence`, evidence);
    console.log(`Evidence collected for ${control.id}:`, evidence);
  }

  stopMonitoring(control: EnhancedControl) {
    control.monitoringPoints.forEach(point => {
      const intervalKey = `${control.id}-${point.metric}`;
      if (this.monitoringIntervals.has(intervalKey)) {
        clearInterval(this.monitoringIntervals.get(intervalKey));
        this.monitoringIntervals.delete(intervalKey);
      }
    });
  }

  getStatus(control: EnhancedControl): any {
    return control.monitoringPoints.map(point => ({
      metric: point.metric,
      status: this.statusCache.get(`${control.id}-${point.metric}`) || 'unknown'
    }));
  }
}
