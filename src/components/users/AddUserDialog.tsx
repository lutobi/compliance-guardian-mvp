import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AddUserDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (userData: any) => void;
  isSystemUser: boolean;
  workspaceId: string;
}

export function AddUserDialog({
  open,
  onClose,
  onAdd,
  isSystemUser,
  workspaceId,
}: AddUserDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
  });

  const systemRoles = [
    { id: 'system_admin', name: 'System Admin' },
    { id: 'system_developer', name: 'System Developer' },
  ];

  const customerRoles = [
    { id: 'customer_admin', name: 'Customer Admin' },
    { id: 'customer_manager', name: 'Customer Manager' },
    { id: 'customer_user', name: 'Customer User' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClientComponentClient();

      // Create auth user
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        email_confirm: true,
        user_metadata: {
          name: formData.name,
        },
      });

      if (authError) throw authError;

      // Make sure we have a valid user ID
      if (!authUser || !authUser.user || !authUser.user.id) {
        throw new Error('Failed to create user: No user ID returned');
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authUser.user.id,
          email: formData.email,
          name: formData.name,
          role_id: formData.role,
          workspace_id: workspaceId,
          status: 'pending',
        });

      if (profileError) throw profileError;

      onAdd(formData);
      setFormData({ name: '', email: '', role: '' });
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Add {isSystemUser ? 'System User' : 'Team Member'}
          </DialogTitle>
          <DialogDescription>
            Fill out the form below to add a new {isSystemUser ? 'system user' : 'team member'} to your organization.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {(isSystemUser ? systemRoles : customerRoles).map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
