import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity } from 'lucide-react';

const navigation = [
  { name: 'Monitoring', href: '/dashboard/monitoring', icon: Activity },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1 px-2">
      {navigation.map((item) => {
        const isActive = pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`
              group flex items-center px-2 py-2 text-sm font-medium rounded-md
              ${isActive
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            <Icon
              className={`
                mr-3 h-5 w-5 flex-shrink-0
                ${isActive
                  ? 'text-blue-600'
                  : 'text-gray-400 group-hover:text-gray-500'
                }
              `}
              aria-hidden="true"
            />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
