import { FrameworkDetailContent } from './framework-detail';
import { frameworkData } from '@/data/frameworks';
import { Metadata } from 'next';
import Link from 'next/link';

type Props = {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};

async function getFramework(id: string) {
  // Simulate async operation to satisfy Next.js requirements
  return Promise.resolve(frameworkData[id as keyof typeof frameworkData] || null);
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const framework = await getFramework(params.id);
  
  return {
    title: framework ? `${framework.name} - Framework Details` : 'Framework Not Found',
  };
}

export default async function Page({ params }: Props) {
  const framework = await getFramework(params.id);
  
  if (!framework) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Framework Not Found</h1>
          <Link href="/frameworks" className="text-blue-600 hover:underline">
            Back to Frameworks
          </Link>
        </div>
      </div>
    );
  }

  try {
    return <FrameworkDetailContent params={params} />;
  } catch (error) {
    console.error('Error rendering framework detail:', error);
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
}
