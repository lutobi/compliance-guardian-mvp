'use client';

import { useState, useEffect, useCallback } from 'react';
import { FrameworkSummary } from '@/components/frameworks/FrameworkSummary';
import { ProgressRing } from '@/components/ui/progress-ring';
import { calculateControlProgress } from '@/utils/progress';
import { useFrameworkData } from '@/hooks/useFrameworkData';
import { Evidence } from '@/types/evidence';
import { CoverageAnalysis } from '@/components/analysis/CoverageAnalysis';
import { DevOnlyWrapper } from '@/components/development/DevOnlyWrapper';
import EvidenceDialog from '@/app/frameworks/[slug]/evidence-dialog';
import { ImplementationPlanManager } from '@/utils/implementation-plan';
import { ChevronDown, ChevronRight, Paperclip, Bell, BellOff, Calendar, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFrameworkEvidence } from '@/hooks/useFrameworkEvidence';
import { getFrameworkUuid } from '@/lib/framework-sync';
import { monitoringService } from '@/services/MonitoringService';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { monitoringMappingService } from '@/services/MonitoringMappingService';

interface FrameworkClientProps {
  id: string;
}

interface ControlProps {
  control: any;
  evidenceMap: Record<string, Evidence[]>;
  onAddEvidence: (controlId: string, subControlId: string, subControlName?: string) => void;
  frameworkId: string;
}

