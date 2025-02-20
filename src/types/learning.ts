export interface Resource {
  title: string;
  url: string;
  type: 'documentation' | 'guide' | 'tool';
  description?: string;
}

export interface GoverningBody {
  name: string;
  website: string;
  description: string;
  resources: Resource[];
}

export interface Example {
  scenario: string;
  implementation: string;
  evidence: string;
  tips?: string[];
}

export interface ControlLearning {
  id: string;
  name: string;
  description: string;
  examples: Example[];
  commonChallenges: string[];
  bestPractices: string[];
  relatedControls?: string[];
}

interface ImplementationStep {
  name: string;
  description: string;
  tasks: string[];
}

interface Challenge {
  challenge: string;
  solution: string;
  prevention: string;
}

interface Implementation {
  steps: ImplementationStep[];
  commonChallenges: Challenge[];
}

export interface FrameworkLearning {
  id: string;
  name: string;
  overview: {
    description: string;
    importance: string;
    applicability: string[];
    targetAudience: string[];
    benefits: string[];
    timeline: string;
    costConsiderations: string[];
  };
  governingBody: GoverningBody;
  keyComponents: Array<{
    name: string;
    description: string;
    importance: string;
  }>;
  controls: ControlLearning[];
  implementation: {
    steps: Array<{
      name: string;
      description: string;
      tasks: string[];
    }>;
    commonChallenges: Array<{
      challenge: string;
      solution: string;
      prevention: string;
    }>;
  };
  casestudies: Array<{
    title: string;
    industry: string;
    challenge: string;
    solution: string;
    outcome: string;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export interface FrameworkCategory {
  id: string;
  name: string;
  description: string;
  frameworks: string[];
  icon: string;
}
