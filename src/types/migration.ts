export type MigrationBatchStatus =
  | 'UPLOADED'
  | 'VALIDATING'
  | 'EXTRACTING'
  | 'SCANNING'
  | 'PARSING'
  | 'VALIDATING_DATA'
  | 'DUPLICATES_FOUND'
  | 'READY_FOR_REVIEW'
  | 'APPROVED'
  | 'IMPORTING'
  | 'IMPORTED'
  | 'FAILED'
  | 'ROLLED_BACK';

export interface MigrationBatch {
  id?: string;
  _id?: string;
  batchId: string;
  originalFileName: string;
  fileSize: number;
  sha256: string;
  status: MigrationBatchStatus;
  uploadedBy: string;
  uploadedAt: string;
  sourceType: string;
  fileCount: number;
  processedFileCount: number;
  recordCount: number;
  errorCount: number;
  duplicateCount: number;
  extractedPath?: string;
  createdAt?: string;
}

export interface MigrationFile {
  id?: string;
  _id?: string;
  batchId: string;
  fileId: string;
  originalPath: string;
  fileName: string;
  extension: string;
  mimeType: string;
  fileSize: number;
  sha256: string;
  classification:
    | 'MEMBERS'
    | 'SHARES'
    | 'LOANS'
    | 'LOAN_REPAYMENTS'
    | 'TRANSACTIONS'
    | 'FD'
    | 'ACCOUNTING'
    | 'BANK'
    | 'UNKNOWN'
    | 'UNSUPPORTED';
  classificationConfidence: number;
  recordCount: number;
  status: 'DETECTED' | 'CLASSIFIED' | 'PARSED' | 'ERROR' | 'SKIPPED';
  createdAt?: string;
}

export interface MigrationBatchDetails {
  batch: MigrationBatch;
  files: MigrationFile[];
  errorCount: number;
  duplicateCount: number;
  auditLogs: any[];
}
