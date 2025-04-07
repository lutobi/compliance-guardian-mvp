import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Evidence, EvidenceFile, OperationResult } from '@/types/evidence';

export class EvidenceService {
  private supabase = createClientComponentClient();

  async getEvidenceForSubcontrol(subcontrolId: string): Promise<Evidence[]> {
    const { data, error } = await this.supabase
      .from('evidence')
      .select('*')
      .eq('subcontrol_id', subcontrolId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.map(item => ({
      id: item.id,
      subcontrolId: item.subcontrol_id,
      frameworkId: item.framework_id,
      files: item.files || [],
      notes: item.notes || '',
      tags: item.tags || [],
      createdAt: item.created_at,
      updatedAt: item.updated_at
    })) || [];
  }

  private validateUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  async addEvidence(evidence: Omit<Evidence, 'id' | 'createdAt' | 'updatedAt'>): Promise<OperationResult<Evidence>> {
    try {
      if (!evidence.frameworkId) {
        throw new Error('Framework ID is required');
      }

      // Validate UUID format
      if (!this.validateUUID(evidence.frameworkId)) {
        console.error('Invalid framework ID:', evidence.frameworkId);
        throw new Error('Invalid framework ID format. Must be a valid UUID.');
      }

      const { data, error } = await this.supabase
        .from('evidence')
        .insert({
          subcontrol_id: evidence.subcontrolId,
          framework_id: evidence.frameworkId,
          notes: evidence.notes || '',
          tags: evidence.tags || [],
          files: evidence.files || []
        })
        .select('*')
        .single();

      if (error) throw error;

      return {
        success: true,
        data: {
          id: data.id,
          subcontrolId: data.subcontrol_id,
          frameworkId: data.framework_id,
          files: data.files || [],
          notes: data.notes || '',
          tags: data.tags || [],
          createdAt: data.created_at,
          updatedAt: data.updated_at
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.code || 'UNKNOWN',
          message: error.message || 'Failed to add evidence'
        }
      };
    }
  }

  async updateEvidence(id: string, evidence: Partial<Evidence>): Promise<OperationResult<Evidence>> {
    try {
      const { data, error } = await this.supabase
        .from('evidence')
        .update({
          notes: evidence.notes || '',
          tags: evidence.tags || [],
          files: evidence.files || [],
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;

      return {
        success: true,
        data: {
          id: data.id,
          subcontrolId: data.subcontrol_id,
          frameworkId: data.framework_id,
          files: data.files || [],
          notes: data.notes || '',
          tags: data.tags || [],
          createdAt: data.created_at,
          updatedAt: data.updated_at
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.code || 'UNKNOWN',
          message: error.message || 'Failed to update evidence'
        }
      };
    }
  }

  async deleteEvidence(id: string): Promise<OperationResult<void>> {
    try {
      const { error } = await this.supabase
        .from('evidence')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        success: true
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.code || 'UNKNOWN',
          message: error.message || 'Failed to delete evidence'
        }
      };
    }
  }

  async uploadFile(file: File, path: string): Promise<OperationResult<EvidenceFile>> {
    try {
      const { data, error } = await this.supabase.storage
        .from('evidence')
        .upload(path, file);

      if (error) throw error;

      const { data: { publicUrl } } = this.supabase.storage
        .from('evidence')
        .getPublicUrl(path);

      return {
        success: true,
        data: {
          name: file.name,
          size: file.size,
          type: file.type,
          url: publicUrl
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.code || 'UNKNOWN',
          message: error.message || 'Failed to upload file'
        }
      };
    }
  }
}
