import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { FrameworkCard } from '@/components/FrameworkCard';

export const metadata: Metadata = {
  title: 'AI Frameworks - Learning Hub',
  description: 'Learn about AI governance and risk management frameworks',
};

export default function AIFrameworks() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-600 mb-8">
        <Link href="/learning" className="hover:text-blue-600">
          Learning Hub
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-gray-900">AI Frameworks</span>
      </div>

      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">AI Frameworks</h1>
        <p className="text-xl text-gray-600 max-w-4xl">
          Learn about frameworks that help organizations manage AI risks and ensure responsible AI development.
        </p>
      </div>

      {/* Frameworks Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FrameworkCard
          href="/learning/ai/nist-ai-rmf"
          name="NIST AI RMF"
          description="A comprehensive framework for managing risks in artificial intelligence systems."
          category="AI Risk Management"
        />
      </div>
    </div>
  );
}
