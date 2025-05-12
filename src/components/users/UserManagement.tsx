import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useWorkspace } from '@/lib/workspace/context';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserTable } from './UserTable';
import { AddUserDialog } from './AddUserDialog';
import { UserRole } from '@/types/core';

export function UserManagement() {
  const { user, isSystemUser } = useAuth();
  const { workspace } = useWorkspace();
  const [showAddUser, setShowAddUser] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, [workspace?.id]);

  const loadUsers = async () => {
    const supabase = createClientComponentClient();
    const query = supabase
      .from('users')
      .select('*, roles(*)');

    // If system user, can see all users
    // If customer admin, can only see users in their workspace
    if (!isSystemUser) {
      query.eq('workspace_id', workspace?.id);
    }

    const { data } = await query;
    setUsers(data || []);
    setLoading(false);
  };

  const handleAddUser = async (userData) => {
    // Add user logic here
    await addUser(userData);
    loadUsers();
    setShowAddUser(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {isSystemUser ? 'All Users' : 'Team Members'}
        </h1>
        <Button onClick={() => setShowAddUser(true)}>
          Add {isSystemUser ? 'User' : 'Team Member'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isSystemUser ? 'User Management' : 'Team Management'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <UserTable 
              users={users}
              isSystemUser={isSystemUser}
              onUserUpdated={loadUsers}
            />
          )}
        </CardContent>
      </Card>

      <AddUserDialog
        open={showAddUser}
        onClose={() => setShowAddUser(false)}
        onAdd={handleAddUser}
        isSystemUser={isSystemUser}
        workspaceId={workspace?.id}
      />
    </div>
  );
}
