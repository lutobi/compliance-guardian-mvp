'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { toast } from 'sonner';

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

interface Framework {
  id: string;
  name: string;
  version: string;
  created_at: string;
}

export default function FrameworkDetailPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : null;
  const [framework, setFramework] = useState<Framework | null>(null);
  const [hierarchicalControls, setHierarchicalControls] = useState<Control[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (!id) {
      setError('No framework ID provided');
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function loadData() {
      try {
        // First check auth
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!user) throw new Error('Not authenticated');

        // Load framework details
        const { data: framework, error: frameworkError } = await supabase
          .from('frameworks')
          .select()
          .eq('id', id)
          .single();

        if (frameworkError) throw frameworkError;
        if (!framework) throw new Error('Framework not found');

        if (!isMounted) return;
        setFramework(framework);

        // Load all controls
        const { data: controls, error: controlsError } = await supabase
          .from('controls')
          .select('*')
          .eq('framework_id', id)
          .order('control_id');

        if (controlsError) throw controlsError;

        // Group controls by their main section (e.g., 'A.5')
        const groupedControls = controls?.reduce((acc, control) => {
          const parts = control.control_id.split('.');
          const mainSection = parts.slice(0, 2).join('.'); // e.g., 'A.5'
          
          if (!acc[mainSection]) {
            acc[mainSection] = {
              id: `section-${mainSection}`,
              control_id: mainSection,
              title: `Section ${mainSection}`,
              description: '',
              framework_id: id,
              status: '',
              implementation_status: '',
              created_at: '',
              updated_at: '',
              user_id: null,
              subControls: [],
              isExpanded: false
            };
          }
          
          acc[mainSection].subControls?.push({
            ...control,
            isExpanded: false
          });
          
          return acc;
        }, {} as Record<string, Control>);

        // Update section titles and sort subcontrols
        (Object.values(groupedControls) as Control[]).forEach(section => {
          if (section.subControls && section.subControls.length > 0) {
            // Sort subcontrols by control_id
            section.subControls.sort((a, b) => a.control_id.localeCompare(b.control_id));
            const firstControl = section.subControls[0];
            section.title = firstControl.title;
            section.description = firstControl.description;
          }
        });

        // Convert to array and sort by control_id
        const sortedControls = (Object.values(groupedControls) as Control[])
          .sort((a, b) => a.control_id.localeCompare(b.control_id));

        if (!isMounted) return;
        setHierarchicalControls(sortedControls);
      } catch (e) {
        if (!isMounted) return;
        const message = e instanceof Error ? e.message : 'An error occurred';
        
        if (message.toLowerCase().includes('auth')) {
          window.location.href = '/auth/login';
          toast.error('Please sign in to continue');
        } else {
          setError(message);
          toast.error(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id, supabase]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mt-2"></div>
          <div className="space-y-3 mt-6">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !framework) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Framework</h3>
            <p className="text-red-600">{error || 'Framework not found'}</p>
            <Link 
              href="/dashboard/frameworks"
              className="inline-flex items-center mt-4 text-sm text-red-700 hover:text-red-800"
            >
              ← Back to Frameworks
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{framework.name}</h1>
            <p className="mt-2 text-sm text-gray-600">
              Version {framework.version} • {hierarchicalControls?.length || 0} Control Sections
            </p>
          </div>
          <Link
            href="/dashboard/frameworks"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            ← Back to Frameworks
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        {hierarchicalControls.map((control) => (
          <div
            key={control.id}
            className="bg-white rounded-lg border border-gray-200 p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {control.control_id}: {control.title}
              </h3>
              {control.subControls && control.subControls.length > 0 && (
                <button
                  onClick={() => {
                    setHierarchicalControls(prevControls =>
                      prevControls.map(c =>
                        c.id === control.id
                          ? { ...c, isExpanded: !c.isExpanded }
                          : c
                      )
                    );
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-medium focus:outline-none"
                >
                  {control.isExpanded ? '−' : '+'}
                </button>
              )}
            </div>

            <p className="text-gray-600">{control.description}</p>

            {control.isExpanded && control.subControls && (
              <div className="pl-6 space-y-4 border-l-2 border-gray-200">
                {control.subControls.map(subControl => (
                  <div key={subControl.id} className="space-y-2">
                    <h4 className="text-md font-medium text-gray-800">
                      {subControl.control_id}: {subControl.title}
                    </h4>
                    <p className="text-gray-600">{subControl.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {(!hierarchicalControls || hierarchicalControls.length === 0) && (
          <div className="text-center py-12">
            <p className="text-gray-500">No controls available for this framework</p>
          </div>
        )}
      </div>
    </div>
  );
}
