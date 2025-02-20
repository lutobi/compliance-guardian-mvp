'use client';

import { useState } from 'react';
import { useFrameworkData } from '@/hooks/useFrameworkData';
import { Evidence } from '@/types/evidence';
import { CoverageAnalysis } from '@/components/analysis/CoverageAnalysis';
import { DevOnlyWrapper } from '@/components/development/DevOnlyWrapper';
import EvidenceDialog from '@/app/frameworks/[id]/evidence-dialog';
import { ImplementationPlanManager } from '@/utils/implementation-plan';

interface FrameworkClientProps {
  id: string;
  name: string;
  description: string;
  version: string;
  categories: string[];
}

export function FrameworkClient({ id, name, description, version, categories }: FrameworkClientProps) {
  const { data: framework, error, loading } = useFrameworkData(id);
  const [evidenceMap, setEvidenceMap] = useState<Record<string, Evidence[]>>({});
  const [selectedSubcontrol, setSelectedSubcontrol] = useState<string | null>(null);
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
      [selectedSubcontrol!]: [...(prev[selectedSubcontrol!] || []), evidence]
    }));
    setIsEvidenceDialogOpen(false);
  };

  const handleDeleteEvidence = (evidenceId: string) => {
    setEvidenceMap(prev => ({
      ...prev,
      [selectedSubcontrol!]: prev[selectedSubcontrol!].filter(e => e.type !== evidenceId)
    }));
  };

  const handleUpdateEvidence = (evidenceId: string, updatedEvidence: Evidence) => {
    setEvidenceMap(prev => ({
      ...prev,
      [selectedSubcontrol!]: prev[selectedSubcontrol!].map(e => 
        e.type === evidenceId ? updatedEvidence : e
      )
    }));
  };

  return (
    <div>
      <div className="mb-8">
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>Version: {version}</span>
          <span>Categories: {categories.join(', ')}</span>
        </div>
      </div>

      {/* Controls Section */}
      <div className="space-y-8">
        {framework.controls.map(control => (
          <div key={control.id} className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">{control.name}</h3>
            <p className="text-gray-600 mb-6">{control.description}</p>
            
            {/* Subcontrols */}
            <div className="space-y-4">
              {control.subcontrols?.map((subcontrol) => (
                <div key={subcontrol.id} className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium mb-2">{subcontrol.name}</h4>
                  <p className="text-gray-600 mb-4">{subcontrol.description}</p>
                  
                  {/* Evidence Section */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-medium">Evidence</h5>
                      <button
                        onClick={() => {
                          setSelectedSubcontrol(subcontrol.id);
                          setIsEvidenceDialogOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        + Add Evidence
                      </button>
                    </div>
                    
                    {/* Evidence List */}
                    <div className="space-y-2">
                      {evidenceMap[subcontrol.id]?.map(evidence => (
                        <div key={evidence.id} className="bg-gray-50 p-3 rounded">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{evidence.type}</p>
                              <p className="text-sm text-gray-600">{evidence.notes}</p>
                            </div>
                            <button
                              onClick={() => handleDeleteEvidence(evidence.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Development Section */}
      <DevOnlyWrapper>
        <div className="mt-12 border-t pt-8">
          <h2 className="text-xl font-bold mb-6">Development Tools</h2>
          
          {/* Coverage Analysis */}
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-4">Coverage Analysis</h3>
            <CoverageAnalysis controls={framework.controls} />
          </div>
          
          {/* Implementation Plan */}
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-4">Implementation Plan</h3>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
              {JSON.stringify(
                ImplementationPlanManager.generatePlan(
                  framework.controls,
                  framework.name
                ),
                null,
                2
              )}
            </pre>
          </div>
        </div>
      </DevOnlyWrapper>

      {/* Evidence Dialog */}
      {selectedSubcontrol && (
        <EvidenceDialog
          subcontrolId={selectedSubcontrol}
          isOpen={isEvidenceDialogOpen}
          onClose={() => setIsEvidenceDialogOpen(false)}
          onSubmit={handleAddEvidence}
          onDelete={handleDeleteEvidence}
          onUpdate={handleUpdateEvidence}
          existingEvidence={evidenceMap[selectedSubcontrol]}
        />
      )}
    </div>
  );
}