const Control: React.FC<ControlProps> = ({ control, evidenceMap, onAddEvidence, frameworkId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Update progress when evidenceMap changes
  useEffect(() => {
    setProgress(calculateControlProgress(control, evidenceMap));
  }, [control, evidenceMap]);

  const handleAddEvidenceClick = (e: React.MouseEvent, subControlId: string, subControlName?: string) => {
    e.stopPropagation();
    e.preventDefault();
    onAddEvidence(control.id, subControlId, subControlName);
  };

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
            value={progress}
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
                    onClick={(e) => handleAddEvidenceClick(e, subControl.id, subControl.name)}
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

export function FrameworkClient({ id }: FrameworkClientProps) {
  const { data: framework, loading, error } = useFrameworkData(id);
  const [selectedControl, setSelectedControl] = useState<string | null>(null);
  const [selectedParentControlId, setSelectedParentControlId] = useState<string | null>(null);
  const [selectedControlName, setSelectedControlName] = useState<string>('');
  const [isEvidenceDialogOpen, setIsEvidenceDialogOpen] = useState(false);
  
  // Use our new hook for better evidence handling
  const { 
    evidenceMap, 
    loading: evidenceLoading, 
    addEvidence, 
    deleteEvidence, 
    updateEvidence,
    refreshEvidence
  } = useFrameworkEvidence(id);

  const [isMonitored, setIsMonitored] = useState(false);
  const [monitoringDetails, setMonitoringDetails] = useState<any>(null);
  const [isLoadingMonitoring, setIsLoadingMonitoring] = useState(true);

  // Check if this framework is being monitored
  useEffect(() => {
    const checkMonitoringStatus = async () => {
      try {
        setIsLoadingMonitoring(true);
        const configs = await monitoringService.getActiveMonitoring();
        
        // Use the mapping service to check if this framework is being monitored
        const isMonitored = monitoringMappingService.isFrameworkMonitored(id, configs);
        const monitoringConfig = monitoringMappingService.getFrameworkMonitoringDetails(id, configs);
        
        if (isMonitored && monitoringConfig) {
          setIsMonitored(true);
          const handleMonitoringFrequencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
            const frequency = e.target.value;
            if (["annually", "quarterly", "monthly"].includes(frequency)) {
              // Handle frequency change
              console.log('Monitoring frequency changed to:', frequency);
            }
          };
          setMonitoringDetails(monitoringConfig);
          
          // Calculate next check date based on frequency
          const frequency = monitoringConfig.frequency || 'monthly';
          const lastUpdated = monitoringConfig.updatedAt || new Date();
          let nextCheckDate = new Date(lastUpdated);
          
          switch(frequency) {
            case 'daily':
              nextCheckDate.setDate(nextCheckDate.getDate() + 1);
              break;
            case 'weekly':
              nextCheckDate.setDate(nextCheckDate.getDate() + 7);
              break;
            case 'monthly':
              nextCheckDate.setMonth(nextCheckDate.getMonth() + 1);
              break;
            case 'quarterly':
              nextCheckDate.setMonth(nextCheckDate.getMonth() + 3);
              break;
            case 'annually':
              nextCheckDate.setFullYear(nextCheckDate.getFullYear() + 1);
              break;
          }
          
          // Update monitoring details with next check date
          setMonitoringDetails(prev => ({
            ...prev,
            nextCheckDate
          }));
        } else {
          setIsMonitored(false);
          setMonitoringDetails(null);
        }
      } catch (error) {
        console.error('Error checking monitoring status:', error);
        setIsMonitored(false);
      } finally {
        setIsLoadingMonitoring(false);
      }
    };
    
    checkMonitoringStatus();
  }, [id]);

  if (loading || evidenceLoading) {
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

  // Handle evidence submitted from dialog
  const handleAddEvidence = (evidence: Evidence) => {
    console.log('Adding evidence in FrameworkClient:', evidence);
    
    // Use the hook's addEvidence method
    addEvidence({
      frameworkId: id,
      subcontrolId: evidence.subcontrolId,
      notes: evidence.notes,
      files: evidence.files || [],
      tags: evidence.tags || []
    });
    
    // Close dialog
    setIsEvidenceDialogOpen(false);
  };

  const handleControlClick = (subcontrolId: string, controlId: string, controlName?: string) => {
    setSelectedControl(subcontrolId);
    setSelectedParentControlId(controlId);
    setSelectedControlName(controlName || '');
    setIsEvidenceDialogOpen(true);
  };

  const handleDeleteEvidence = async (evidenceId: string) => {
    if (!selectedControl) return;
    
    console.log('Deleting evidence in FrameworkClient:', evidenceId);
    
    // Use the hook's deleteEvidence method
    await deleteEvidence(evidenceId);
  };

  const handleUpdateEvidence = async (evidenceId: string, updatedEvidence: Evidence) => {
    if (!selectedControl) return;
    
    console.log('Updating evidence in FrameworkClient:', evidenceId, updatedEvidence);
    
    // Use the hook's updateEvidence method
    await updateEvidence(evidenceId, {
      notes: updatedEvidence.notes,
      files: updatedEvidence.files,
      tags: updatedEvidence.tags
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-8">
        <div className="flex items-center space-x-8">
          <div>
            <h2 className="text-2xl font-bold">{framework.name}</h2>
            <p className="text-gray-600 mt-1">Version {framework.version}</p>
          </div>
          <p className="text-gray-600 flex-1">{framework.description}</p>
        </div>
        
        {isLoadingMonitoring ? (
          <div className="h-12 bg-gray-100 animate-pulse rounded-md"></div>
        ) : isMonitored && monitoringDetails ? (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium text-blue-800">Monitoring Active</h3>
              </div>
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                {monitoringDetails.settings?.priority || 'medium'} priority
              </Badge>
            </div>
            <p className="text-sm text-blue-700 my-2">
              This framework is being monitored with {monitoringDetails.settings?.frequency || 'monthly'} checks.
            </p>
            
            {/* Evidence Collection Status */}
            <div className="mt-3 mb-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-blue-800 font-medium">Evidence Collection Progress</span>
                <span className="text-xs font-medium">
                  {monitoringDetails.overallProgress || 0}%
                </span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-1.5">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full" 
                  style={{ width: `${monitoringDetails.overallProgress || 0}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
              <div className="flex items-center gap-1 text-xs bg-white px-2 py-1 rounded border border-blue-200">
                <Calendar className="h-3.5 w-3.5 text-blue-600" />
                <span>Next check: {monitoringDetails.nextCheckDate ? format(monitoringDetails.nextCheckDate, 'MMM d, yyyy') : 'Not scheduled'}</span>
              </div>
              <div className="flex items-center gap-1 text-xs bg-white px-2 py-1 rounded border border-blue-200">
                <AlertCircle className="h-3.5 w-3.5 text-blue-600" />
                <span>Evidence type: {monitoringDetails.settings?.evidence_type || 'document'}</span>
              </div>
            </div>
            
            {/* Missing Evidence */}
            {monitoringDetails && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <h4 className="text-xs font-medium text-blue-800 mb-1">Missing Evidence</h4>
                <p className="text-xs text-blue-700">
                  {monitoringMappingService.getMissingEvidenceItems(monitoringDetails, evidenceMap).length} items require evidence collection
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <BellOff className="h-5 w-5 text-gray-400" />
              <h3 className="font-medium text-gray-600">Not Monitored</h3>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              This framework is not currently being monitored. Add it to your monitoring dashboard to track compliance progress.
            </p>
          </div>
        )}
        
        <FrameworkSummary 
          controls={framework.controls || []} 
          evidenceMap={evidenceMap}
        />
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

      {selectedControl && (
        <EvidenceDialog
          key={`evidence-dialog-${selectedControl}-${Date.now()}`}
          subcontrolId={selectedControl!}
          frameworkId={id}
          isOpen={isEvidenceDialogOpen}
          onClose={() => {
            setIsEvidenceDialogOpen(false);
            // Refresh evidence when dialog closes
            refreshEvidence();
          }}
          onSubmit={handleAddEvidence}
          onDelete={handleDeleteEvidence}
          onUpdate={handleUpdateEvidence}
          existingEvidence={evidenceMap[selectedControl!] || []}
        />
      )}
    </div>
  );
}
