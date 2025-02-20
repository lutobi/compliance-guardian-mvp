import { frameworks } from '@/data/frameworks';
import { FrameworkClient } from '@/components/frameworks/FrameworkClient';

type Props = {
  params: { id: string };
};

export default function Page({ params }: Props) {
  if (!params?.id) {
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
  const framework = frameworks.find(f => f.id === params.id);
  
  if (!framework) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="p-8 bg-red-50 text-red-700 rounded-lg">
          <h1 className="text-2xl font-bold mb-4">Framework not found</h1>
          <p>The framework with ID {params.id} does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{framework.name}</h1>
      <FrameworkClient 
        id={params.id}
        name={framework.name}
        description={framework.description}
        version={framework.version}
        categories={framework.categories}
      />
    </div>
  );
}
