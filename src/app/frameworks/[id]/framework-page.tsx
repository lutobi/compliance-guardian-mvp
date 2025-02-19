'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { frameworkData } from '@/data/frameworks-complete';

type Props = {
  id: string;
};

export function FrameworkPage({ id }: Props) {
  const [framework, setFramework] = useState<any>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const loadFramework = async () => {
      try {
        // Simulate async data fetch to match server component behavior
        const data = await Promise.resolve(frameworkData[id as keyof typeof frameworkData]);
        setFramework(data);
      } catch (err) {
        console.error('Error loading framework:', err);
        setError(true);
      }
    };

    loadFramework();
  }, [id]);

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Framework</h1>
          <p className="text-red-600 mb-4">Something went wrong while loading the framework details.</p>
          <Link href="/frameworks" className="text-blue-600 hover:underline">
            Back to Frameworks
          </Link>
        </div>
      </div>
    );
  }

  if (!framework) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <nav className="mb-8">
          <Link href="/frameworks" className="text-blue-600 hover:underline">
            ← Back to Frameworks
          </Link>
        </nav>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-4">{framework.name}</h1>
          <p className="text-gray-600 mb-6">{framework.description}</p>

          <div className="grid gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">Version</h2>
              <p className="text-gray-700">{framework.version}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Categories</h2>
              <div className="flex flex-wrap gap-2">
                {framework.categories.map((category: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>

            {framework.controls && (
              <div>
                <h2 className="text-xl font-semibold mb-3">Controls</h2>
                <div className="space-y-4">
                  {framework.controls.map((control: any) => (
                    <div key={control.id} className="border rounded-lg p-4">
                      <h3 className="text-lg font-medium mb-2">{control.name}</h3>
                      <p className="text-gray-600 mb-4">{control.description}</p>
                      
                      {control.subcontrols && control.subcontrols.length > 0 && (
                        <div className="ml-4 space-y-2">
                          {control.subcontrols.map((sub: any) => (
                            <div key={sub.id} className="border-l-2 pl-4 py-2">
                              <h4 className="font-medium">{sub.name}</h4>
                              <p className="text-gray-600 text-sm">{sub.description}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
