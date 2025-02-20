import { Metadata } from 'next';
import { hipaaLearning } from '@/data/learning/frameworks/hipaa';
import Link from 'next/link';
import { ExternalLink, ChevronRight, Book, Wrench, FileText, Users, Shield, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: `${hipaaLearning.name} - Learning Hub`,
  description: hipaaLearning.overview.description,
};

export default function HIPAALearning() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-600 mb-8">
        <Link href="/learning" className="hover:text-blue-600">Learning Hub</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <Link href="/learning/privacy" className="hover:text-blue-600">Privacy</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-gray-900">HIPAA</span>
      </div>

      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">{hipaaLearning.name}</h1>
        <p className="text-xl text-gray-600 max-w-4xl">
          {hipaaLearning.overview.description}
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <Link
          href="#overview"
          className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md"
        >
          <Book className="w-5 h-5 mr-2 text-blue-600" />
          <span>Overview</span>
        </Link>
        <Link
          href="#implementation"
          className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md"
        >
          <Wrench className="w-5 h-5 mr-2 text-blue-600" />
          <span>Implementation</span>
        </Link>
        <Link
          href="#controls"
          className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md"
        >
          <Shield className="w-5 h-5 mr-2 text-blue-600" />
          <span>Controls</span>
        </Link>
        <Link
          href="#resources"
          className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md"
        >
          <FileText className="w-5 h-5 mr-2 text-blue-600" />
          <span>Resources</span>
        </Link>
      </div>

      {/* Overview Section */}
      <section id="overview" className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Overview</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">Why It Matters</h3>
            <p className="text-gray-600 mb-4">{hipaaLearning.overview.importance}</p>
            <h4 className="font-semibold mb-2">Who Needs to Comply?</h4>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              {hipaaLearning.overview.applicability.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">Key Benefits</h3>
            <ul className="space-y-3">
              {hipaaLearning.overview.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-500 flex items-center justify-center mt-0.5">
                    ✓
                  </div>
                  <span className="ml-3 text-gray-600">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Key Components */}
      <section id="components" className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Key Components</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {hipaaLearning.keyComponents.map((component, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-3">{component.name}</h3>
              <p className="text-gray-600 mb-4">{component.description}</p>
              <p className="text-sm text-gray-500 italic">{component.importance}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Implementation Steps */}
      <section id="implementation" className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Implementation Guide</h2>
        <div className="space-y-6">
          {hipaaLearning.implementation.steps.map((step, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-3">{index + 1}. {step.name}</h3>
              <p className="text-gray-600 mb-4">{step.description}</p>
              <ul className="grid md:grid-cols-2 gap-3">
                {step.tasks.map((task, taskIndex) => (
                  <li key={taskIndex} className="flex items-center text-gray-600">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mr-2"></div>
                    {task}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Common Challenges */}
      <section id="challenges" className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Common Challenges</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {hipaaLearning.implementation.commonChallenges.map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0 mt-1" />
                <h3 className="font-semibold">{item.challenge}</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Solution:</p>
                  <p className="text-gray-600">{item.solution}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Prevention:</p>
                  <p className="text-gray-600">{item.prevention}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Controls Section */}
      <section id="controls" className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Controls & Examples</h2>
        <div className="space-y-8">
          {hipaaLearning.controls.map((control, index) => (
            <div key={index} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{control.name}</h3>
                <p className="text-gray-600 mb-6">{control.description}</p>
                <div className="grid md:grid-cols-2 gap-6">
                  {control.examples.map((example, exIndex) => (
                    <div key={exIndex} className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold mb-3">{example.scenario}</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Implementation:</p>
                          <p className="text-gray-600">{example.implementation}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Evidence:</p>
                          <p className="text-gray-600">{example.evidence}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Tips:</p>
                          <ul className="list-disc list-inside text-gray-600 space-y-1">
                            {example.tips.map((tip, tipIndex) => (
                              <li key={tipIndex}>{tip}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Resources */}
      <section id="resources" className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Official Resources</h2>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Governing Body</h3>
            <p className="text-gray-600 mb-4">{hipaaLearning.governingBody.description}</p>
            <a
              href={hipaaLearning.governingBody.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              Visit {hipaaLearning.governingBody.name}
              <ExternalLink className="w-4 h-4 ml-1" />
            </a>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Helpful Resources</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {hipaaLearning.governingBody.resources.map((resource, index) => (
                <a
                  key={index}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{resource.title}</h4>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600">{resource.description}</p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
