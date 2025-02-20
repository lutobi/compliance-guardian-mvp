import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { FrameworkCard } from '@/components/FrameworkCard';

export const metadata: Metadata = {
  title: 'Security Frameworks - Learning Hub',
  description: 'Learn about security and compliance frameworks',
};

export default function SecurityFrameworks() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-600 mb-8">
        <Link href="/learning" className="hover:text-blue-600">
          Learning Hub
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-gray-900">Security Frameworks</span>
      </div>

      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Security Frameworks</h1>
        <p className="text-xl text-gray-600 max-w-4xl">
          Learn about frameworks that help organizations protect data, ensure security, and maintain compliance.
        </p>
      </div>

      {/* Frameworks Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FrameworkCard
          href="/learning/security/soc2"
          name="SOC 2"
          description="A framework for service organizations to demonstrate their security controls and practices."
          category="Security & Trust"
        />
        <FrameworkCard
          href="/learning/security/nist-800-53"
          name="NIST 800-53"
          description="NIST's comprehensive security and privacy control framework for federal information systems."
          category="Security Controls"
        />
        <FrameworkCard
          href="/learning/security/iso-27001"
          name="ISO 27001"
          description="International standard for information security management systems (ISMS)."
          category="Security Management"
        />
      </div>
    </div>
  );
}
