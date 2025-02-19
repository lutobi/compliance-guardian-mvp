'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { StorageService } from '@/services/storage';
import { Evidence, EvidenceMap } from '@/types/evidence';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import EvidenceDialog from './evidence-dialog';
import { frameworkData } from '@/data/frameworks';



interface FrameworkDetailProps {
  params: { id: string };
}

export function FrameworkDetailContent({ params }: FrameworkDetailProps) {
  const framework = frameworkData[params.id as keyof typeof frameworkData];
  const [selectedSubcontrol, setSelectedSubcontrol] = useState<string | null>(null);
  const [evidenceMap, setEvidenceMap] = useState<EvidenceMap>({});
  const [error, setError] = useState<string>();
  const storageService = new StorageService();

  // Load evidence data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loadEvidence = async () => {
        const result = await storageService.getEvidence(params.id);
        if (result.success) {
          setEvidenceMap(result.data);
        } else {
          setError(result.error?.message);
        }
      };
      loadEvidence();
    }
  }, [params.id]);

  // Save evidence data
  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(evidenceMap).length > 0) {
      const saveEvidence = async () => {
        const result = await storageService.setEvidence(params.id, evidenceMap);
        if (!result.success) {
          setError(result.error?.message);
        }
      };
      saveEvidence();
    }
  }, [evidenceMap, params.id]);
  
  if (!framework) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Framework not found</h1>
        <Link href="/frameworks" className="text-blue-600 hover:underline">
          Back to Frameworks
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="p-8">
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/frameworks" className="text-blue-600 hover:underline">
              ← Back to Frameworks
            </Link>
          </div>
          <h1 className="text-2xl font-bold">{framework.name}</h1>
          <p className="text-gray-600">Version {framework.version}</p>
        </header>

        <div className="space-y-8">
          {framework.controls.map((control: any) => (
            <div key={control.id} className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-2">
                {control.id} - {control.name}
              </h2>
              <p className="text-gray-600 mb-6">{control.description}</p>

              <div className="space-y-4">
                {control.subcontrols.map((subcontrol: any) => (
                  <div 
                    key={subcontrol.id}
                    className="bg-gray-50 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium">
                          {subcontrol.id} - {subcontrol.name}
                        </h3>
                      </div>
                      <button
                        onClick={() => setSelectedSubcontrol(subcontrol.id)}
                        className="ml-4 relative"
                      >
                        📎
                        {evidenceMap[subcontrol.id]?.length > 0 && (
                          <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {evidenceMap[subcontrol.id].length}
                          </span>
                        )}
                      </button>
                    </div>

                    <EvidenceDialog
                      subcontrolId={subcontrol.id}
                      isOpen={selectedSubcontrol === subcontrol.id}
                      onClose={() => setSelectedSubcontrol(null)}
                      onSubmit={(evidence) => {
                        setEvidenceMap(prev => ({
                          ...prev,
                          [subcontrol.id]: [...(prev[subcontrol.id] || []), evidence]
                        }));
                      }}
                      onDelete={(evidenceId) => {
                        setEvidenceMap(prev => ({
                          ...prev,
                          [subcontrol.id]: prev[subcontrol.id].filter(e => e.id !== evidenceId)
                        }));
                      }}
                      onUpdate={(evidenceId, updatedEvidence) => {
                        setEvidenceMap(prev => ({
                          ...prev,
                          [subcontrol.id]: prev[subcontrol.id].map(e => 
                            e.id === evidenceId ? updatedEvidence : e
                          )
                        }));
                      }}
                      existingEvidence={evidenceMap[subcontrol.id] || []}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ErrorBoundary>
  );
}
