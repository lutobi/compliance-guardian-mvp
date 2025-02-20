'use client';

import { EnhancedControl } from '@/types/enhanced-framework';
import { ImplementationPlanManager } from '@/utils/implementation-plan';

interface ImplementationPlanViewProps {
  implementedControls: EnhancedControl[];
  frameworkName: string;
}

export function ImplementationPlanView({ implementedControls, frameworkName }: ImplementationPlanViewProps) {
  const plan = ImplementationPlanManager.generatePlan(implementedControls, frameworkName);
  
  return (
    <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
      {JSON.stringify(plan, null, 2)}
    </pre>
  );
}
