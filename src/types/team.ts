export type Role = 'owner' | 'admin' | 'editor' | 'viewer';
export type Status = 'pending' | 'active';

export interface TeamMember {
  id: string;
  workspace_id: string;
  email: string;
  role: Role;
  status: Status;
  invited_at: string;
  accepted_at?: string;
}
