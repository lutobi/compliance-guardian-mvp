'use client';

import React, { useState } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { useTeam } from '@/hooks/useTeam';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function TeamSettingsPage() {
  const { settings } = useSettings();
  const workspaceId = settings?.workspace_id || '';
  const { members, isLoading, isError, error, inviteMember, updateMember, removeMember, isInviting, isUpdating, isRemoving } = useTeam();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'owner'|'admin'|'editor'|'viewer'>('editor');

  const onInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await inviteMember({ workspace_id: workspaceId, email, role });
      toast.success('Invite sent');
      setEmail('');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (isLoading) return <div>Loading team...</div>;
  if (isError) return <div>Error loading team: {error?.message}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Team Settings</h2>
      <form onSubmit={onInvite} className="flex items-center space-x-2">
        <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Select value={role} onValueChange={(v) => setRole(v as any)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="owner">Owner</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" disabled={isInviting}>
          {isInviting ? 'Inviting...' : 'Invite'}
        </Button>
      </form>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase">Email</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase">Role</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase">Status</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {members.map((m) => (
            <tr key={m.id}>
              <td className="px-4 py-2">{m.email}</td>
              <td className="px-4 py-2">
                <Select value={m.role} onValueChange={(v) => updateMember({ id: m.id, updates: { role: v as any } })}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </td>
              <td className="px-4 py-2">{m.status}</td>
              <td className="px-4 py-2">
                <Button variant="destructive" size="icon" onClick={() => removeMember(m.id)} disabled={isRemoving}>
                  Remove
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
