import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface FrameworkCardProps {
  href: string;
  name: string;
  description: string;
  category: string;
}

export function FrameworkCard({ href, name, description, category }: FrameworkCardProps) {
  return (
    <Link
      href={href}
      className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
    >
      <div className="flex flex-col h-full">
        <div className="mb-4">
          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
            {category}
          </span>
        </div>
        <h3 className="text-xl font-semibold mb-2">{name}</h3>
        <p className="text-gray-600 mb-4 flex-grow">{description}</p>
        <div className="flex items-center text-blue-600 group">
          <span className="font-medium">Learn more</span>
          <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
