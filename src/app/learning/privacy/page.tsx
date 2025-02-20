import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Shield as ShieldIcon, Book, Users as UsersIcon, FileText } from 'lucide-react';

const Shield = ShieldIcon;
const Users = UsersIcon;
import { gdprLearning } from '@/data/learning/frameworks/gdpr';

export const metadata: Metadata = {
  title: 'Privacy Frameworks - Learning Hub',
  description: 'Learn about privacy compliance frameworks including GDPR and HIPAA',
};

const frameworks = [
  {
    id: 'gdpr',
    name: 'General Data Protection Regulation (GDPR)',
    description: 'The EU\'s comprehensive data protection law that sets guidelines for processing personal information.',
    icon: Shield,
    keyPoints: [
      'Personal data protection',
      'Data subject rights',
      'Cross-border data transfers',
      'Breach notification'
    ]
  },
  {
    id: 'ccpa',
    name: 'California Consumer Privacy Act (CCPA)',
    description: 'California\'s privacy law that enhances privacy rights and consumer protection for residents.',
    icon: Shield,
    keyPoints: [
      'Right to know',
      'Right to delete',
      'Right to opt-out',
      'Data sale regulations'
    ]
  },
  {
    id: 'hipaa',
    name: 'Health Insurance Portability and Accountability Act (HIPAA)',
    description: 'US healthcare privacy law that protects patient health information.',
    icon: Users,
    keyPoints: [
      'Protected health information',
      'Security safeguards',
      'Patient rights',
      'Business associate agreements'
    ]
  }
];

const resources = [
  {
    title: 'Privacy Impact Assessment Guide',
    description: 'Learn how to conduct effective privacy impact assessments',
    href: '/learning/privacy/guides/pia'
  },
  {
    title: 'Data Mapping Templates',
    description: 'Templates for mapping your data processing activities',
    href: '/learning/privacy/templates/data-mapping'
  },
  {
    title: 'Privacy Policy Generator',
    description: 'Tool to help create compliant privacy policies',
    href: '/learning/privacy/tools/policy-generator'
  }
];

export default function PrivacyFrameworks() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-600 mb-8">
        <Link href="/learning" className="hover:text-blue-600">Learning Hub</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-gray-900">Privacy Frameworks</span>
      </div>

      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Privacy Frameworks</h1>
        <p className="text-xl text-gray-600 max-w-4xl">
          Comprehensive guides to understanding and implementing privacy compliance frameworks.
          Learn how to protect personal data and maintain privacy compliance across your organization.
        </p>
      </div>

      {/* Frameworks Grid */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {frameworks.map((framework) => {
          const Icon = framework.icon;
          return (
            <Link
              key={framework.id}
              href={`/learning/privacy/${framework.id}`}
              className="block bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <Icon className="w-6 h-6 text-blue-600 mr-3" />
                  <h2 className="text-xl font-semibold">{framework.name}</h2>
                </div>
                <p className="text-gray-600 mb-6">{framework.description}</p>
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold mb-2">Key Aspects:</h3>
                  <ul className="grid grid-cols-2 gap-2">
                    {framework.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-2"></div>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Resources */}
      <div className="bg-gray-50 rounded-lg p-6 mb-12">
        <h2 className="text-2xl font-semibold mb-6">Privacy Resources</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {resources.map((resource, index) => (
            <Link
              key={index}
              href={resource.href}
              className="block bg-white rounded-lg p-4 shadow hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold mb-2">{resource.title}</h3>
              <p className="text-sm text-gray-600">{resource.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Learning Path */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-6">Privacy Learning Path</h2>
        <div className="space-y-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Book className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold mb-2">1. Privacy Fundamentals</h3>
              <p className="text-gray-600">Learn the basic concepts of privacy and data protection.</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold mb-2">2. Framework Deep Dive</h3>
              <p className="text-gray-600">Understand specific requirements of each privacy framework.</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold mb-2">3. Implementation Strategies</h3>
              <p className="text-gray-600">Learn how to implement privacy controls in your organization.</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold mb-2">4. Documentation & Evidence</h3>
              <p className="text-gray-600">Master the art of privacy documentation and evidence collection.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
