import { Metadata } from 'next';
import { csaCcmLearning } from '@/data/learning/frameworks/csa-ccm';
import Link from 'next/link';
import { ExternalLink, ChevronRight, Book, Wrench, FileText, Shield, AlertTriangle } from 'lucide-react';
import { CollapsibleSection } from '@/components/CollapsibleSection';

export const metadata: Metadata = {
  title: `${csaCcmLearning.name} - Learning Hub`,
  description: csaCcmLearning.overview.description,
};

export default function CSACCMLearning() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-600 mb-8">
        <Link href="/learning" className="hover:text-blue-600">Learning Hub</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <Link href="/learning/cloud" className="hover:text-blue-600">Cloud Security</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-gray-900">CSA CCM</span>
      </div>

      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">{csaCcmLearning.name}</h1>
        <p className="text-xl text-gray-600 max-w-4xl">
          {csaCcmLearning.overview.description}
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
        <Link
          href="#overview"
          className="flex items-center p-3 bg-white rounded-lg shadow hover:shadow-md hover:bg-gray-50"
        >
          <Book className="w-5 h-5 mr-2 text-blue-600" />
          <span>Overview</span>
        </Link>
        <Link
          href="#components"
          className="flex items-center p-3 bg-white rounded-lg shadow hover:shadow-md hover:bg-gray-50"
        >
          <Shield className="w-5 h-5 mr-2 text-blue-600" />
          <span>Components</span>
        </Link>
        <Link
          href="#implementation"
          className="flex items-center p-3 bg-white rounded-lg shadow hover:shadow-md hover:bg-gray-50"
        >
          <Wrench className="w-5 h-5 mr-2 text-blue-600" />
          <span>Implementation</span>
        </Link>
        <Link
          href="#challenges"
          className="flex items-center p-3 bg-white rounded-lg shadow hover:shadow-md hover:bg-gray-50"
        >
          <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
          <span>Challenges</span>
        </Link>
        <Link
          href="#controls"
          className="flex items-center p-3 bg-white rounded-lg shadow hover:shadow-md hover:bg-gray-50"
        >
          <Shield className="w-5 h-5 mr-2 text-blue-600" />
          <span>Controls</span>
        </Link>
        <Link
          href="#resources"
          className="flex items-center p-3 bg-white rounded-lg shadow hover:shadow-md hover:bg-gray-50"
        >
          <FileText className="w-5 h-5 mr-2 text-blue-600" />
          <span>Resources</span>
        </Link>
      </div>

      {/* Overview Section */}
      <CollapsibleSection title="Overview" defaultOpen={true} id="overview">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold mb-4">Why It Matters</h3>
            <p className="text-gray-600 mb-4">{csaCcmLearning.overview.importance}</p>
            <h4 className="font-semibold mb-2">Who Needs to Comply?</h4>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              {csaCcmLearning.overview.applicability.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Key Benefits</h3>
            <ul className="space-y-3">
              {csaCcmLearning.overview.benefits.map((benefit, index) => (
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
      </CollapsibleSection>

      {/* Key Components */}
      <CollapsibleSection title="Key Components" id="components">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          {csaCcmLearning.keyComponents.map((component, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold mb-3">{component.name}</h3>
              <p className="text-gray-600 mb-4">{component.description}</p>
              <p className="text-sm text-gray-500 italic">{component.importance}</p>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Implementation Steps */}
      <CollapsibleSection title="Implementation Guide" id="implementation">
        <div className="space-y-6">
          {csaCcmLearning.implementation.steps.map((step, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3">{index + 1}. {step.name}</h3>
              <p className="text-gray-600 mb-4">{step.description}</p>
              {step.tasks && step.tasks.length > 0 && (
                <ul className="grid md:grid-cols-2 gap-3">
                  {step.tasks.map((task, taskIndex) => (
                    <li key={taskIndex} className="flex items-center text-gray-600">
                      <div className="w-2 h-2 rounded-full bg-blue-600 mr-2"></div>
                      {task}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Common Challenges */}
      <CollapsibleSection title="Common Challenges" id="challenges">
        <div className="grid md:grid-cols-2 gap-6">
          {csaCcmLearning.implementation.commonChallenges.map((item, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-6">
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
      </CollapsibleSection>

      {/* Controls Section */}
      <CollapsibleSection title="Controls & Implementation" id="controls">
        {csaCcmLearning.controls.map((control, index) => (
          <div key={index} className="bg-gray-50 rounded-lg mb-6">
            <CollapsibleSection
              title={`${control.id}: ${control.name}`}
              className="mb-0"
            >
              <p className="text-gray-600 mb-6">{control.description}</p>
              
              {/* Examples */}
              <div className="mb-6">
                <h4 className="font-semibold mb-4">Implementation Examples</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  {control.examples.map((example, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-4">
                      <h5 className="font-semibold mb-2">{example.scenario}</h5>
                      <p className="text-gray-600 mb-3">{example.implementation}</p>
                      <div className="text-sm">
                        <strong>Evidence:</strong>
                        <p className="text-gray-600">{example.evidence}</p>
                      </div>
                      {example.tips && (
                        <div className="mt-3">
                          <strong className="text-sm">Tips:</strong>
                          <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                            {example.tips.map((tip, tipIdx) => (
                              <li key={tipIdx}>{tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Challenges and Best Practices */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Common Challenges</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    {control.commonChallenges.map((challenge, idx) => (
                      <li key={idx}>{challenge}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Best Practices</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    {control.bestPractices.map((practice, idx) => (
                      <li key={idx}>{practice}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CollapsibleSection>
          </div>
        ))}
      </CollapsibleSection>

      {/* Resources Section */}
      <CollapsibleSection title="Resources & Links" id="resources">
        {/* Governing Body */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Governing Body</h3>
          <div className="mb-4">
            <p className="text-gray-600">{csaCcmLearning.governingBody.description}</p>
          </div>
          <div className="flex items-center text-blue-600 hover:text-blue-700">
            <ExternalLink className="w-4 h-4 mr-2" />
            <a
              href={csaCcmLearning.governingBody.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Visit {csaCcmLearning.governingBody.name}
            </a>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {csaCcmLearning.governingBody.resources.map((resource, index) => (
            <div key={index} className="bg-white rounded-lg p-6">
              <h4 className="font-semibold mb-2">{resource.title}</h4>
              <p className="text-gray-600 text-sm mb-4">{resource.description}</p>
              <div className="flex items-center text-blue-600 hover:text-blue-700">
                <ExternalLink className="w-4 h-4 mr-2" />
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  View Resource
                </a>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );
}
