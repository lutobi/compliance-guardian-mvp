import { Evidence, EvidenceMap, OperationResult } from '../types/evidence';

const MAX_STORAGE_SIZE = 4 * 1024 * 1024; // 4MB safety limit

export class StorageService {
  private getStorageKey(frameworkId: string): string {
    return `evidence-${frameworkId}`;
  }

  private calculateSize(data: string): number {
    return new Blob([data]).size;
  }

  async getEvidence(frameworkId: string): Promise<OperationResult<EvidenceMap>> {
    try {
      const key = this.getStorageKey(frameworkId);
      const data = localStorage.getItem(key);
      
      if (!data) {
        return { success: true, data: {} };
      }

      const parsed = JSON.parse(data);
      
      // Convert any old format data to new format
      const migrated: EvidenceMap = Object.entries(parsed).reduce((acc, [subcontrolId, evidenceList]) => {
        acc[subcontrolId] = (evidenceList as Evidence[]).map(evidence => ({
          ...evidence,
          files: evidence.files || [],
          notes: evidence.notes || '',
          version: 1,
          timestamp: evidence.timestamp || new Date().toISOString()
        }));
        return acc;
      }, {} as EvidenceMap);

      return { success: true, data: migrated };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'storage_read_error',
          message: 'Failed to read evidence data'
        }
      };
    }
  }

  async setEvidence(frameworkId: string, evidence: EvidenceMap): Promise<OperationResult<void>> {
    try {
      const key = this.getStorageKey(frameworkId);
      const data = JSON.stringify(evidence);
      const size = this.calculateSize(data);

      if (size > MAX_STORAGE_SIZE) {
        return {
          success: false,
          error: {
            code: 'storage_limit_exceeded',
            message: 'Evidence data exceeds storage limit'
          }
        };
      }

      localStorage.setItem(key, data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'storage_write_error',
          message: 'Failed to save evidence data'
        }
      };
    }
  }
}
