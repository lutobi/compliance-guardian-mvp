import { Metadata } from 'next';
import { CategoryPage } from '@/components/learning/CategoryPage';

export const metadata: Metadata = {
  title: 'Security Frameworks - Learning Hub',
  description: 'Learn about security and compliance frameworks',
};

export default function SecurityFrameworks() {
  return (
    <CategoryPage
      categoryId="security"
      title="Security Frameworks"
      description="Learn about frameworks that help organizations protect data, ensure security, and maintain compliance with industry standards and regulations."
    />
  );
}
