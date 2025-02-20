import { Book, Shield, Brain, Cloud, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { frameworkCategories } from '@/data/learning/categories';

const iconMap = {
  ShieldCheck: Shield,
  Lock: Shield,
  Brain,
  Cloud,
};

export default function LearningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Side Navigation */}
      <div className="fixed left-0 top-16 w-64 h-full bg-white border-r overflow-y-auto hidden lg:block">
        <nav className="p-4">
          <div className="mb-8">
            <h2 className="font-semibold mb-2 text-gray-900">Quick Links</h2>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/learning"
                  className="text-gray-600 hover:text-blue-600 flex items-center"
                >
                  <Book className="w-4 h-4 mr-2" />
                  Learning Home
                </Link>
              </li>
              <li>
                <Link 
                  href="/learning/basics"
                  className="text-gray-600 hover:text-blue-600 flex items-center"
                >
                  <Book className="w-4 h-4 mr-2" />
                  Compliance Basics
                </Link>
              </li>
              <li>
                <Link 
                  href="/learning/implementation"
                  className="text-gray-600 hover:text-blue-600 flex items-center"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Implementation Guide
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold mb-2 text-gray-900">Framework Categories</h2>
            <ul className="space-y-2">
              {frameworkCategories.map((category) => {
                const Icon = iconMap[category.icon as keyof typeof iconMap];
                return (
                  <li key={category.id}>
                    <Link 
                      href={`/learning/${category.id}`}
                      className="text-gray-600 hover:text-blue-600 flex items-center"
                    >
                      {Icon && <Icon className="w-4 h-4 mr-2" />}
                      {category.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
