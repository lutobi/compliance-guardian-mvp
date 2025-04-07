'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Framework } from '@/types/framework';
import { FrameworkService } from '@/services/framework';

type Props = {
  slug: string;
};

export function FrameworkPage({ slug }: Props) {
  const [framework, setFramework] = useState<Framework | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const frameworkService = new FrameworkService();

  useEffect(() => {
    const loadFramework = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await frameworkService.getFrameworkBySlug(slug);
        if (!data) {
          setError(`Framework ${slug} not found`);
          return;
        }
        
        setFramework(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while loading the framework');
      } finally {
        setLoading(false);
      }
    };

    loadFramework();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="p-8 bg-red-50 text-red-700 rounded-lg">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p>{error}</p>
          <Link href="/frameworks" className="mt-4 inline-block text-blue-600 hover:underline">
            Back to Frameworks
          </Link>
        </div>
      </div>
    );
  }

  if (!framework) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-8">
        <Link href="/frameworks" className="text-blue-600 hover:underline">
          ← Back to Frameworks
        </Link>
      </nav>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">{framework.data.name}</h1>
        <div className="prose max-w-none">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Overview</h2>
            <p className="text-gray-700">{framework.data.description}</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Key Information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Version:</strong> {framework.data.version}</li>
              <li><strong>Categories:</strong> {framework.data.categories.join(', ')}</li>
              <li><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Get Started</h2>
            <Link
              href={`/dashboard/frameworks/${framework.slug}`}
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Assessment →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
