import { EnhancedControl, EnhancedFramework, MonitoringPoint } from '../types/enhanced-framework';
import { FrameworkValidator } from './framework-validation';

export class FrameworkParser {
  static parseControl(rawControl: any): EnhancedControl {
    // Convert raw data to EnhancedControl format
    const control: EnhancedControl = {
      id: rawControl.id,
      name: rawControl.title, // Map title to name for Control interface
      title: rawControl.title,
      description: rawControl.description,
      category: rawControl.category,
      status: rawControl.status || 'not-started',
      riskLevel: rawControl.riskLevel || 'medium',
      applicability: rawControl.applicability || [],
      references: rawControl.references || [],
      dependencies: rawControl.dependencies || [],
      evidence: [], // Initialize empty evidence array for Control interface
      
      subControls: (rawControl.subControls || []).map((sub: any) => ({
        id: sub.id,
        name: sub.title,
        title: sub.title,
        description: sub.description,
        requirements: sub.requirements || [],
        monitoringPoints: sub.monitoringPoints || []
      })),
      
      evidenceRequirements: {
        required: rawControl.evidence?.required || [],
        optional: rawControl.evidence?.optional || []
      },
      
      monitoringPoints: rawControl.monitoringPoints || []
    };
    
    // Validate the parsed control
    const validation = FrameworkValidator.validateControl(control);
    if (!validation.isValid) {
      throw new Error(`Invalid control data: ${validation.errors.join(', ')}`);
    }
    
    return control;
  }
  
  static parseFramework(rawFramework: any): EnhancedFramework {
    // Convert raw data to EnhancedFramework format
    const framework: EnhancedFramework = {
      id: rawFramework.id,
      name: rawFramework.name,
      description: rawFramework.description,
      version: rawFramework.version,
      categories: rawFramework.categories || [],
      controls: (rawFramework.controls || []).map(this.parseControl),
      mappings: rawFramework.mappings || []
    };
    
    // Validate the parsed framework
    const validation = FrameworkValidator.validateFramework(framework);
    if (!validation.isValid) {
      throw new Error(`Invalid framework data: ${validation.errors.join(', ')}`);
    }
    
    return framework;
  }
  
  static inferMonitoringPoints(control: EnhancedControl): MonitoringPoint[] {
    // Intelligent monitoring point inference based on control content
    const monitoringPoints: MonitoringPoint[] = [];
    
    // Example inference logic
    if (control.title.toLowerCase().includes('access')) {
      monitoringPoints.push({
        type: 'automated',
        metric: 'Access control compliance',
        frequency: 'daily',
        source: 'IAM system'
      });
    }
    
    if (control.title.toLowerCase().includes('policy')) {
      monitoringPoints.push({
        type: 'semi-automated',
        metric: 'Policy review status',
        frequency: 'quarterly',
        source: 'Policy management system'
      });
    }
    
    return monitoringPoints;
  }
  
  static generateControlId(framework: string, domain: string, sequence: number): string {
    return `${framework.toUpperCase()}-${domain}-${sequence.toString().padStart(3, '0')}`;
  }
}
