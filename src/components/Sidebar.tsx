'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  ShieldCheck, 
  ClipboardCheck, 
  FileBarChart, 
  GitCompare,
  Activity 
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Frameworks', href: '/frameworks', icon: ShieldCheck },
  { 
    name: 'Monitoring', 
    href: '/dashboard/monitoring/setup', 
    icon: Activity,
    activePattern: '/dashboard/monitoring'
  },
  { name: 'Compare', href: '/compare', icon: GitCompare },
  { name: 'Learning', href: '/learning', icon: BookOpen },
  { name: 'Assessments', href: '/dashboard/assessments', icon: ClipboardCheck },
  { name: 'Reports', href: '/dashboard/reports', icon: FileBarChart },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-white border-r border-gray-200">
      <div className="flex items-center justify-center h-16 flex-shrink-0 px-4 border-b border-gray-200">
        <span className="text-lg font-semibold">Compliance Guardian</span>
      </div>
      <div className="flex flex-col flex-1 overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = item.activePattern 
              ? pathname.startsWith(item.activePattern)
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center px-3 py-2 text-sm font-medium rounded-md
                  ${isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
