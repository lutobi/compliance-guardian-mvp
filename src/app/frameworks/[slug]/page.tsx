import { frameworks, frameworkData } from '@/data/frameworks';
import { FrameworkClient } from '@/components/frameworks/FrameworkClient';

type Props = {
  params: { slug: string };
};

export async function generateStaticParams() {
  return frameworks.map((framework) => ({
    slug: framework.id, // Using ID as slug for now
  }));
}

export default function Page({ params }: Props) {
  if (!params?.slug) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="p-8 bg-red-50 text-red-700 rounded-lg">
          <h1 className="text-2xl font-bold mb-4">Error: Missing Framework ID</h1>
          <p>No framework ID was provided in the URL.</p>
        </div>
      </div>
    );
  }

  // Server-side validation
  const framework = frameworkData[params.slug];

  if (!framework) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="p-8 bg-red-50 text-red-700 rounded-lg">
          <h1 className="text-2xl font-bold mb-4">Error: Framework Not Found</h1>
          <p>The framework with slug {params.slug} does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <FrameworkClient 
        id={params.slug}
        name={framework.name}
        description={framework.description}
        version={framework.version}
        categories={framework.categories}
      />
    </div>
  );
}
