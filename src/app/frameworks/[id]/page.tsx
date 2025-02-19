import { FrameworkDetailContent } from './framework-detail';

type Props = {
  params: { id: string };
};

export default function Page({ params }: Props) {
  console.log('Page params:', params); // Debug log
  
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

  return (
    <div className="container mx-auto px-4 py-8">
      <FrameworkDetailContent frameworkId={params.id} />
    </div>
  );
}
