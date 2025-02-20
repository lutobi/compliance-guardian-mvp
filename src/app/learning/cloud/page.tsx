import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { FrameworkCard } from '@/components/FrameworkCard';

export const metadata: Metadata = {
  title: 'Cloud Security Frameworks - Learning Hub',
  description: 'Learn about cloud security and compliance frameworks',
};

export default function CloudFrameworks() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-600 mb-8">
        <Link href="/learning" className="hover:text-blue-600">
          Learning Hub
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-gray-900">Cloud Security Frameworks</span>
      </div>

      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Cloud Security Frameworks</h1>
        <p className="text-xl text-gray-600 max-w-4xl">
          Learn about frameworks that help organizations secure their cloud infrastructure and maintain compliance.
        </p>
      </div>

      {/* Frameworks Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FrameworkCard
          href="/learning/cloud/cloud-security"
          name="Cloud Security Framework"
          description="A comprehensive framework for securing cloud infrastructure and applications."
          category="Cloud Security"
        />
        <FrameworkCard
          href="/learning/cloud/csa-ccm"
          name="CSA CCM - Cloud Controls Matrix"
          description="The Cloud Security Alliance's cybersecurity control framework for cloud computing."
          category="Cloud Security"
        />
      </div>
    </div>
  );
}
