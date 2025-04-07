import { frameworks } from '@/data/frameworks';

export async function generateStaticParams() {
  return frameworks.map((framework) => ({
    id: framework.id,
  }));
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
