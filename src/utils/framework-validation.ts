import { EnhancedControl, EnhancedFramework, MonitoringPoint, EvidenceRequirement } from '../types/enhanced-framework';

export class FrameworkValidator {
  static validateControl(control: EnhancedControl): ValidationResult {
    const errors: string[] = [];
    
    // Basic validation
    if (!control.id) errors.push('Control ID is required');
    if (!control.title) errors.push('Control title is required');
    if (!control.description) errors.push('Control description is required');
    
    // Sub-controls validation
    if (control.subControls) {
      control.subControls.forEach((sub, index) => {
        if (!sub.id) errors.push(`Sub-control ${index} missing ID`);
        if (!sub.title) errors.push(`Sub-control ${index} missing title`);
        if (!sub.description) errors.push(`Sub-control ${index} missing description`);
      });
    }
    
    // Monitoring points validation
    if (control.monitoringPoints) {
      control.monitoringPoints.forEach((point, index) => {
        if (!this.validateMonitoringPoint(point)) {
          errors.push(`Invalid monitoring point at index ${index}`);
        }
      });
    }
    
    // Evidence validation
    if (control.evidence) {
      control.evidence?.forEach((req, index) => {
        if (!this.validateEvidenceRequirement(req)) {
          errors.push(`Invalid required evidence at index ${index}`);
        }
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  static validateMonitoringPoint(point: MonitoringPoint): boolean {
    return !!(
      point.type &&
      point.metric &&
      point.frequency &&
      point.source &&
      ['automated', 'semi-automated', 'manual'].includes(point.type)
    );
  }
  
  static validateEvidenceRequirement(req: EvidenceRequirement): boolean {
    return !!(
      req.type &&
      req.description &&
      req.frequency &&
      req.retention
    );
  }
  
  static validateFramework(framework: EnhancedFramework): ValidationResult {
    const errors: string[] = [];
    
    // Basic framework validation
    if (!framework.id) errors.push('Framework ID is required');
    if (!framework.name) errors.push('Framework name is required');
    if (!framework.version) errors.push('Framework version is required');
    
    // Controls validation
    framework.controls.forEach((control, index) => {
      const controlValidation = this.validateControl(control);
      if (!controlValidation.isValid) {
        errors.push(`Control ${index} (${control.id}) has errors: ${controlValidation.errors.join(', ')}`);
      }
    });
    
    // Mappings validation if present
    if (framework.mappings) {
      framework.mappings.forEach((mapping, index) => {
        if (!mapping.sourceControl || !mapping.targetControl) {
          errors.push(`Invalid mapping at index ${index}`);
        }
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
