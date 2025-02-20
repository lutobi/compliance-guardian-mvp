import { Metadata } from 'next';
import { frameworkCategories } from '@/data/learning/categories';
import Link from 'next/link';
import { ShieldCheck, Lock, Brain, Cloud } from 'lucide-react';

const iconMap = {
  ShieldCheck,
  Lock,
  Brain,
  Cloud,
};

export const metadata: Metadata = {
  title: 'Learning Hub - Compliance Guardian',
  description: 'Learn about compliance frameworks, controls, and best practices',
};

export default function LearningHub() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Compliance Learning Hub</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Your comprehensive guide to understanding compliance frameworks, controls, and implementation best practices.
        </p>
      </div>

      {/* Quick Start Guide */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-12">
        <h2 className="text-2xl font-semibold mb-4">Quick Start Guide</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">New to Compliance?</h3>
            <p className="text-gray-600 mb-4">Start here to understand the basics of compliance and why it matters.</p>
            <Link 
              href="/learning/basics"
              className="text-blue-600 hover:text-blue-800"
            >
              Learn the Basics →
            </Link>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Choose Your Framework</h3>
            <p className="text-gray-600 mb-4">Find the right compliance framework for your organization.</p>
            <Link 
              href="/learning/framework-selector"
              className="text-blue-600 hover:text-blue-800"
            >
              Framework Selector →
            </Link>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Implementation Guide</h3>
            <p className="text-gray-600 mb-4">Step-by-step guides to implement compliance frameworks.</p>
            <Link 
              href="/learning/implementation"
              className="text-blue-600 hover:text-blue-800"
            >
              View Guides →
            </Link>
          </div>
        </div>
      </div>

      {/* Framework Categories */}
      <h2 className="text-2xl font-semibold mb-6">Framework Categories</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {frameworkCategories.map((category) => {
          const Icon = iconMap[category.icon as keyof typeof iconMap];
          return (
            <Link
              key={category.id}
              href={`/learning/${category.id}`}
              className="block bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center mb-4">
                {Icon && <Icon className="w-6 h-6 mr-2 text-blue-600" />}
                <h3 className="font-semibold">{category.name}</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">{category.description}</p>
              <div className="text-sm text-gray-500">
                {category.frameworks.length} Frameworks
              </div>
            </Link>
          );
        })}
      </div>

      {/* Featured Frameworks */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-6">Featured Frameworks</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Security Frameworks */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Security Frameworks</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/learning/security/soc2" className="text-blue-600 hover:text-blue-800">
                  SOC 2 - Service Organization Control 2
                </Link>
                <p className="text-sm text-gray-600 mt-1">
                  Trust Services Criteria: Security, Availability, Processing Integrity, Confidentiality, Privacy
                </p>
              </li>
              <li className="mt-4">
                <Link href="/learning/security/nist-800-53" className="text-blue-600 hover:text-blue-800">
                  NIST 800-53 - Security Controls
                </Link>
                <p className="text-sm text-gray-600 mt-1">
                  Key Controls: Access Control, Audit & Accountability, Configuration Management, System & Information Integrity
                </p>
              </li>
              <li className="mt-4">
                <Link href="/learning/security/iso-27001" className="text-blue-600 hover:text-blue-800">
                  ISO 27001 - Information Security Management
                </Link>
                <p className="text-sm text-gray-600 mt-1">
                  Core Areas: Risk Assessment, Security Policy, Asset Management, Access Control, Cryptography
                </p>
              </li>
            </ul>
          </div>

          {/* Privacy Frameworks */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Privacy Frameworks</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/learning/privacy/gdpr" className="text-blue-600 hover:text-blue-800">
                  GDPR - General Data Protection Regulation
                </Link>
                <p className="text-sm text-gray-600 mt-1">
                  Key Principles: Lawfulness, Fairness, Transparency, Purpose Limitation, Data Minimization
                </p>
              </li>
              <li className="mt-4">
                <Link href="/learning/privacy/ccpa" className="text-blue-600 hover:text-blue-800">
                  CCPA - California Consumer Privacy Act
                </Link>
                <p className="text-sm text-gray-600 mt-1">
                  Core Rights: Right to Know, Delete, Opt-Out, Non-Discrimination, Data Portability
                </p>
              </li>
            </ul>
          </div>

          {/* AI Frameworks */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">AI Frameworks</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/learning/ai/nist-ai-rmf" className="text-blue-600 hover:text-blue-800">
                  NIST AI Risk Management Framework
                </Link>
                <p className="text-sm text-gray-600 mt-1">
                  Core Functions: Map, Measure, Manage, Govern AI Systems
                </p>
              </li>
              <li className="mt-4">
                <Link href="/learning/ai/iso-42001" className="text-blue-600 hover:text-blue-800">
                  ISO 42001 - AI Management Systems
                </Link>
                <p className="text-sm text-gray-600 mt-1">
                  Key Areas: AI Governance, Risk Management, Ethical Considerations, Performance Monitoring
                </p>
              </li>
            </ul>
          </div>

          {/* Cloud Security Frameworks */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Cloud Security Frameworks</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/learning/cloud/cloud-security" className="text-blue-600 hover:text-blue-800">
                  Cloud Security Framework
                </Link>
                <p className="text-sm text-gray-600 mt-1">
                  Core Components: Identity & Access Management, Data Protection, Infrastructure Security, Incident Response
                </p>
              </li>
              <li className="mt-4">
                <Link href="/learning/cloud/csa-ccm" className="text-blue-600 hover:text-blue-800">
                  CSA CCM - Cloud Controls Matrix
                </Link>
                <p className="text-sm text-gray-600 mt-1">
                  Key Domains: Application Security, Change Management, Data Security, Identity & Access Management
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
