import { getBaseUrl } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import type { Evidence, EvidenceFile, OperationResult } from '@/types/evidence';

export class EvidenceService {
  private supabase = supabase;

  async getEvidenceForSubcontrol(subcontrolId: string): Promise<Evidence[]> {
    try {
      console.log('Fetching evidence for subcontrol:', subcontrolId);
      const { data, error } = await this.supabase
        .from('evidence')
        .select('*')
        .eq('subcontrol_id', subcontrolId)
        .order('created_at', { ascending: false });
  
      if (error) {
        console.error('Error fetching evidence:', error);
        throw error;
      }
      
      console.log('Evidence data:', data);
      return data?.map(item => ({
        id: item.id,
        subcontrolId: item.subcontrol_id,
        frameworkId: item.framework_id,
        files: Array.isArray(item.files) ? item.files as unknown as EvidenceFile[] : [],
        notes: item.notes || '',
        tags: item.tags || [],
        createdAt: item.created_at || '',
        updatedAt: item.updated_at || ''
      })) || [];  
    } catch (error) {
      console.error('Failed to get evidence:', error);
      return [];
    }
  }



  async addEvidence(
    payload: {
      controlId: string;
      assessmentId?: string;
      subcontrolId: string;
      frameworkId: string;
      notes?: string;
      tags?: string[];
      files?: EvidenceFile[];
      controlName?: string;
    }
  ): Promise<OperationResult<Evidence>> {
    try {
      console.log('Adding evidence via API:', payload);
      
      // Build request body, omitting undefined fields
      const bodyPayload: any = {
        subcontrolId: payload.subcontrolId,
        frameworkId: payload.frameworkId,
        notes: payload.notes || '',
        tags: payload.tags || [],
        files: payload.files || [],
        controlName: payload.controlName || 'control'
      };
      if (payload.controlId) bodyPayload.controlId = payload.controlId;
      if (payload.assessmentId) bodyPayload.assessmentId = payload.assessmentId;
      const response = await fetch(`${getBaseUrl()}/api/evidence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });
      
      const result = await response.json();
      console.log('Evidence API response:', result);
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to add evidence');
      }
      
      return {
        success: true,
        data: result.data
      };
    } catch (error: any) {
      console.error('Failed to add evidence:', error);
      return {
        success: false,
        error: {
          code: 'API_ERROR',
          message: error.message || 'Failed to add evidence'
        }
      };
    }
  }

  async updateEvidence(id: string, evidence: Partial<Evidence>): Promise<OperationResult<Evidence>> {
    try {
      console.log('Updating evidence:', id, evidence);
      
      // Prepare the update record with proper field names
      const updateRecord: any = {
        updated_at: new Date().toISOString()
      };
      
      // Only include fields that are provided
      if (evidence.notes !== undefined) updateRecord.notes = evidence.notes;
      if (evidence.tags !== undefined) updateRecord.tags = evidence.tags;
      if (evidence.files !== undefined) updateRecord.files = evidence.files;
      
      console.log('Update record:', updateRecord);
      const { data, error } = await this.supabase
        .from('evidence')
        .update(updateRecord)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        console.error('Error updating evidence:', error);
        throw error;
      }

      console.log('Evidence updated successfully:', data);
      return {
        success: true,
        data: {
          id: data.id,
          subcontrolId: data.subcontrol_id,
          frameworkId: data.framework_id,
          files: Array.isArray(data.files) ? data.files as unknown as EvidenceFile[] : [],
          notes: data.notes || '',
          tags: data.tags || [],
          createdAt: data.created_at || '',
          updatedAt: data.updated_at || ''
        }
      };
    } catch (error: any) {
      console.error('Failed to update evidence:', error);
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
      console.log('Deleting evidence:', id);
      const { error } = await this.supabase
        .from('evidence')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting evidence:', error);
        throw error;
      }

      console.log('Evidence deleted successfully');
      return {
        success: true
      };
    } catch (error: any) {
      console.error('Failed to delete evidence:', error);
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
      console.log('Processing file for upload:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });
      
      // Check if file is too large (10MB limit for base64 encoding)
      if (file.size > 10 * 1024 * 1024) {
        console.error('File too large (max 10MB):', file.size);
        return {
          success: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message: 'File exceeds the maximum size limit of 10MB'
          }
        };
      }
      
      // Read the file as base64
      return new Promise((resolve) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
          if (!event.target || !event.target.result) {
            resolve({
              success: false,
              error: {
                code: 'FILE_READ_ERROR',
                message: 'Failed to read file content'
              }
            });
            return;
          }
          
          const base64Content = event.target.result.toString();
          console.log('File read successfully, content length:', base64Content.length);
          
          // Create a unique ID for the file
          const fileId = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
          
          // Create a data URL that can be used directly in img tags or as download links
          const dataUrl = file.type.startsWith('image/') 
            ? base64Content  // For images, use the base64 content directly
            : `data:${file.type};base64,${base64Content.split(',')[1]}`;
          
          resolve({
            success: true,
            data: {
              name: file.name,
              size: file.size,
              type: file.type,
              url: dataUrl,
              id: fileId
            }
          });
        };
        
        reader.onerror = () => {
          console.error('Error reading file:', reader.error);
          resolve({
            success: false,
            error: {
              code: 'FILE_READ_ERROR',
              message: 'Failed to read file: ' + (reader.error?.message || 'Unknown error')
            }
          });
        };
        
        reader.readAsDataURL(file);
      });
    } catch (error: any) {
      console.error('File processing error:', error);
      return {
        success: false,
        error: {
          code: error.code || 'UNKNOWN',
          message: error.message || 'Failed to process file'
        }
      };
    }
  }
}
