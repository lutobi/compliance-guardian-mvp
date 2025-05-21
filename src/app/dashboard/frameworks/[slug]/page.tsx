import FrameworkDetailClientPage from './client-page';

export default function FrameworkDetailPage({ params }: { params: { slug: string } }) {
  return <FrameworkDetailClientPage params={params} />;
}
