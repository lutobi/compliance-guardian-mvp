'use client';

import Link from 'next/link';
import { ShieldCheck, Lock, Brain, Cloud } from 'lucide-react';
import { frameworkRegistry } from '@/data/registry';

const iconMap = {
  ShieldCheck,
  Lock,
  Brain,
  Cloud,
};

const categories = [
  {
    id: 'security',
    name: 'Security',
    description: 'Frameworks focused on protecting systems, data, and infrastructure',
    icon: 'ShieldCheck',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700'
  },
  {
    id: 'privacy',
    name: 'Privacy',
    description: 'Frameworks for protecting personal data and ensuring privacy compliance',
    icon: 'Lock',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700'
  },
  {
    id: 'compliance',
    name: 'Compliance',
    description: 'General compliance and regulatory frameworks',
    icon: 'Brain',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700'
  }
];

export default function LearningHubContent() {
  // Count frameworks per category
  const frameworkCounts = Object.values(frameworkRegistry).reduce((acc, framework) => {
    if (framework.category) {
      acc[framework.category] = (acc[framework.category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Learning Hub</h1>
        <p className="text-xl text-gray-600 max-w-4xl">
          Explore our comprehensive collection of compliance frameworks, learn about their requirements,
          and understand how to implement them effectively.
        </p>
      </div>

      {/* Framework Categories */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {categories.map((category) => {
          const Icon = iconMap[category.icon as keyof typeof iconMap];
          const count = frameworkCounts[category.id] || 0;
          
          return (
            <Link
              key={category.id}
              href={`/learning/${category.id}`}
              className="block group"
            >
              <div className="h-full p-6 rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all">
                <div className="flex items-center mb-4">
                  <div className={`p-2 rounded-lg ${category.bgColor} ${category.textColor}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="ml-3 flex items-center">
                    <h3 className="text-xl font-semibold group-hover:text-blue-600">
                      {category.name}
                    </h3>
                    <span className="ml-3 px-2 py-1 text-sm bg-gray-100 text-gray-700 rounded-full">
                      {count} frameworks
                    </span>
                  </div>
                </div>
                <p className="text-gray-600">
                  {category.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Quick Links</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/learning/security/soc2"
            className="p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all"
          >
            <h3 className="font-semibold mb-2">SOC 2</h3>
            <p className="text-sm text-gray-600">
              Learn about SOC 2 compliance and how to implement its trust service criteria.
            </p>
          </Link>
          <Link
            href="/learning/privacy/gdpr"
            className="p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all"
          >
            <h3 className="font-semibold mb-2">GDPR</h3>
            <p className="text-sm text-gray-600">
              Understand GDPR requirements and how to protect personal data.
            </p>
          </Link>
          <Link
            href="/learning/security/iso27001"
            className="p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all"
          >
            <h3 className="font-semibold mb-2">ISO 27001</h3>
            <p className="text-sm text-gray-600">
              Explore ISO 27001 security controls and certification requirements.
            </p>
          </Link>
        </div>
      </div>

      {/* Resources */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Resources</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-4 rounded-lg bg-gray-50">
            <h3 className="font-semibold mb-2">Implementation Guides</h3>
            <p className="text-sm text-gray-600 mb-4">
              Step-by-step guides to help you implement various compliance frameworks.
            </p>
            <Link href="/guides" className="text-blue-600 hover:text-blue-800 text-sm">
              View Guides →
            </Link>
          </div>
          <div className="p-4 rounded-lg bg-gray-50">
            <h3 className="font-semibold mb-2">Control Templates</h3>
            <p className="text-sm text-gray-600 mb-4">
              Pre-built control templates to accelerate your compliance journey.
            </p>
            <Link href="/templates" className="text-blue-600 hover:text-blue-800 text-sm">
              Browse Templates →
            </Link>
          </div>
          <div className="p-4 rounded-lg bg-gray-50">
            <h3 className="font-semibold mb-2">Expert Network</h3>
            <p className="text-sm text-gray-600 mb-4">
              Connect with compliance experts and get your questions answered.
            </p>
            <Link href="/network" className="text-blue-600 hover:text-blue-800 text-sm">
              Join Network →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
