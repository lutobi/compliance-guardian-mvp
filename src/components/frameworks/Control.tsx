import React from 'react';
import { ChevronRight } from 'lucide-react';
import type { Control as FrameworkControl } from '@/types/framework';
import type { Evidence } from '@/types/evidence';

interface ControlProps {
  control: FrameworkControl;
  evidenceMap: Record<string, Evidence[]>;
  onAddEvidence: (controlId: string, controlName: string) => void;
}

export const ControlComponent: React.FC<ControlProps> = React.memo(({ control, evidenceMap, onAddEvidence }) => {
  const handleAddEvidence = () => {
    onAddEvidence(control.id, control.name);
  };

  const calculateControlProgress = () => {
    const subcontrolCount = control.subcontrols?.length || 0;
    if (subcontrolCount === 0) return 0;

    let completedCount = 0;
    control.subcontrols?.forEach(subcontrol => {
      if (evidenceMap[subcontrol.id]?.length > 0) {
        completedCount++;
      }
    });

    return Math.round((completedCount / subcontrolCount) * 100);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{control.name}</h3>
          <p className="text-sm text-gray-600">{control.description}</p>
        </div>
        <button
          onClick={handleAddEvidence}
          className="flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          Add Evidence
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-gray-600">{calculateControlProgress()}%</span>
        </div>
        <div className="mt-2 h-2 bg-gray-200 rounded-full">
          <div
            className="h-full bg-blue-600 rounded-full transition-all"
            style={{ width: `${calculateControlProgress()}%` }}
          />
        </div>
      </div>
    </div>
  );
});

ControlComponent.displayName = 'Control';
