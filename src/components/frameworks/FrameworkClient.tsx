'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { AlertCircle, Calendar, ChevronRight, Paperclip } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { ProgressRing } from '@/components/ui/progress-ring';
import EvidenceDialog from '@/app/dashboard/frameworks/[slug]/evidence-dialog-new';
import { FrameworkSummary } from '@/components/frameworks/FrameworkSummary';
import { useFrameworkData } from '@/hooks/useFrameworkData';
import { useFrameworkEvidence } from '@/hooks/useFrameworkEvidence';
import { MonitoringService } from '@/services/monitoring';
import { supabase } from '@/lib/supabase';
import { resolveFrameworkUuid } from '@/lib/resolveFrameworkUuid';
import type { Control as FrameworkControl } from '@/types/framework';
import type { Evidence } from '@/types/evidence';
import type { EvidenceFile } from '@/types/evidence';
import type { Framework } from '@/types/framework';
import { useMultiTenantAuth } from '@/lib/auth/MultiTenantContext';

interface MonitoringConfig {
  id: string;
  frameworkId: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  nextCheckDate: string;
  created_at: string;
  updated_at: string;
}

interface DialogState {
  isOpen: boolean;
  controlId: string;
  parentControlId: string;
  controlName: string;
}

interface ControlProps {
  control: FrameworkControl;
  evidenceMap: Record<string, Evidence[]>;
  onAddEvidence: (controlId: string, subControlId: string, subControlName?: string) => void;
}

interface FrameworkClientProps {
  id: string;
}

