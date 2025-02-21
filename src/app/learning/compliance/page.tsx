import { Metadata } from 'next';
import { CategoryPage } from '@/components/learning/CategoryPage';

export const metadata: Metadata = {
  title: 'Compliance Frameworks - Learning Hub',
  description: 'Learn about general compliance and regulatory frameworks',
};

export default function ComplianceFrameworks() {
  return (
    <CategoryPage
      categoryId="compliance"
      title="Compliance Frameworks"
      description="Discover frameworks that help organizations meet regulatory requirements, maintain standards, and demonstrate compliance with industry regulations."
    />
  );
}
