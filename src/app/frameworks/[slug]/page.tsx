import { frameworks } from '@/data/frameworks';
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
  return <FrameworkClient id={params.slug} />;
}