const Control = React.memo<ControlProps>(({ control, evidenceMap, onAddEvidence }) => {
  const [expanded, setExpanded] = useState(false);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const progress = calculateControlProgress(control, evidenceMap);

  return (
    <details ref={detailsRef} onToggle={() => setExpanded(detailsRef.current?.open || false)} className="border rounded-lg mb-4 overflow-hidden">
      <summary className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100">
        <div className="flex-1">
          <h3 className="text-lg font-bold">{control.name}</h3>
          <p className="text-gray-600 mt-2">{control.description}</p>
        </div>
        <ChevronRight className={`w-4 h-4 mr-2 transform transition-transform ${expanded ? 'rotate-90' : ''}`} />
        <ProgressRing value={progress} size={40} strokeWidth={3} className="text-blue-600 ml-4" textClassName="text-xs" />
      </summary>
      {control.subcontrols && control.subcontrols.length > 0 && (
        <div className="p-4 space-y-4">
          {control.subcontrols.map(subControl => (
            <div key={subControl.id} className="border-t pt-4 flex items-center justify-between">
              <div>
                <h4 className="text-md font-semibold">{subControl.name}</h4>
                <p className="text-gray-600 mt-1">{subControl.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="relative flex items-center justify-center p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50"
                  onClick={() => onAddEvidence(control.id, subControl.id, subControl.name)}
                >
                  <Paperclip className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-600 rounded-full">
                    {evidenceMap[subControl.id]?.length || 0}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {(!control.subcontrols || control.subcontrols.length === 0) && (
        <div className="p-4 flex justify-end">
          <button
            className="relative flex items-center justify-center p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50"
            onClick={() => onAddEvidence(control.id, control.id)}
          >
            <Paperclip className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-600 rounded-full">
              {evidenceMap[control.id]?.length || 0}
            </span>
          </button>
        </div>
      )}
    </details>
  );
});

const calculateControlProgress = (control: FrameworkControl, evidenceMap: Record<string, Evidence[]>): number => {
  if (!control.subcontrols || control.subcontrols.length === 0) {
    const evidence = evidenceMap[control.id] || [];
    return evidence.length > 0 ? 100 : 0;
  }

  const subControlProgress = control.subcontrols.map(subControl => {
    const evidence = evidenceMap[subControl.id] || [];
    return evidence.length > 0 ? 100 : 0;
  });

  return Math.round(
    subControlProgress.reduce<number>((acc, curr) => acc + curr, 0) / control.subcontrols.length
  );
};

export const FrameworkClient: React.FC<FrameworkClientProps> = ({ id }) => {
  const { data: framework, loading, error } = useFrameworkData(id);
  const { evidenceMap, addEvidence, updateEvidence, deleteEvidence, refreshEvidence } = useFrameworkEvidence(id);
  const [monitoringDetails, setMonitoringDetails] = useState<MonitoringConfig | null>(null);
  const [monitoringFrameworkId, setMonitoringFrameworkId] = useState<string>(id);
  const { currentWorkspace } = useMultiTenantAuth();
  const [dialogState, setDialogState] = useState<DialogState>({
    isOpen: false,
    controlId: '',
    parentControlId: '',
    controlName: '',
  });

  const handleAddEvidence = useCallback(async (evidence: Partial<Evidence>) => {
    try {
      // EvidenceDialog passes Partial<Evidence>; addEvidence expects creation payload.
      await addEvidence(evidence as any);
      toast.success('Evidence added successfully');
      refreshEvidence();
    } catch (error) {
      console.error('Error adding evidence:', error);
      toast.error('Failed to add evidence');
    }
  }, [addEvidence, refreshEvidence]);

  const handleUpdateEvidence = useCallback(async (evidenceId: string, updates: Partial<Evidence>) => {
    try {
      await updateEvidence(evidenceId, updates);
      toast.success('Evidence updated successfully');
      refreshEvidence();
    } catch (error) {
      console.error('Error updating evidence:', error);
      toast.error('Failed to update evidence');
    }
  }, [updateEvidence, refreshEvidence]);

  const handleDeleteEvidence = useCallback(async (evidenceId: string) => {
    try {
      await deleteEvidence(evidenceId);
      toast.success('Evidence deleted successfully');
      refreshEvidence();
    } catch (error) {
      console.error('Error deleting evidence:', error);
      toast.error('Failed to delete evidence');
    }
  }, [deleteEvidence, refreshEvidence]);

  const handleOpenDialog = useCallback((controlId: string, parentControlId: string, subcontrolName?: string) => {
    setDialogState({
      isOpen: true,
      controlId,
      parentControlId,
      controlName: subcontrolName || '',
    });
  }, []);

  const handleCloseDialog = useCallback(() => {
    setDialogState(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Resolve slug -> UUID for monitoring API
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const uuid = await resolveFrameworkUuid(supabase, id);
        if (isMounted) setMonitoringFrameworkId(uuid || id);
      } catch (e) {
        console.warn('Failed to resolve framework UUID for monitoring, using raw id', e);
        if (isMounted) setMonitoringFrameworkId(id);
      }
    })();
    return () => { isMounted = false; };
  }, [id]);

  useEffect(() => {
    const loadMonitoringDetails = async () => {
      try {
        const ws = currentWorkspace?.slug;
        const url = `/api/monitoring?frameworkId=${encodeURIComponent(monitoringFrameworkId)}${ws ? `&workspace=${encodeURIComponent(ws)}` : ''}`;
        const res = await fetch(url, {
          headers: ws ? { 'x-workspace-slug': ws } : undefined,
          credentials: 'include',
        });
        const json = await res.json();
        if (!res.ok) {
          const errMsg = typeof json?.error === 'string' ? json.error : json?.error?.message || 'Request failed';
          throw new Error(errMsg);
        }
        const status = json?.data?.monitoring ?? json?.data;

        if (status?.status === 'active') {
          setMonitoringDetails({
            id: status.id || '',
            frameworkId: monitoringFrameworkId,
            frequency: status.frequency as 'daily' | 'weekly' | 'monthly',
            nextCheckDate: new Date(status.next_check_date).toISOString(),
            created_at: status.created_at || new Date().toISOString(),
            updated_at: status.updated_at || new Date().toISOString(),
          });
        } else {
          setMonitoringDetails(null);
        }
      } catch (error) {
        console.error('Error loading monitoring details:', error);
        setMonitoringDetails(null);
      }
    };

    if (monitoringFrameworkId) {
      loadMonitoringDetails();
    }
  }, [monitoringFrameworkId, currentWorkspace?.slug]);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error || !framework) {
    return <div className="p-4 text-red-500">Error loading framework</div>;
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{framework.name}</h1>
        {monitoringDetails && (
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Next check: {format(new Date(monitoringDetails.nextCheckDate), 'MMM d, yyyy')}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {monitoringDetails.frequency} monitoring
            </Badge>
          </div>
        )}
      </div>

      <div className="mb-6">
        <FrameworkSummary controls={framework.controls} evidenceMap={evidenceMap} />
      </div>

      <div className="space-y-6">
        {framework.controls.map((control) => (
          <Control
            key={control.id}
            control={control}
            evidenceMap={evidenceMap}
            onAddEvidence={handleOpenDialog}
          />
        ))}
      </div>

      <EvidenceDialog
        isOpen={dialogState.isOpen}
        controlId={dialogState.controlId}
        subcontrolId={dialogState.parentControlId}
        subcontrolName={dialogState.controlName}
        frameworkId={monitoringFrameworkId}
        onClose={handleCloseDialog}
        onSubmit={handleAddEvidence}
        onDelete={handleDeleteEvidence}
        onUpdate={handleUpdateEvidence}
        existingEvidence={dialogState.parentControlId ? evidenceMap[dialogState.parentControlId] || [] : []}
      />
    </div>
  );
};
