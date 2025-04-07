'use client';

import { useState } from 'react';
import { FrameworkSummary } from '@/components/frameworks/FrameworkSummary';
import { ProgressRing } from '@/components/ui/progress-ring';
import { calculateControlProgress } from '@/utils/progress';
import { useFrameworkData } from '@/hooks/useFrameworkData';
import { Evidence } from '@/types/evidence';
import { CoverageAnalysis } from '@/components/analysis/CoverageAnalysis';
import { DevOnlyWrapper } from '@/components/development/DevOnlyWrapper';
import EvidenceDialog from '@/app/frameworks/[id]/evidence-dialog';
import { ImplementationPlanManager } from '@/utils/implementation-plan';
import { ChevronDown, ChevronRight, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FrameworkClientProps {
  id: string;
  name: string;
  description: string;
  version: string;
  categories: string[];
}

interface ControlProps {
  control: any;
  evidenceMap: Record<string, Evidence[]>;
  onAddEvidence: (controlId: string, subControlName?: string) => void;
  frameworkId: string;
}

const Control: React.FC<ControlProps> = ({ control, evidenceMap, onAddEvidence, frameworkId }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border rounded-lg mb-4 overflow-hidden">
      <div 
        className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <h3 className="font-medium">{control.name}</h3>
        </div>
        <div className="flex items-center space-x-4">
          <ProgressRing
            value={calculateControlProgress(control, evidenceMap)}
            size={48}
            strokeWidth={5}
            className="text-blue-600"
          />
        </div>
      </div>
      {isExpanded && (
        <div className="p-4">
          <p className="text-gray-600 mb-4">{control.description}</p>
          {control.subcontrols?.map((subControl: any) => {
            const evidenceCount = (evidenceMap[subControl.id] || []).length;
            return (
              <div key={subControl.id} className="ml-4 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{subControl.name}</h4>
                    <p className="text-sm text-gray-600">{subControl.description}</p>
                  </div>
                  <button 
                    className="flex items-center space-x-2 cursor-pointer ml-4 p-2 hover:bg-gray-100 rounded-md"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddEvidence(subControl.id, subControl.name);
                    }}
                  >
                    <Paperclip className="w-4 h-4 text-blue-600" />
                    {evidenceCount > 0 && (
                      <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-600 rounded-full">
                        {evidenceCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export function FrameworkClient({ id, name, description, version, categories }: FrameworkClientProps) {
  const { data: framework, error, loading } = useFrameworkData(id);
  const [evidenceMap, setEvidenceMap] = useState<Record<string, Evidence[]>>({});
  const [selectedControl, setSelectedControl] = useState<string | null>(null);
  const [selectedControlName, setSelectedControlName] = useState<string>('');
  const [isEvidenceDialogOpen, setIsEvidenceDialogOpen] = useState(false);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error || !framework) {
    return (
      <div className="p-8 bg-red-50 text-red-700 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Error Loading Framework</h2>
        <p>{error?.message || 'Framework data not found'}</p>
      </div>
    );
  }

  const handleAddEvidence = (evidence: Evidence) => {
    setEvidenceMap(prev => ({
      ...prev,
      [selectedControl!]: [...(prev[selectedControl!] || []), evidence]
    }));
    setIsEvidenceDialogOpen(false);
  };

  const handleControlClick = (controlId: string, controlName?: string) => {
    setSelectedControl(controlId);
    setSelectedControlName(controlName || '');
    setIsEvidenceDialogOpen(true);
  };

  const handleDeleteEvidence = (evidenceId: string) => {
    if (!selectedControl) return;
    setEvidenceMap(prev => ({
      ...prev,
      [selectedControl]: prev[selectedControl].filter(e => e.id !== evidenceId)
    }));
  };

  const handleUpdateEvidence = (evidenceId: string, updatedEvidence: Evidence) => {
    if (!selectedControl) return;
    setEvidenceMap(prev => ({
      ...prev,
      [selectedControl]: prev[selectedControl].map(e => 
        e.id === evidenceId ? updatedEvidence : e
      )
    }));
  };

  return (
    <div className="space-y-8">
      <div className="space-y-8">
        <div className="flex items-center space-x-8">
          <div>
            <h2 className="text-2xl font-bold">{framework.name}</h2>
            <p className="text-gray-600 mt-1">Version {version}</p>
          </div>
          <p className="text-gray-600 flex-1">{description}</p>
        </div>
        
        <FrameworkSummary controls={framework.controls || []} />
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Controls</h2>
        <div className="space-y-4">
          {framework.controls?.map(control => (
            <Control
              key={control.id}
              control={control}
              evidenceMap={evidenceMap}
              onAddEvidence={handleControlClick}
              frameworkId={id}
            />
          ))}
        </div>
      </div>

      <EvidenceDialog
        isOpen={isEvidenceDialogOpen}
        onClose={() => setIsEvidenceDialogOpen(false)}
        subcontrolId={selectedControl || ''}
        frameworkId={id}
        subcontrolName={selectedControlName}
        onSubmit={handleAddEvidence}
        onDelete={handleDeleteEvidence}
        onUpdate={handleUpdateEvidence}
        existingEvidence={selectedControl ? evidenceMap[selectedControl] || [] : []}
      />
    </div>
  );
}
