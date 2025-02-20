import Link from 'next/link';
import { GitCompare } from 'lucide-react';
import { frameworks } from '@/data/frameworks';

function formatVersion(version: string): string {
  return version;
}

export default function FrameworksPage() {
  console.log('Frameworks:', frameworks);
  return (
    <div className="p-8">
      <header className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Compliance Frameworks</h1>
        <Link 
          href="/compare"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <GitCompare className="w-5 h-5 mr-2" />
          Compare Frameworks
        </Link>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {frameworks.map((framework) => (
          <Link 
            key={framework.id}
            href={`/frameworks/${framework.id}`}
            className="block p-4 border rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-lg font-semibold">{framework.name}</h2>
              <span className="text-sm text-blue-600">v{formatVersion(framework.version)}</span>
            </div>
            <p className="text-sm text-gray-600">{framework.description}</p>

          </Link>
        ))}
      </div>
    </div>
  );
}
