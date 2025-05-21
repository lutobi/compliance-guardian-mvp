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
        if (!data) {
          throw new Error('No assessment data returned');
        }
        setAssessment(data);
      } catch (err: any) {
        console.error('Error loading assessment:', err);
        setError(err.message || 'Failed to load assessment');
      }
    }
    load();
  }, [id]);

  useEffect(() => {
    if (assessment?.framework) {
      // Always try to get the complete set of controls from static data for ISO 27001
      const frameworkId = assessment.framework.id;
      const isIso27001 = [
        'iso-27001', 
        'iso27001', 
        'iso27001-2022'
      ].includes(frameworkId) || 
        assessment.framework.name?.toLowerCase().includes('iso 27001') ||
        assessment.framework.name?.toLowerCase().includes('iso/iec 27001');

      if (isIso27001) {
        // For ISO 27001, always use the enhanced static data
        const staticFramework = frameworkData['iso-27001'];
        if (staticFramework?.controls) {
          console.log('Loading complete ISO 27001 controls from static data');
          setAssessment(prev => ({
            ...prev,
            framework: {
              ...prev.framework,
              controls: staticFramework.controls
            }
          }));
          return;
        }
      }
      
      // For other frameworks, only use static data if no controls in API response
      if (!assessment.framework.controls || assessment.framework.controls.length === 0) {
        const possibleSlugs = [
          frameworkId,
          assessment.framework.slug,
          assessment.framework.name?.toLowerCase().replace(/[\s\/]+/g, '-')
        ].filter(Boolean);
        
        // Try each possible slug
        for (const slug of possibleSlugs) {
          if (slug && frameworkData[slug]?.controls) {
            setAssessment(prev => ({
              ...prev,
              framework: {
                ...prev.framework,
                controls: frameworkData[slug].controls
              }
            }));
            break;
          }
        }
      }
    }
  }, [assessment]);

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
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
  
  if (!framework) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-red-600">No framework data found for this assessment</p>
      </div>
    );
  }

  // Extract controls from framework
  let controls = [];
  
  // Hide any script tags that might be in the description
  if (framework.description) {
    framework.description = framework.description.replace(/<script[\s\S]*?<\/script>/gi, '');
  }
  
  // First try to get controls from the API response
  if (framework.controls && framework.controls.length > 0) {
    controls = framework.controls;
  } else {
    // Try to find static framework data using various possible slugs
    const possibleSlugs = [
      framework.id,
      framework.slug,
      'iso-27001',
      'iso27001',
      'iso27001-2022',
      framework.name?.toLowerCase().replace(/[\s\/]+/g, '-'),
      `iso-${framework.name?.toLowerCase().replace(/[\s\/]+/g, '-')}`,
    ].filter(Boolean);
    
    // Get available framework slugs
    const availableSlugs = Object.keys(frameworkData);
    
    // Try each possible slug
    let staticFramework;
    for (const slug of possibleSlugs) {
      if (availableSlugs.includes(slug)) {
        staticFramework = frameworkData[slug];
        if (staticFramework) {
          break;
        }
      }
    }
    
    if (staticFramework && staticFramework.controls) {
      controls = staticFramework.controls;
    }
  }

  // Process controls to ensure they have all required properties
  const processedControls = controls.map((control: any) => {
    // Create a working copy to avoid mutating the original
    const processedControl = { ...control };
    
    // Ensure control has an id
    if (!processedControl.id && processedControl.control_id) {
      processedControl.id = processedControl.control_id;
    }
    
    // Ensure control has a ref for evidence submission
    if (!processedControl.ref && processedControl.control_id) {
      processedControl.ref = processedControl.control_id;
    }
    
    // Add common ISO 27001 controls if they're missing
    const controlId = processedControl.control_id || processedControl.id;
    if (controlId && (!processedControl.subcontrols || processedControl.subcontrols.length === 0)) {
      // A.5 Information security policies
      if (controlId === 'A.5') {
        processedControl.subcontrols = [
          {
            id: 'A.5.1',
            title: 'Information security policies',
            description: 'To provide management direction and support for information security in accordance with business requirements and relevant laws and regulations.'
          },
          {
            id: 'A.5.2',
            title: 'Information security roles and responsibilities',
            description: 'To establish a framework for initiation, implementation, maintenance, and improvement of information security within the organization.'
          },
          {
            id: 'A.5.3',
            title: 'Segregation of duties',
            description: 'Conflicting duties and areas of responsibility shall be segregated to reduce opportunities for unauthorized or unintentional modification or misuse of the organization\'s assets.'
          },
          {
            id: 'A.5.4',
            title: 'Management responsibilities',
            description: 'Management shall require all employees and contractors to apply information security in accordance with the established policies and procedures of the organization.'
          },
          {
            id: 'A.5.5',
            title: 'Contact with authorities',
            description: 'Appropriate contacts with relevant authorities shall be maintained.'
          },
        ];
      }
      // A.6 Organization of information security
      else if (controlId === 'A.6') {
        processedControl.subcontrols = [
          {
            id: 'A.6.1',
            title: 'Internal organization',
            description: 'A framework of management initiatives, roles and responsibilities for information security should be established.'
          },
          {
            id: 'A.6.2',
            title: 'Mobile devices and teleworking',
            description: 'Security for mobile devices and teleworking should be implemented to manage the risks of working in an unprotected environment.'
          }
        ];
      }
      // A.8 Asset management
      else if (controlId === 'A.8') {
        processedControl.subcontrols = [
          {
            id: 'A.8.1',
            title: 'Responsibility for assets',
            description: 'To identify organizational assets and define appropriate protection responsibilities.'
          },
          {
            id: 'A.8.2',
            title: 'Information classification',
            description: 'To ensure that information receives an appropriate level of protection in accordance with its importance to the organization.'
          },
          {
            id: 'A.8.3',
            title: 'Media handling',
            description: 'To prevent unauthorized disclosure, modification, removal or destruction of information stored on media.'
          }
        ];
      }
      // A.9 Access control
      else if (controlId === 'A.9') {
        processedControl.subcontrols = [
          {
            id: 'A.9.1',
            title: 'Business requirements of access control',
            description: 'To limit access to information and information processing facilities.'
          },
          {
            id: 'A.9.2',
            title: 'User access management',
            description: 'To ensure authorized user access and to prevent unauthorized access to systems and services.'
          },
          {
            id: 'A.9.3',
            title: 'User responsibilities',
            description: 'To make users accountable for safeguarding their authentication information.'
          },
          {
            id: 'A.9.4',
            title: 'System and application access control',
            description: 'To prevent unauthorized access to systems and applications.'
          }
        ];
      }
      // A.12 Operations security
      else if (controlId === 'A.12') {
        processedControl.subcontrols = [
          {
            id: 'A.12.1',
            title: 'Operational procedures and responsibilities',
            description: 'To ensure correct and secure operations of information processing facilities.'
          },
          {
            id: 'A.12.2',
            title: 'Protection from malware',
            description: 'To ensure that information and information processing facilities are protected against malware.'
          },
          {
            id: 'A.12.3',
            title: 'Backup',
            description: 'To protect against loss of data.'
          },
          {
            id: 'A.12.4',
            title: 'Logging and monitoring',
            description: 'To record events and generate evidence.'
          },
          {
            id: 'A.12.5',
            title: 'Control of operational software',
            description: 'To ensure the integrity of operational systems.'
          },
          {
            id: 'A.12.6',
            title: 'Technical vulnerability management',
            description: 'To prevent exploitation of technical vulnerabilities.'
          }
        ];
      }
      // A.18 Compliance
      else if (controlId === 'A.18') {
        processedControl.subcontrols = [
          {
            id: 'A.18.1',
            title: 'Compliance with legal and contractual requirements',
            description: 'To avoid breaches of legal, statutory, regulatory or contractual obligations related to information security and of any security requirements.'
          },
          {
            id: 'A.18.2',
            title: 'Information security reviews',
            description: 'To ensure that information security is implemented and operated in accordance with the organizational policies and procedures.'
          }
        ];
      }
    }

    // Format the control object consistently
    return {
      id: processedControl.id,
      ref: processedControl.ref || processedControl.control_id,
      name: processedControl.control_id === 'A.5' ? 'A.5 Information security policies' : (processedControl.title || processedControl.name),
      description: processedControl.description,
      status: processedControl.status || processedControl.implementation_status || 'not-started',
      control_id: processedControl.control_id,
      subcontrols: (processedControl.subcontrols || []).map((sub: any) => ({
        id: sub.id,
        title: sub.title,
        description: sub.description,
        control_id: processedControl.control_id
      }))
    };
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">{assessment.name}</h1>
      <p><strong>Status:</strong> {assessment.status.replace('_', ' ')}</p>
      <p><strong>Framework:</strong> {framework.name}</p>
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
        <FrameworkSummary controls={processedControls} evidenceMap={evidenceMap} />
      </div>
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Controls</h2>
        <ul className="space-y-4">
          {processedControls.map((control: any) => {
            const progress = calculateControlProgress(control, evidenceMap);
            return (
              <details key={control.id} className="border rounded-lg mb-4 overflow-hidden">
                <summary className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100">
                  <div className="flex-1">
                    <h3 className="font-medium">{control.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{control.description}</p>
                  </div>
                  <ProgressRing value={progress} size={32} strokeWidth={4} className="text-blue-600 ml-4" />
                </summary>
                <div className="p-4">
                  {control.subcontrols && control.subcontrols.length > 0 && (
                    <ul className="space-y-4">
                      {control.subcontrols.map((sub: any) => (
                        <li key={sub.id} className="border-l-2 border-gray-200 pl-4">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{sub.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{sub.description}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAddEvidence(control.ref || control.id, sub.id, sub.title)}
                              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                            >
                              <Paperclip className="w-4 h-4 text-blue-600" />
                              {evidenceMap[sub.id]?.length > 0 && (
                                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-600 rounded-full">
                                  {evidenceMap[sub.id]!.length}
                                </span>
                              )}
                            </button>
                          </div>
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
      {isEvidenceDialogOpen && selectedSubcontrolId && selectedControlId && (
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
