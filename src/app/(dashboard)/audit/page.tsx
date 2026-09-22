'use client';

import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/common/PageHeader';
import LoadingState from '@/components/common/LoadingState';
import EmptyState from '@/components/common/EmptyState';
import { auditService } from '@/services/auditService';
import { AuditLogItem } from '@/types/audit';
import { formatDate } from '@/utils/helpers';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    setLoading(true);
    const res = await auditService.getAuditLogs();
    if (res.success) setLogs(res.data);
    setLoading(false);
  }

  const filteredLogs = logs.filter((l) => {
    const s = search.toLowerCase();
    const matchesSearch =
      !search ||
      l.description.toLowerCase().includes(s) ||
      l.userName.toLowerCase().includes(s) ||
      l.recordId.toLowerCase().includes(s);
    const matchesModule = !moduleFilter || l.module === moduleFilter;
    return matchesSearch && matchesModule;
  });

  return (
    <div>
      <PageHeader
        title="System Audit Log Trail"
        description="Immutable administrative and financial action log tracking system activity, modifications, and user access."
      />

      {/* Filter Toolbar */}
      <div className="card mb-4">
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-5">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search User, Record ID or Action Description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <select
                className="form-select form-select-sm"
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
              >
                <option value="">All System Modules</option>
                <option value="ACCOUNTING">ACCOUNTING</option>
                <option value="SHARES">SHARES</option>
                <option value="LOANS">LOANS</option>
                <option value="MEMBERS">MEMBERS</option>
                <option value="USERS">USERS</option>
              </select>
            </div>

            {(search || moduleFilter) && (
              <div className="col-auto ms-auto">
                <button className="btn btn-link btn-sm text-decoration-none p-0 text-muted" onClick={() => { setSearch(''); setModuleFilter(''); }}>
                  <i className="bi bi-x-circle me-1"></i> Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="card">
        <div className="card-header bg-white py-3">
          <h6 className="card-title mb-0 fw-bold text-dark">
            <i className="bi bi-clock-history me-2 text-primary"></i> System Audit Entries ({filteredLogs.length})
          </h6>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <LoadingState message="Loading system audit logs..." />
          ) : filteredLogs.length === 0 ? (
            <EmptyState icon="bi-clock" title="No audit logs found" message="No records match your search criteria." />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Timestamp</th>
                    <th>User & Role</th>
                    <th>Branch</th>
                    <th>Module</th>
                    <th>Action</th>
                    <th>Record Ref</th>
                    <th>Action Description</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log.id || log._id}>
                      <td><small className="text-muted">{formatDate(log.createdAt)}</small></td>
                      <td>
                        <div className="fw-semibold">{log.userName}</div>
                        <small className="text-muted">{log.role}</small>
                      </td>
                      <td><small className="text-muted">{log.branchId}</small></td>
                      <td><span className="badge bg-light text-dark border">{log.module}</span></td>
                      <td><span className="badge bg-primary-subtle text-primary border border-primary-subtle">{log.action}</span></td>
                      <td><code>{log.recordId || '—'}</code></td>
                      <td className="fw-medium">{log.description}</td>
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
