import { EnhancedControl, EnhancedFramework } from '../types/enhanced-framework';

interface ControlCoverage {
  totalControls: number;
  implementedControls: number;
  missingControls: string[];
  coverage: number;
  details: {
    [controlId: string]: {
      implemented: boolean;
      subControlsCoverage: number;
      missingSubControls: string[];
      monitoringPoints: number;
      evidenceRequirements: number;
    };
  };
}

interface FrameworkReference {
  [key: string]: {
    controls: {
      id: string;
      title: string;
      subControls: { id: string; title: string; }[];
    }[];
  };
}

// Reference data for ISO 27001:2022
const FRAMEWORK_REFERENCES: FrameworkReference = {
  'ISO 27001:2022': {  // This will match both 'ISO 27001' and 'ISO 27001:2022'
    controls: [
      {
        id: 'A.5',
        title: 'Information Security Policies',
        subControls: [
          { id: 'A.5.1', title: 'Policies for information security' },
          { id: 'A.5.2', title: 'Review of the policies for information security' }
        ]
      },
      {
        id: 'A.6',
        title: 'Organization of information security',
        subControls: [
          { id: 'A.6.1', title: 'Internal organization' },
          { id: 'A.6.2', title: 'Mobile devices and teleworking' }
        ]
      },
      {
        id: 'A.7',
        title: 'Human resource security',
        subControls: [
          { id: 'A.7.1', title: 'Prior to employment' },
          { id: 'A.7.2', title: 'During employment' },
          { id: 'A.7.3', title: 'Termination and change of employment' }
        ]
      },
      {
        id: 'A.8',
        title: 'Asset management',
        subControls: [
          { id: 'A.8.1', title: 'Responsibility for assets' },
          { id: 'A.8.2', title: 'Information classification' },
          { id: 'A.8.3', title: 'Media handling' }
        ]
      },
      {
        id: 'A.9',
        title: 'Access control',
        subControls: [
          { id: 'A.9.1', title: 'Business requirements of access control' },
          { id: 'A.9.2', title: 'User access management' },
          { id: 'A.9.3', title: 'User responsibilities' },
          { id: 'A.9.4', title: 'System and application access control' }
        ]
      }
      // Add all other controls...
    ]
  }
};

export class ControlVerification {
  static verifyFrameworkCoverage(
    implementedControls: EnhancedControl[],
    frameworkName: string
  ): ControlCoverage {
    // Map framework names to reference keys
    const referenceKey = frameworkName.toLowerCase().includes('iso') ? 'ISO 27001:2022' : frameworkName;
    const referenceFramework = FRAMEWORK_REFERENCES[referenceKey];
    if (!referenceFramework) {
      throw new Error(`Reference data not found for framework: ${frameworkName}`);
    }

    const coverage: ControlCoverage = {
      totalControls: referenceFramework.controls.length,
      implementedControls: 0,
      missingControls: [],
      coverage: 0,
      details: {}
    };

    // Check each control in the reference framework
    referenceFramework.controls.forEach(refControl => {
      const implemented = implementedControls.find(c => c.id === refControl.id);
      
      coverage.details[refControl.id] = {
        implemented: !!implemented,
        subControlsCoverage: 0,
        missingSubControls: [],
        monitoringPoints: implemented?.monitoringPoints?.length ?? 0,
        evidenceRequirements: (
          (implemented?.evidence?.length ?? 0)
        )

      };

      if (implemented) {
        coverage.implementedControls++;
        
        // Check sub-controls
        const implementedSubControls = implemented?.subControls?.map(s => s.id) ?? [];
        const missingSubControls = refControl.subControls
          .filter(s => !implementedSubControls.includes(s.id))
          .map(s => s.id);

        coverage.details[refControl.id].missingSubControls = missingSubControls;
        const totalSubControls = refControl.subControls?.length ?? 0;
        coverage.details[refControl.id].subControlsCoverage = 
          totalSubControls > 0 ?
          ((totalSubControls - missingSubControls.length) / totalSubControls) * 100 :
          0;
      } else {
        coverage.missingControls.push(refControl.id);
        coverage.details[refControl.id].missingSubControls = 
          refControl.subControls.map(s => s.id);
      }
    });

    coverage.coverage = 
      (coverage.implementedControls / coverage.totalControls) * 100;

    return coverage;
  }

  static generateCoverageReport(coverage: ControlCoverage): string {
    let report = '# Framework Coverage Report\n\n';
    
    report += `## Overall Coverage: ${coverage.coverage.toFixed(2)}%\n`;
    report += `- Total Controls: ${coverage.totalControls}\n`;
    report += `- Implemented Controls: ${coverage.implementedControls}\n`;
    report += `- Missing Controls: ${coverage.missingControls.length}\n\n`;

    report += '## Missing Controls\n';
    coverage.missingControls.forEach(controlId => {
      report += `- ${controlId}\n`;
    });

    report += '\n## Control Details\n';
    Object.entries(coverage.details).forEach(([controlId, detail]) => {
      report += `\n### ${controlId}\n`;
      report += `- Implemented: ${detail.implemented ? 'Yes' : 'No'}\n`;
      report += `- Sub-Controls Coverage: ${detail.subControlsCoverage.toFixed(2)}%\n`;
      report += `- Monitoring Points: ${detail.monitoringPoints}\n`;
      report += `- Evidence Requirements: ${detail.evidenceRequirements}\n`;
      
      if (detail.missingSubControls.length > 0) {
        report += '- Missing Sub-Controls:\n';
        detail.missingSubControls.forEach(subId => {
          report += `  * ${subId}\n`;
        });
      }
    });

    return report;
  }

  static getImplementationPriorities(coverage: ControlCoverage): string[] {
    const priorities: string[] = [];

    // First priority: Controls with no implementation
    coverage.missingControls.forEach(controlId => {
      priorities.push(`Implement control ${controlId}`);
    });

    // Second priority: Controls with missing sub-controls
    Object.entries(coverage.details)
      .filter(([_, detail]) => detail.implemented && detail.missingSubControls.length > 0)
      .forEach(([controlId, detail]) => {
        priorities.push(
          `Complete sub-controls for ${controlId}: ${detail.missingSubControls.join(', ')}`
        );
      });

    // Third priority: Controls with no monitoring points
    Object.entries(coverage.details)
      .filter(([_, detail]) => detail.implemented && detail.monitoringPoints === 0)
      .forEach(([controlId, _]) => {
        priorities.push(`Add monitoring points for ${controlId}`);
      });

    return priorities;
  }
}
