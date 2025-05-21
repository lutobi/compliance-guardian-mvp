import { Evidence } from '@/types/evidence';

interface Control {
  id: string;
  name: string;
  description: string;
  subcontrols?: {
    id: string;
    name: string;
    description: string;
  }[];
}

export function calculateControlProgress(
  control: Control,
  evidenceMap: Record<string, Evidence[]>
): number {
  try {
    // Validate input
    if (!control) {
      console.warn('calculateControlProgress: No control provided');
      return 0;
    }

    if (!control.subcontrols || !Array.isArray(control.subcontrols)) {
      console.warn(`calculateControlProgress: No subcontrols for control ${control.id}`);
      return 0;
    }

    if (!evidenceMap) {
      console.warn('calculateControlProgress: No evidence map provided');
      return 0;
    }

    // Calculate progress
    const total = control.subcontrols.length;
    if (total === 0) {
      console.warn(`calculateControlProgress: Control ${control.id} has no subcontrols`);
      return 0;
    }

    const completed = control.subcontrols.filter(sub => {
      if (!sub?.id) {
        console.warn(`calculateControlProgress: Invalid subcontrol in control ${control.id}`);
        return false;
      }
      const evidence = evidenceMap[sub.id];
      return Array.isArray(evidence) && evidence.length > 0;
    }).length;

    const progress = Math.round((completed / total) * 100);
    console.debug(`Progress for control ${control.id}: ${progress}% (${completed}/${total})`);
    return progress;
  } catch (error) {
    console.error('Error calculating control progress:', error);
    return 0;
  }
}
