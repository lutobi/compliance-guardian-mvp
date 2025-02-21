import { Metadata } from 'next';
import { CategoryPage } from '@/components/learning/CategoryPage';

export const metadata: Metadata = {
  title: 'Privacy Frameworks - Learning Hub',
  description: 'Learn about privacy compliance frameworks including GDPR and HIPAA',
};

export default function PrivacyFrameworks() {
  return (
    <CategoryPage
      categoryId="privacy"
      title="Privacy Frameworks"
      description="Explore frameworks designed to protect personal data, ensure privacy compliance, and maintain trust with stakeholders."
    />
  );
}
