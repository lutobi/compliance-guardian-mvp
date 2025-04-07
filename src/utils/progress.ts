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
  const total = control.subcontrols?.length || 0;
  if (total === 0) return 0;
  
  const completed = control.subcontrols?.filter(
    sub => (evidenceMap[sub.id]?.length || 0) > 0
  ).length || 0;
  
  return Math.round((completed / total) * 100);
}
