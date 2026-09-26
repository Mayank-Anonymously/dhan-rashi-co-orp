import { MigrationBatch, MigrationBatchDetails, MigrationFile } from '@/types/migration';
import { ServiceResponse } from '@/types/common';
import { simulateDelay } from '@/utils/helpers';

const API_BASE = 'http://localhost:5000/api/admin/migration';

export interface MigrationUploadResponse {
  success: boolean;
  message?: string;
  code?: string;
  batchId?: string;
  fileName?: string;
  fileSize?: number;
  sha256?: string;
  status?: string;
  fileCount?: number;
  recordCount?: number;
  errorCount?: number;
  data?: any;
}

export const migrationService = {
  /**
   * Upload legacy data ZIP archive
   */
  async uploadZip(file: File, allowDuplicate: boolean = false): Promise<MigrationUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (allowDuplicate) {
        formData.append('allowDuplicate', 'true');
      }

      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      return json;
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to upload ZIP archive to server.',
        code: 'NETWORK_ERROR',
      };
    }
  },

  /**
   * Get all migration batches
   */
  async getBatches(): Promise<ServiceResponse<MigrationBatch[]>> {
    try {
      const res = await fetch(`${API_BASE}/batches`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch {
      // Fallback
    }

    await simulateDelay();
    return {
      success: true,
      data: [],
    };
  },

  /**
   * Get detailed batch overview with files, errors, and audit logs
   */
  async getBatchDetails(batchId: string): Promise<ServiceResponse<MigrationBatchDetails | null>> {
    try {
      const res = await fetch(`${API_BASE}/batches/${batchId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch {
      // Fallback
    }

    await simulateDelay();
    return {
      success: false,
      message: 'Batch details unavailable.',
      data: null,
    };
  },

  /**
   * Get files classified in a batch
   */
  async getBatchFiles(batchId: string): Promise<ServiceResponse<MigrationFile[]>> {
    try {
      const res = await fetch(`${API_BASE}/batches/${batchId}/files`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch {
      // Fallback
    }

    await simulateDelay();
    return {
      success: true,
      data: [],
    };
  },
};
