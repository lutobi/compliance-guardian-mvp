import { frameworkData } from '@/data/frameworks';
import { Evidence } from '@/types/evidence';
import { MonitoringConfiguration } from '@/types/monitoring';

/**
 * Service to handle mapping between monitoring configurations and framework evidence
 */
export class MonitoringMappingService {
  private static instance: MonitoringMappingService;

  private constructor() {}

  public static getInstance(): MonitoringMappingService {
    if (!MonitoringMappingService.instance) {
      MonitoringMappingService.instance = new MonitoringMappingService();
    }
    return MonitoringMappingService.instance;
  }

  /**
   * Get all subcontrol IDs for a given framework
   */
  getFrameworkSubcontrolIds(frameworkId: string): string[] {
    const framework = frameworkData[frameworkId];
    if (!framework) return [];

    const subcontrolIds: string[] = [];
    framework.controls?.forEach(control => {
      control.subcontrols?.forEach(subcontrol => {
        subcontrolIds.push(subcontrol.id);
      });
    });

    return subcontrolIds;
  }

  /**
   * Get all subcontrol IDs for a specific control
   */
  getControlSubcontrolIds(frameworkId: string, controlId: string): string[] {
    const framework = frameworkData[frameworkId];
    if (!framework) return [];

    const control = framework.controls?.find(c => c.id === controlId);
    if (!control) return [];

    return control.subcontrols?.map(sc => sc.id) || [];
  }

  /**
   * Map monitoring configurations to framework evidence
   * This creates a direct link between what's being monitored and the evidence collected
   */
  mapMonitoringToEvidence(
    monitoringConfigs: MonitoringConfiguration[],
    evidenceMap: Record<string, Evidence[]>
  ): MonitoringConfiguration[] {
    return monitoringConfigs.map(config => {
      // Get all subcontrol IDs that are being monitored
      const monitoredSubcontrolIds: string[] = [];
      
      config.frameworks?.forEach(framework => {
        // For each framework in the monitoring config
        const frameworkId = framework.id;
        
        // Get all controls for this framework
        framework.controls?.forEach(control => {
          // Get all subcontrols for this control
          const subcontrolIds = this.getControlSubcontrolIds(frameworkId, control.id);
          monitoredSubcontrolIds.push(...subcontrolIds);
        });
      });
      
      // Calculate progress based on evidence
      let coveredSubcontrols = 0;
      monitoredSubcontrolIds.forEach(id => {
        if (evidenceMap[id] && evidenceMap[id].length > 0) {
          coveredSubcontrols++;
        }
      });
      
      const progress = monitoredSubcontrolIds.length > 0
        ? (coveredSubcontrols / monitoredSubcontrolIds.length) * 100
        : 0;
      
      // Update the monitoring configuration with the progress
      return {
        ...config,
        overallProgress: Math.round(progress)
      };
    });
  }

  /**
   * Get missing evidence items for a monitored framework
   */
  getMissingEvidenceItems(
    monitoringConfig: MonitoringConfiguration,
    evidenceMap: Record<string, Evidence[]>
  ): { frameworkId: string; controlId: string; subcontrolId: string; name: string }[] {
    const missingItems: { frameworkId: string; controlId: string; subcontrolId: string; name: string }[] = [];
    
    // Early return if no frameworks in config
    if (!monitoringConfig.frameworks) return missingItems;
    
    monitoringConfig.frameworks.forEach(framework => {
      const frameworkId = framework.id;
      // Import the framework data from the imported variable, not the local one
      const frameworkDataItem = frameworkData[frameworkId];
      
      if (!frameworkDataItem) return;
      
      if (framework.controls) {
        framework.controls.forEach(control => {
          const controlData = frameworkDataItem.controls?.find(c => c.id === control.id);
          
          if (!controlData) return;
          
          controlData.subcontrols?.forEach(subcontrol => {
            // Check if evidence exists for this subcontrol
            if (!evidenceMap[subcontrol.id] || evidenceMap[subcontrol.id].length === 0) {
              missingItems.push({
                frameworkId,
                controlId: control.id,
                subcontrolId: subcontrol.id,
                name: subcontrol.name
              });
            }
          });
        });
      }
    });
    
    return missingItems;
  }

  /**
   * Check if a framework is being monitored
   */
  isFrameworkMonitored(frameworkId: string, monitoringConfigs: MonitoringConfiguration[]): boolean {
    return monitoringConfigs.some(config => 
      config.frameworks?.some(f => f.id === frameworkId) || 
      config.selectedFrameworks?.includes(frameworkId)
    );
  }

  /**
   * Get monitoring details for a framework
   */
  getFrameworkMonitoringDetails(frameworkId: string, monitoringConfigs: MonitoringConfiguration[]): MonitoringConfiguration | null {
    return monitoringConfigs.find(config => 
      config.frameworks?.some(f => f.id === frameworkId) ||
      config.selectedFrameworks?.includes(frameworkId)
    ) || null;
  }
}

export const monitoringMappingService = MonitoringMappingService.getInstance();
