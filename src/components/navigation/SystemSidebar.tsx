import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { cn } from '@/lib/utils';
import {
  ChartBarIcon,
  Cog6ToothIcon,
  UsersIcon,
  DocumentCheckIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/system/dashboard', icon: ChartBarIcon },
  { name: 'Frameworks', href: '/system/frameworks', icon: DocumentCheckIcon },
  { name: 'Customers', href: '/system/customers', icon: UsersIcon },
  { name: 'Development', href: '/system/development', icon: CodeBracketIcon },
  { name: 'Settings', href: '/system/settings', icon: Cog6ToothIcon },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 bg-gray-900/80 lg:hidden',
          open ? 'block' : 'hidden'
        )}
        onClick={onClose}
      />

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-gray-900 lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col gap-y-5 px-6 py-6">
          <div className="flex h-16 shrink-0 items-center text-white">
            <span className="text-xl font-bold">System Dashboard</span>
          </div>
          
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6',
                          pathname === item.href
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        )}
                      >
                        <item.icon className="h-6 w-6 shrink-0" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              
              <li className="mt-auto">
                <div className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-white">
                  <span className="sr-only">Your profile</span>
                  <span aria-hidden="true">{user?.name}</span>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}
