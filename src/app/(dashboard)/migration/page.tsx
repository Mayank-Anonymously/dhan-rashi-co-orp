'use client';

import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/common/PageHeader';
import StatusBadge from '@/components/common/StatusBadge';
import LoadingState from '@/components/common/LoadingState';
import EmptyState from '@/components/common/EmptyState';
import { migrationService } from '@/services/migrationService';
import { MigrationBatch, MigrationBatchDetails, MigrationFile } from '@/types/migration';
import { formatDate } from '@/utils/helpers';

export default function MigrationPage() {
  const [batches, setBatches] = useState<MigrationBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [allowDuplicate, setAllowDuplicate] = useState(false);
  const [activeBatchDetails, setActiveBatchDetails] = useState<MigrationBatchDetails | null>(null);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'danger' | 'warning'; text: string } | null>(null);

  const fetchBatches = async () => {
    try {
      const res = await migrationService.getBatches();
      if (res.success && res.data) {
        setBatches(res.data);
        if (res.data.length > 0 && !activeBatchDetails) {
          loadBatchDetails(res.data[0].batchId);
        }
      }
    } catch {
      // Handled in service
    } finally {
      setLoading(false);
    }
  };

  const loadBatchDetails = async (batchId: string) => {
    try {
      const res = await migrationService.getBatchDetails(batchId);
      if (res.success && res.data) {
        setActiveBatchDetails(res.data);
      }
    } catch {
      // Handled in service
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setUploadMessage(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadMessage({ type: 'warning', text: 'Please select a ZIP file to upload.' });
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith('.zip')) {
      setUploadMessage({ type: 'danger', text: 'Only ZIP archives are supported (.zip extension required).' });
      return;
    }

    setUploading(true);
    setUploadMessage(null);

    try {
      const res = await migrationService.uploadZip(selectedFile, allowDuplicate);
      if (res.success) {
        setUploadMessage({
          type: 'success',
          text: `Batch ${res.batchId} processed! Staged ${res.recordCount} records across ${res.fileCount} files.`,
        });
        setSelectedFile(null);
        await fetchBatches();
        if (res.batchId) {
          await loadBatchDetails(res.batchId);
        }
      } else {
        setUploadMessage({
          type: res.code === 'DUPLICATE_ARCHIVE' ? 'warning' : 'danger',
          text: res.message || 'Upload failed.',
        });
      }
    } catch (err: any) {
      setUploadMessage({ type: 'danger', text: err.message || 'Error uploading file.' });
    } finally {
      setUploading(false);
    }
  };

  const getClassificationBadge = (classification: string) => {
    const map: Record<string, { bg: string; icon: string }> = {
      MEMBERS: { bg: 'bg-primary text-white', icon: 'bi-person-vcard' },
      SHARES: { bg: 'bg-success text-white', icon: 'bi-pie-chart' },
      LOANS: { bg: 'bg-info text-dark', icon: 'bi-bank' },
      LOAN_REPAYMENTS: { bg: 'bg-warning text-dark', icon: 'bi-cash-coin' },
      TRANSACTIONS: { bg: 'bg-secondary text-white', icon: 'bi-journal-text' },
      BANK: { bg: 'bg-dark text-white', icon: 'bi-bank2' },
      FD: { bg: 'bg-indigo text-white', icon: 'bi-piggy-bank' },
      ACCOUNTING: { bg: 'bg-teal text-white', icon: 'bi-calculator' },
      UNKNOWN: { bg: 'bg-light text-muted', icon: 'bi-question-circle' },
      UNSUPPORTED: { bg: 'bg-danger text-white', icon: 'bi-x-circle' },
    };

    const conf = map[classification] || { bg: 'bg-secondary text-white', icon: 'bi-file-earmark' };
    return (
      <span className={`badge ${conf.bg} d-inline-flex align-items-center gap-1 px-2 py-1`}>
        <i className={`bi ${conf.icon}`}></i>
        {classification}
      </span>
    );
  };

  const totalFiles = batches.reduce((acc, b) => acc + (b.fileCount || 0), 0);
  const totalRecords = batches.reduce((acc, b) => acc + (b.recordCount || 0), 0);

  return (
    <div className="container-fluid p-0">
      <PageHeader
        title="Legacy Data Migration & Staging"
        description="Upload, inspect, classify, and stage historical cooperative records in isolated staging prior to production import"
      />

      {/* Security & Safety Banner */}
      <div className="alert alert-info border-start border-4 border-info shadow-sm mb-4">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <i className="bi bi-shield-check fs-2 text-info"></i>
            <div>
              <h6 className="alert-heading fw-bold mb-1">Zero-Risk Isolated Staging Pipeline Active</h6>
              <p className="mb-0 text-muted small">
                Uploaded archives are isolated in dedicated batch sandboxes. Magic bytes verification, Zip-Slip path-traversal prevention, and SHA-256 duplicate detection protect production ledgers. No live financial data is altered without admin review and approval.
              </p>
            </div>
          </div>
          <span className="badge bg-light text-success border border-success d-none d-md-inline-block px-3 py-2">
            <i className="bi bi-lock-fill me-1"></i> Sandbox Protected
          </span>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="stat-card-label">TOTAL BATCHES</span>
              <div className="stat-card-icon bg-primary-subtle text-primary">
                <i className="bi bi-folder-check"></i>
              </div>
            </div>
            <div className="stat-card-value">{batches.length}</div>
            <div className="stat-card-meta text-muted">
              <span>Archives Ingested</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="stat-card-label">TOTAL EXTRACTED FILES</span>
              <div className="stat-card-icon bg-info-subtle text-info">
                <i className="bi bi-file-earmark-spreadsheet"></i>
              </div>
            </div>
            <div className="stat-card-value">{totalFiles}</div>
            <div className="stat-card-meta text-muted">
              <span>Classified in Staging</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="stat-card-label">STAGED RECORDS</span>
              <div className="stat-card-icon bg-success-subtle text-success">
                <i className="bi bi-database-check"></i>
              </div>
            </div>
            <div className="stat-card-value">{totalRecords.toLocaleString()}</div>
            <div className="stat-card-meta text-muted">
              <span>Parsed & Normalized</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="stat-card-label">PIPELINE STATUS</span>
              <div className="stat-card-icon bg-warning-subtle text-warning">
                <i className="bi bi-check2-circle"></i>
              </div>
            </div>
            <div className="stat-card-value text-success">Active</div>
            <div className="stat-card-meta text-muted">
              <span>Port 5000 & 8000 Ready</span>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Upload Archive Card */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
              <h6 className="mb-0 fw-bold">
                <i className="bi bi-cloud-arrow-up text-primary me-2"></i>
                Upload Legacy Data Archive (ZIP)
              </h6>
              <span className="badge bg-secondary-subtle text-secondary">multipart/form-data</span>
            </div>
            <div className="card-body">
              {uploadMessage && (
                <div className={`alert alert-${uploadMessage.type} alert-dismissible fade show`} role="alert">
                  <div className="d-flex align-items-center gap-2">
                    <i className={`bi ${uploadMessage.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
                    <div>{uploadMessage.text}</div>
                  </div>
                  <button type="button" className="btn-close" onClick={() => setUploadMessage(null)}></button>
                </div>
              )}

              <form onSubmit={handleUpload}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Select Historical ZIP File</label>
                  <input
                    type="file"
                    className="form-control"
                    accept=".zip"
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                  <small className="form-text text-muted">
                    Supports .zip archives containing Member, Share, Loan, Repayment, Bank, and Accounting files (CSV, XLSX, XLS, PDF, JSON). Max: 100 MB.
                  </small>
                </div>

                <div className="form-check mb-4">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="allowDupCheck"
                    checked={allowDuplicate}
                    onChange={(e) => setAllowDuplicate(e.target.checked)}
                    disabled={uploading}
                  />
                  <label className="form-check-label small text-muted" htmlFor="allowDupCheck">
                    Force re-upload if identical SHA-256 hash was previously uploaded
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                  disabled={!selectedFile || uploading}
                >
                  {uploading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span>Processing & Classifying Archive...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-arrow-up-circle"></i>
                      <span>Upload & Stage Batch</span>
                    </>
                  )}
                </button>
              </form>

              <hr className="my-4" />

              <div className="bg-light p-3 rounded">
                <h6 className="fw-bold mb-2 small text-uppercase text-muted">CLI / cURL Usage</h6>
                <div className="bg-dark text-white p-2 rounded small font-monospace overflow-x-auto text-nowrap">
                  curl -X POST http://localhost:8000/api/admin/migration/upload \<br />
                  &nbsp;&nbsp;-F &quot;file=@legacy_data.zip&quot;
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Batch Details & Manifest */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
              <h6 className="mb-0 fw-bold">
                <i className="bi bi-file-earmark-check text-success me-2"></i>
                Batch Inspection & Staging Manifest
              </h6>
              {activeBatchDetails?.batch && (
                <span className="badge bg-primary font-monospace">{activeBatchDetails.batch.batchId}</span>
              )}
            </div>
            <div className="card-body">
              {!activeBatchDetails ? (
                <EmptyState
                  icon="bi-box-seam"
                  title="No Batch Selected"
                  message="Upload a new ZIP file or select a batch from the history table below to inspect classified files and staging records."
                />
              ) : (
                <>
                  {/* Batch Summary Strip */}
                  <div className="row g-2 mb-3 bg-light p-2 rounded small">
                    <div className="col-6 col-md-3">
                      <span className="text-muted d-block">Original Archive</span>
                      <strong className="text-truncate d-block">{activeBatchDetails.batch.originalFileName}</strong>
                    </div>
                    <div className="col-6 col-md-3">
                      <span className="text-muted d-block">Archive Size</span>
                      <strong>{(activeBatchDetails.batch.fileSize / 1024).toFixed(1)} KB</strong>
                    </div>
                    <div className="col-6 col-md-3">
                      <span className="text-muted d-block">Status</span>
                      <StatusBadge status={activeBatchDetails.batch.status} />
                    </div>
                    <div className="col-6 col-md-3">
                      <span className="text-muted d-block">Uploaded By</span>
                      <strong>{activeBatchDetails.batch.uploadedBy}</strong>
                    </div>
                  </div>

                  {/* SHA-256 Checksum */}
                  <div className="mb-3 small">
                    <span className="text-muted fw-bold">SHA-256 Checksum: </span>
                    <span className="font-monospace text-break bg-light px-2 py-1 rounded text-secondary">
                      {activeBatchDetails.batch.sha256}
                    </span>
                  </div>

                  {/* Manifest File Table */}
                  <h6 className="fw-bold small text-uppercase text-muted mt-3 mb-2">
                    Classified Staging Files ({activeBatchDetails.files.length})
                  </h6>
                  <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <table className="table table-sm table-hover align-middle mb-0">
                      <thead className="table-light small">
                        <tr>
                          <th>File Name</th>
                          <th>Classification</th>
                          <th>Confidence</th>
                          <th className="text-end">Staged Records</th>
                          <th className="text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="small">
                        {activeBatchDetails.files.map((file) => (
                          <tr key={file.fileId || file._id}>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <i className="bi bi-file-earmark-text text-primary"></i>
                                <span className="fw-semibold">{file.fileName}</span>
                              </div>
                            </td>
                            <td>{getClassificationBadge(file.classification)}</td>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <div className="progress flex-grow-1" style={{ height: '6px', minWidth: '50px' }}>
                                  <div
                                    className="progress-bar bg-success"
                                    style={{ width: `${(file.classificationConfidence || 0) * 100}%` }}
                                  ></div>
                                </div>
                                <span>{Math.round((file.classificationConfidence || 0) * 100)}%</span>
                              </div>
                            </td>
                            <td className="text-end fw-bold">{file.recordCount || 0}</td>
                            <td className="text-center">
                              <span className="badge bg-success-subtle text-success">{file.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Batch History Table */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
          <h6 className="mb-0 fw-bold">
            <i className="bi bi-clock-history text-secondary me-2"></i>
            Migration Archive Batches History
          </h6>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={fetchBatches}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-1"></i> Refresh
          </button>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <LoadingState message="Loading migration batches..." />
          ) : batches.length === 0 ? (
            <EmptyState
              icon="bi-archive"
              title="No Migration Batches Yet"
              message="Upload your first ZIP archive above to begin staging legacy records."
            />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small">
                  <tr>
                    <th>Batch ID</th>
                    <th>Archive Name</th>
                    <th>Uploaded At</th>
                    <th>Files</th>
                    <th>Records Staged</th>
                    <th>Errors</th>
                    <th>Status</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((b) => (
                    <tr
                      key={b.batchId}
                      className={activeBatchDetails?.batch?.batchId === b.batchId ? 'table-active' : ''}
                    >
                      <td className="font-monospace fw-bold text-primary">{b.batchId}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-file-earmark-zip text-warning fs-5"></i>
                          <div>
                            <div className="fw-semibold">{b.originalFileName}</div>
                            <small className="text-muted">{(b.fileSize / 1024).toFixed(1)} KB</small>
                          </div>
                        </div>
                      </td>
                      <td className="small text-muted">{b.createdAt ? formatDate(b.createdAt) : 'Just now'}</td>
                      <td>
                        <span className="badge bg-light text-dark border">{b.fileCount || 0} files</span>
                      </td>
                      <td>
                        <span className="fw-bold text-success">{(b.recordCount || 0).toLocaleString()}</span>
                      </td>
                      <td>
                        {b.errorCount && b.errorCount > 0 ? (
                          <span className="badge bg-danger">{b.errorCount}</span>
                        ) : (
                          <span className="badge bg-success-subtle text-success">0</span>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => loadBatchDetails(b.batchId)}
                        >
                          <i className="bi bi-eye me-1"></i> Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
