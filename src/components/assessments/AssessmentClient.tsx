'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useAssessmentEvidence } from '@/hooks/useAssessmentEvidence';
import { FrameworkSummary } from '@/components/frameworks/FrameworkSummary';
import type { Evidence } from '@/types/evidence';
import { ProgressRing } from '@/components/ui/progress-ring';
import { calculateControlProgress } from '@/utils/progress';
import { Paperclip } from 'lucide-react';
import { EvidenceDialog } from '@/app/dashboard/frameworks/[slug]/evidence-dialog';
import { frameworkData } from '@/data/frameworks';

interface AssessmentClientProps {
  id: string;
}

export default function AssessmentClient({ id }: AssessmentClientProps) {
  const [assessment, setAssessment] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  // Fetch assessment-scoped evidence
  const { evidence: assessmentEvidence, loading: assessmentEvidenceLoading } = useAssessmentEvidence(id);
  // Local state to track evidence and update UI after mutations
  const [localEvidence, setLocalEvidence] = useState<Evidence[]>([]);
  useEffect(() => {
    setLocalEvidence(assessmentEvidence);
  }, [assessmentEvidence]);
  // Group evidence by subcontrol using localEvidence
  const evidenceMap: Record<string, Evidence[]> = {};
  localEvidence.forEach(e => {
    if (!evidenceMap[e.subcontrolId]) evidenceMap[e.subcontrolId] = [];
    evidenceMap[e.subcontrolId].push(e);
  });
  // State for evidence dialog
  const [selectedSubcontrolId, setSelectedSubcontrolId] = useState<string | null>(null);
  const [selectedSubcontrolName, setSelectedSubcontrolName] = useState<string>('');
  const [selectedControlId, setSelectedControlId] = useState<string | null>(null);
  const [isEvidenceDialogOpen, setIsEvidenceDialogOpen] = useState(false);
  const handleAddEvidence = (controlId: string, subId: string, subName: string) => {
    setSelectedControlId(controlId);
    setSelectedSubcontrolId(subId);
    setSelectedSubcontrolName(subName);
    setIsEvidenceDialogOpen(true);
  };

  useEffect(() => {
    async function load() {
      try {
        const data = await api.assessments.get(id);
        setAssessment(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load assessment');
      }
    }
    load();
  }, [id]);

  useEffect(() => {
    if (assessment?.framework) {
      console.log('Detail framework.controls from API:', assessment.framework.controls);
      const sf = frameworkData[assessment.framework.id];
      console.log('Detail fallback staticFramework.controls:', sf?.controls);
    }
  }, [assessment]);

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <p className="mt-2 text-sm text-gray-500">Loading assessment...</p>
        </div>
      </div>
    );
  }

  const framework = assessment.framework;
  // Prefer API controls; fallback to static by slug or computed slug
  const controlsFromApi = Array.isArray(framework.controls) ? framework.controls : [];
  const computedSlug = framework.slug || framework.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const controlsStatic = frameworkData[computedSlug]?.controls || [];
  const controls = (controlsFromApi.length > 0 ? controlsFromApi : controlsStatic).map((ctrl: any) => ({
    ...ctrl,
    status: ctrl.status ?? 'not-started',
  }));

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{assessment.name}</h1>
      <p><strong>Status:</strong> {assessment.status.replace('_', ' ')}</p>
      <p><strong>Framework:</strong> {framework.name}</p>
      {/* DEBUG: show controls data */}
      <pre className="bg-yellow-100 p-2 text-xs my-2">Controls debug: {JSON.stringify(controls, null, 2)}</pre>
      {assessment.description && (
        <p className="mt-2"><strong>Description:</strong> {assessment.description}</p>
      )}
      <div className="mt-4">
        <Link href="/dashboard/assessments" className="inline-block px-4 py-2 bg-blue-600 text-white rounded">
          Back to Assessments
        </Link>
      </div>
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Framework Details</h2>
        <p><strong>Name:</strong> {framework.name}</p>
        <p><strong>Version:</strong> {framework.version}</p>
        {framework.categories && framework.categories.length > 0 && (
          <p><strong>Categories:</strong> {framework.categories.join(', ')}</p>
        )}
        <p className="mt-2">{framework.description}</p>
      </div>
      <div className="mt-8">
        <FrameworkSummary controls={controls} evidenceMap={evidenceMap} />
      </div>
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Controls</h2>
        <ul className="space-y-4">
          {controls.map((control: any) => {
            const progress = calculateControlProgress(control, evidenceMap);
            return (
              <details key={control.id} className="border rounded-lg mb-4 overflow-hidden">
                <summary className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100">
                  <h3 className="font-medium">{control.name}</h3>
                  <ProgressRing value={progress} size={32} strokeWidth={4} className="text-blue-600" />
                </summary>
                <div className="p-4">
                  {control.description && <p className="text-sm text-gray-600 mb-4">{control.description}</p>}
                  {control.subcontrols?.length > 0 && (
                    <ul className="space-y-2">
                      {control.subcontrols.map((sub: any) => (
                        <li key={sub.id} className="flex justify-between items-center">
                          <span>{sub.name}</span>
                          <button
                            type="button"
                            onClick={() => handleAddEvidence(control.id, sub.id, sub.name)}
                            className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md"
                          >
                            <Paperclip className="w-4 h-4 text-blue-600" />
                            {evidenceMap[sub.id]?.length > 0 && (
                              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-600 rounded-full">
                                {evidenceMap[sub.id]!.length}
                              </span>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </details>
            );
          })}
        </ul>
      </div>
      {/* Evidence dialog for assessment */}
      {isEvidenceDialogOpen && selectedSubcontrolId && (
        <EvidenceDialog
          controlId={selectedControlId}
          subcontrolId={selectedSubcontrolId}
          assessmentId={id}
          frameworkId={framework.id}
          subcontrolName={selectedSubcontrolName}
          isOpen={isEvidenceDialogOpen}
          onClose={() => setIsEvidenceDialogOpen(false)}
          onSubmit={(e) => setLocalEvidence(prev => [e, ...prev])}
          onDelete={(id) => setLocalEvidence(prev => prev.filter(item => item.id !== id))}
          onUpdate={(id, e) => setLocalEvidence(prev => prev.map(item => item.id === id ? e : item))}
          existingEvidence={evidenceMap[selectedSubcontrolId] || []}
        />
      )}
    </div>
  );
}
