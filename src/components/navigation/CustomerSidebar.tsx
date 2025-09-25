import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { useCustomerWorkspace } from '@/lib/workspace/customer-context';
import { cn } from '@/lib/utils';
import {
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  DocumentMagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

// Routes will be built per-workspace inside the component


interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { workspace } = useCustomerWorkspace();
  
  // Redirect if no workspace is selected
  if (!workspace) {
    router.replace('/workspace/select');
    return null;
  }

  const workspaceSlug = workspace?.slug as string;
  const navigation = [
    { name: 'Dashboard', href: `/workspace/${workspaceSlug}/dashboard`, icon: ChartBarIcon },
    { name: 'Compliance', href: `/workspace/${workspaceSlug}/compliance`, icon: ClipboardDocumentCheckIcon },
    { name: 'Monitoring', href: `/workspace/${workspaceSlug}/monitoring`, icon: DocumentMagnifyingGlassIcon },
    { name: 'Team', href: `/workspace/${workspaceSlug}/team`, icon: UserGroupIcon },
    { name: 'Settings', href: `/workspace/${workspaceSlug}/settings`, icon: Cog6ToothIcon },
  ];

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
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col gap-y-5 px-6 py-6">
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex flex-col">
              <span className="text-xl font-bold">{workspace.name}</span>
              <button 
                onClick={() => router.push('/workspace/select')}
                className="text-sm text-gray-500 hover:text-primary"
                data-testid="workspace-menu"
              >
                Switch Workspace
              </button>
            </div>
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
                            ? 'bg-gray-50 text-primary'
                            : 'text-gray-700 hover:text-primary hover:bg-gray-50'
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
                <div className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900">
                  <span className="sr-only">Your profile</span>
                  <span aria-hidden="true">{user?.email}</span>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}
