import { frameworkData } from '@/data/frameworks';
import { FrameworkData } from '@/types/framework';
import { Evidence } from '@/types/evidence';

/**
 * Service to handle mapping between monitoring configurations and framework evidence
 */
export class FrameworkMappingService {
  private static instance: FrameworkMappingService;

  private constructor() {}

  public static getInstance(): FrameworkMappingService {
    if (!FrameworkMappingService.instance) {
      FrameworkMappingService.instance = new FrameworkMappingService();
    }
    return FrameworkMappingService.instance;
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
   * Calculate progress for a framework based on evidence collected
   */
  calculateFrameworkProgress(frameworkId: string, evidenceMap: Record<string, Evidence[]>): number {
    const subcontrolIds = this.getFrameworkSubcontrolIds(frameworkId);
    if (subcontrolIds.length === 0) return 0;

    let coveredSubcontrols = 0;
    subcontrolIds.forEach(id => {
      if (evidenceMap[id] && evidenceMap[id].length > 0) {
        coveredSubcontrols++;
      }
    });

    return (coveredSubcontrols / subcontrolIds.length) * 100;
  }

  /**
   * Calculate progress for a specific control based on evidence collected
   */
  calculateControlProgress(frameworkId: string, controlId: string, evidenceMap: Record<string, Evidence[]>): number {
    const subcontrolIds = this.getControlSubcontrolIds(frameworkId, controlId);
    if (subcontrolIds.length === 0) return 0;

    let coveredSubcontrols = 0;
    subcontrolIds.forEach(id => {
      if (evidenceMap[id] && evidenceMap[id].length > 0) {
        coveredSubcontrols++;
      }
    });

    return (coveredSubcontrols / subcontrolIds.length) * 100;
  }

  /**
   * Get all subcontrols for a framework with their evidence status
   */
  getFrameworkSubcontrolsWithStatus(frameworkId: string, evidenceMap: Record<string, Evidence[]>): any[] {
    const framework = frameworkData[frameworkId];
    if (!framework) return [];

    const result: any[] = [];
    framework.controls?.forEach(control => {
      control.subcontrols?.forEach(subcontrol => {
        const hasEvidence = evidenceMap[subcontrol.id] && evidenceMap[subcontrol.id].length > 0;
        result.push({
          id: subcontrol.id,
          name: subcontrol.name,
          controlId: control.id,
          controlName: control.name,
          hasEvidence,
          evidenceCount: hasEvidence ? evidenceMap[subcontrol.id].length : 0
        });
      });
    });

    return result;
  }

  /**
   * Get missing evidence items for a monitored framework
   */
  getMissingEvidenceItems(frameworkId: string, evidenceMap: Record<string, Evidence[]>): any[] {
    const subcontrolsWithStatus = this.getFrameworkSubcontrolsWithStatus(frameworkId, evidenceMap);
    return subcontrolsWithStatus.filter(item => !item.hasEvidence);
  }
}

export const frameworkMappingService = FrameworkMappingService.getInstance();
