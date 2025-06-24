import type { Integration } from '@/types/integration';
import { getBaseUrl } from '@/lib/utils';

export class IntegrationService {
  static async getIntegrations(): Promise<Integration[]> {
    const res = await fetch(`${getBaseUrl()}/api/integrations`, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch integrations');
    return json.data as Integration[];
  }

  static async createIntegration(
    integration: Omit<Integration, 'id' | 'workspace_id' | 'created_at' | 'updated_at'>
  ): Promise<Integration> {
    const res = await fetch(`${getBaseUrl()}/api/integrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(integration),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to add integration');
    return json.data as Integration;
  }

  static async updateIntegration(
    id: string,
    updates: Partial<Omit<Integration, 'id' | 'workspace_id' | 'created_at' | 'updated_at'>>
  ): Promise<Integration> {
    const res = await fetch(`${getBaseUrl()}/api/integrations`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id, updates }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update integration');
    return json.data as Integration;
  }

  static async deleteIntegration(id: string): Promise<void> {
    const res = await fetch(`${getBaseUrl()}/api/integrations`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete integration');
  }
}
