import { FrameworkDetailContent } from './framework-detail';
import { frameworkData } from '@/data/frameworks';
import { Metadata } from 'next';

function getFramework(id: string) {
  return frameworkData[id as keyof typeof frameworkData] || null;
}

export async function generateMetadata({ 
  params, 
  searchParams 
}: { 
  params: { id: string }, 
  searchParams: { [key: string]: string | string[] | undefined } 
}): Promise<Metadata> {
  const framework = getFramework(params.id);
  
  return {
    title: framework ? `${framework.name} - Framework Details` : 'Framework Not Found',
  };
}

export default function Page({ 
  params, 
  searchParams 
}: { 
  params: { id: string }, 
  searchParams: { [key: string]: string | string[] | undefined } 
}) {
  const framework = getFramework(params.id);
  
  if (!framework) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Framework Not Found</h1>
          <a href="/frameworks" className="text-blue-600 hover:underline">
            Back to Frameworks
          </a>
        </div>
      </div>
    );
  }

  return <FrameworkDetailContent params={params} />;
}
