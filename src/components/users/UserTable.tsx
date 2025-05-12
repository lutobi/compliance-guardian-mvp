import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';

interface User {
  id: string;
  name: string;
  email: string;
  role: {
    name: string;
    capabilities: {
      type: 'system' | 'customer';
      access: string[];
    };
  };
  lastLogin: string;
  status: 'active' | 'inactive' | 'pending';
}

interface UserTableProps {
  users: User[];
  isSystemUser: boolean;
  onUserUpdated: () => void;
}

export function UserTable({ users, isSystemUser, onUserUpdated }: UserTableProps) {
  const handleStatusChange = async (userId: string, status: string) => {
    const supabase = createClientComponentClient();
    await supabase
      .from('users')
      .update({ status })
      .eq('id', userId);
    onUserUpdated();
  };

  const handleRoleChange = async (userId: string, roleId: string) => {
    const supabase = createClientComponentClient();
    await supabase
      .from('users')
      .update({ role_id: roleId })
      .eq('id', userId);
    onUserUpdated();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last Login</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <Badge variant="outline">
                {user.role.name}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge className={getStatusColor(user.status)}>
                {user.status}
              </Badge>
            </TableCell>
            <TableCell>
              {new Date(user.lastLogin).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <EllipsisVerticalIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isSystemUser && (
                    <>
                      <DropdownMenuItem
                        onClick={() => handleRoleChange(user.id, 'system_admin')}
                      >
                        Make System Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleRoleChange(user.id, 'system_developer')}
                      >
                        Make Developer
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem
                    onClick={() => handleStatusChange(user.id, 'active')}
                  >
                    Activate User
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleStatusChange(user.id, 'inactive')}
                  >
                    Deactivate User
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
