'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { toast } from 'sonner';
import { frameworkData } from '@/data/frameworks';
import { Control as ControlType } from '@/types/framework';
import { ChevronDown, ChevronRight, Paperclip } from 'lucide-react';
import { EvidenceDialog } from './evidence-dialog';
import { DevOnlyWrapper } from '@/components/development/DevOnlyWrapper';
import { CoverageAnalysis } from '@/components/analysis/CoverageAnalysis';

interface Control {
  id: string;
  framework_id: string;
  control_id: string;
  title: string;
  description: string;
  status: string;
  implementation_status: string;
  created_at: string;
  updated_at: string;
  user_id: string | null;
  subControls?: Control[];
  isExpanded?: boolean;
}

export default function FrameworkDetailPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : null;
  const framework = id ? frameworkData[id] : null;

  const [controls, setControls] = useState<Control[]>([]);
  const [loading, setLoading] = useState(true);
  const [evidenceDialogOpen, setEvidenceDialogOpen] = useState(false);
  const [selectedControl, setSelectedControl] = useState<Control | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (!framework) {
      setLoading(false);
      return;
    }

    const fetchControls = async () => {
      try {
        const { data: existingControls, error: fetchError } = await supabase
          .from('controls')
          .select('*')
          .eq('framework_id', id)
          .order('control_id', { ascending: true });

        if (fetchError) throw fetchError;

        // Map framework controls to database controls or create new ones
        const mappedControls = framework.controls.map((control: ControlType) => {
          const existingControl = existingControls?.find(ec => ec.control_id === control.id);
          return {
            id: existingControl?.id || '',
            framework_id: id || '',
            control_id: control.id,
            title: control.title,
            description: control.description,
            status: existingControl?.status || 'not_implemented',
            implementation_status: existingControl?.implementation_status || '',
            created_at: existingControl?.created_at || new Date().toISOString(),
            updated_at: existingControl?.updated_at || new Date().toISOString(),
            user_id: existingControl?.user_id || null,
            isExpanded: false,
            subControls: control.subControls?.map(sub => ({
              id: '',
              framework_id: id || '',
              control_id: sub.id,
              title: sub.title,
              description: sub.description,
              status: 'not_implemented',
              implementation_status: '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              user_id: null,
              isExpanded: false
            }))
          };
        });

        setControls(mappedControls);
      } catch (error) {
        console.error('Error fetching controls:', error);
        toast.error('Failed to load controls');
      } finally {
        setLoading(false);
      }
    };

    fetchControls();
  }, [framework, id, supabase]);

  const handleAddEvidence = (control: Control) => {
    setSelectedControl(control);
    setEvidenceDialogOpen(true);
  };

  const handleUpdateControl = async (controlId: string, status: string, implementationStatus: string) => {
    try {
      const { error } = await supabase
        .from('controls')
        .upsert({
          framework_id: id,
          control_id: controlId,
          status,
          implementation_status: implementationStatus,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setControls(prevControls =>
        prevControls.map(c =>
          c.control_id === controlId
            ? { ...c, status, implementation_status: implementationStatus }
            : c
        )
      );

      toast.success('Control updated successfully');
    } catch (error) {
      console.error('Error updating control:', error);
      toast.error('Failed to update control');
    }
  };

  const toggleExpanded = (controlId: string) => {
    setControls(prevControls =>
      prevControls.map(control =>
        control.control_id === controlId
          ? { ...control, isExpanded: !control.isExpanded }
          : control
      )
    );
  };

  if (!id || !framework) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="p-8 bg-red-50 text-red-700 rounded-lg">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p>Framework not found</p>
          <Link href="/dashboard/frameworks" className="text-blue-600 hover:underline mt-4 inline-block">
            Back to Frameworks
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="flex items-center justify-between mb-8">
        <Link href="/dashboard/frameworks" className="text-blue-600 hover:underline">
          ← Back to Frameworks
        </Link>
      </nav>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-2">{framework.name}</h1>
        <p className="text-gray-600 mb-8">{framework.description}</p>

        <div className="space-y-6">
          {controls.map(control => (
            <div key={control.control_id} className="border rounded-lg p-6">
              <div 
                className="flex items-start cursor-pointer"
                onClick={() => toggleExpanded(control.control_id)}
              >
                <div className="mr-2 mt-1">
                  {control.isExpanded ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold mb-2">
                    {control.control_id}: {control.title}
                  </h3>
                  <p className="text-gray-600">{control.description}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddEvidence(control);
                  }}
                  className="ml-4 flex items-center text-blue-600 hover:text-blue-800"
                >
                  <Paperclip className="h-5 w-5 mr-1" />
                  Add Evidence
                </button>
              </div>

              {control.isExpanded && control.subControls && control.subControls.length > 0 && (
                <div className="mt-4 ml-8 space-y-4">
                  {control.subControls.map(subControl => (
                    <div key={subControl.control_id} className="border-l-2 pl-4">
                      <h4 className="font-medium mb-2">
                        {subControl.control_id}: {subControl.title}
                      </h4>
                      <p className="text-gray-600 text-sm">{subControl.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <EvidenceDialog
        open={evidenceDialogOpen}
        onClose={() => setEvidenceDialogOpen(false)}
        control={selectedControl}
        onUpdateControl={handleUpdateControl}
      />

      <DevOnlyWrapper>
        <div className="mt-8">
          <CoverageAnalysis controls={controls} />
        </div>
      </DevOnlyWrapper>
    </div>
  );
}
