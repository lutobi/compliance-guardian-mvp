import Link from 'next/link';
import { frameworks } from '@/data/frameworks-complete';

export default function FrameworksPage() {
  return (
    <div className="p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Compliance Frameworks</h1>
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
              <span className="text-sm text-blue-600">v{framework.version}</span>
            </div>
            <p className="text-sm text-gray-600">{framework.description}</p>

          </Link>
        ))}
      </div>
    </div>
  );
}
