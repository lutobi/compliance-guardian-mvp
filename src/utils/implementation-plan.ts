import { ControlVerification } from './control-verification';
import { EnhancedControl } from '@/types/enhanced-framework';

export interface ImplementationTask {
  id: string;
  type: 'control' | 'subcontrol' | 'monitoring' | 'evidence';
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  dependencies: string[];
  estimatedEffort: number; // in hours
  assignedTo?: string;
  dueDate?: Date;
}

export interface ImplementationPlan {
  frameworkId: string;
  generatedAt: Date;
  tasks: ImplementationTask[];
  statistics: {
    totalTasks: number;
    completedTasks: number;
    highPriorityTasks: number;
    estimatedTotalEffort: number;
  };
}

export class ImplementationPlanManager {
  static generatePlan(
    implementedControls: EnhancedControl[],
    frameworkName: string
  ): ImplementationPlan {
    const coverage = ControlVerification.verifyFrameworkCoverage(
      implementedControls,
      frameworkName
    );

    const tasks: ImplementationTask[] = [];
    let highPriorityCount = 0;
    let totalEffort = 0;

    // Add missing controls as tasks
    coverage.missingControls.forEach(controlId => {
      const task: ImplementationTask = {
        id: `impl-${controlId}`,
        type: 'control',
        status: 'pending',
        priority: 'high',
        dependencies: [],
        estimatedEffort: 40 // Base estimate for control implementation
      };
      tasks.push(task);
      highPriorityCount++;
      totalEffort += task.estimatedEffort;
    });

    // Add missing sub-controls as tasks
    Object.entries(coverage.details).forEach(([controlId, detail]) => {
      if (detail.implemented) {
        detail.missingSubControls.forEach(subControlId => {
          const task: ImplementationTask = {
            id: `impl-${subControlId}`,
            type: 'subcontrol',
            status: 'pending',
            priority: 'high',
            dependencies: [controlId],
            estimatedEffort: 20 // Base estimate for sub-control implementation
          };
          tasks.push(task);
          highPriorityCount++;
          totalEffort += task.estimatedEffort;
        });
      }
    });

    // Add monitoring points for implemented controls
    Object.entries(coverage.details).forEach(([controlId, detail]) => {
      if (detail.implemented && detail.monitoringPoints === 0) {
        const task: ImplementationTask = {
          id: `monitoring-${controlId}`,
          type: 'monitoring',
          status: 'pending',
          priority: 'medium',
          dependencies: [controlId],
          estimatedEffort: 16 // Base estimate for monitoring implementation
        };
        tasks.push(task);
        totalEffort += task.estimatedEffort;
      }
    });

    // Sort tasks by priority and dependencies
    tasks.sort((a, b) => {
      if (a.priority === b.priority) {
        return a.dependencies.length - b.dependencies.length;
      }
      return a.priority === 'high' ? -1 : 1;
    });

    // Assign due dates based on dependencies and effort
    let currentDate = new Date();
    tasks.forEach(task => {
      task.dueDate = new Date(currentDate.getTime() + (task.estimatedEffort * 3600000)); // Convert hours to milliseconds
      currentDate = task.dueDate;
    });

    return {
      frameworkId: frameworkName,
      generatedAt: new Date(),
      tasks,
      statistics: {
        totalTasks: tasks.length,
        completedTasks: 0,
        highPriorityTasks: highPriorityCount,
        estimatedTotalEffort: totalEffort
      }
    };
  }

  static generateImplementationTemplate(task: ImplementationTask): string {
    switch (task.type) {
      case 'control':
        return `
export const ${task.id.replace('-', '')}: EnhancedControl = {
  id: '${task.id}',
  title: '',
  description: '',
  category: '',
  status: 'active',
  riskLevel: 'medium',
  applicability: [],
  references: [],
  dependencies: ${JSON.stringify(task.dependencies)},
  
  subControls: [],
  evidence: {
    required: [],
    optional: []
  },
  monitoringPoints: []
};`;
      case 'subcontrol':
        return `
{
  id: '${task.id}',
  title: '',
  description: '',
  requirements: [],
  monitoringPoints: []
}`;
      case 'monitoring':
        return `
{
  type: 'automated',
  metric: '',
  frequency: 'daily',
  source: '',
  threshold: ''
}`;
      default:
        return '';
    }
  }
}
