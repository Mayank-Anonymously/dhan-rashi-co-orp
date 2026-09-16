'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import StatusBadge from '@/components/common/StatusBadge';
import EmptyState from '@/components/common/EmptyState';
import LoadingState from '@/components/common/LoadingState';
import ConfirmModal from '@/components/common/ConfirmModal';
import { memberService } from '@/services/memberService';
import { branchService } from '@/services/branchService';
import { Member } from '@/types/member';
import { Branch } from '@/types/branch';
import { formatDate, getMemberFullName } from '@/utils/helpers';

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Active' | 'Inactive' | ''>('');
  const [branchFilter, setBranchFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Action feedback
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Status toggle confirmation
  const [confirmTarget, setConfirmTarget] = useState<Member | null>(null);
  const [toggling, setToggling] = useState(false);

  const loadMembersData = React.useCallback(async () => {
    setLoading(true);
    const res = await memberService.getMembers({
      search,
      status: statusFilter,
      branchId: branchFilter,
      page,
      pageSize,
    });
    if (res.success) {
      setMembers(res.data.data);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    }
    setLoading(false);
  }, [search, statusFilter, branchFilter, page, pageSize]);

  useEffect(() => {
    let isMounted = true;
    async function fetchBranches() {
      const res = await branchService.getBranches();
      if (isMounted && res.success) {
        setBranches(res.data);
      }
    }
    fetchBranches();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function runFetch() {
      if (isMounted) {
        await loadMembersData();
      }
    }
    runFetch();
    return () => {
      isMounted = false;
    };
  }, [loadMembersData]);

  const handleExport = () => {
    setToastMsg('Member data export initiated. Simulated download of CSV file.');
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleToggleStatus = async () => {
    if (!confirmTarget) return;
    setToggling(true);
    await memberService.toggleStatus(confirmTarget.id);
    setToggling(false);
    setConfirmTarget(null);
    await loadMembersData();
  };

  return (
    <div>
      <PageHeader
        title="Members"
        description="Manage society members and their basic information."
      >
        <button className="btn btn-outline-secondary btn-sm" onClick={handleExport}>
          <i className="bi bi-download me-1"></i> Export Data
        </button>
        <Link href="/members/new" className="btn btn-primary btn-sm">
          <i className="bi bi-person-plus me-1"></i> Add Member
        </Link>
      </PageHeader>

      {toastMsg && (
        <div className="alert alert-info alert-dismissible fade show" role="alert">
          <i className="bi bi-info-circle me-2"></i> {toastMsg}
          <button type="button" className="btn-close" onClick={() => setToastMsg(null)}></button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="card mb-4">
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-5 col-lg-4">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by Member No, Name or Mobile..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as 'Active' | 'Inactive' | '');
                  setPage(1);
                }}
              >
                <option value="">All Statuses</option>
                <option value="Active">Active Only</option>
                <option value="Inactive">Inactive Only</option>
              </select>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <select
                className="form-select form-select-sm"
                value={branchFilter}
                onChange={(e) => {
                  setBranchFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {(search || statusFilter || branchFilter) && (
              <div className="col-auto ms-auto">
                <button
                  className="btn btn-link btn-sm text-decoration-none p-0 text-muted"
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('');
                    setBranchFilter('');
                    setPage(1);
                  }}
                >
                  <i className="bi bi-x-circle me-1"></i> Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Member Table */}
      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <LoadingState message="Loading members directory..." />
          ) : members.length === 0 ? (
            <EmptyState
              icon="bi-person-vcard"
              title="No members found"
              message="No records match your search criteria."
            >
              <Link href="/members/new" className="btn btn-primary btn-sm mt-2">
                Register New Member
              </Link>
            </EmptyState>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Member Number</th>
                      <th>Member Name</th>
                      <th>Father / Husband</th>
                      <th>Mobile</th>
                      <th>Email</th>
                      <th>Branch</th>
                      <th>Member Since</th>
                      <th>Status</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m) => (
                      <tr key={m.id}>
                        <td>
                          <code className="fw-bold">{m.memberNumber}</code>
                        </td>
                        <td>
                          <Link
                            href={`/members/${m.id}`}
                            className="fw-semibold text-primary text-decoration-none"
                          >
                            {getMemberFullName(m.firstName, m.middleName, m.lastName)}
                          </Link>
                        </td>
                        <td>{m.fatherHusbandName || '—'}</td>
                        <td>{m.mobile}</td>
                        <td>
                          {m.email ? (
                            <small className="text-muted">{m.email}</small>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td>{m.branchName}</td>
                        <td>{formatDate(m.joiningDate)}</td>
                        <td><StatusBadge status={m.status} /></td>
                        <td className="text-end">
                          <div className="btn-group btn-group-sm">
                            <Link
                              href={`/members/${m.id}`}
                              className="btn btn-light border"
                              title="View Profile"
                            >
                              <i className="bi bi-eye text-secondary"></i>
                            </Link>
                            <button
                              className={`btn btn-light border ${m.status === 'Active' ? 'text-danger' : 'text-success'}`}
                              title={m.status === 'Active' ? 'Deactivate Member' : 'Activate Member'}
                              onClick={() => setConfirmTarget(m)}
                            >
                              <i className={`bi ${m.status === 'Active' ? 'bi-slash-circle' : 'bi-check-circle'}`}></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              <div className="d-flex flex-wrap align-items-center justify-content-between p-3 border-top gap-2">
                <div className="small text-muted">
                  Showing {(page - 1) * pageSize + 1} to Math.min({page * pageSize}, {total}) of {total} members
                </div>

                {totalPages > 1 && (
                  <nav>
                    <ul className="pagination pagination-sm mb-0">
                      <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setPage(page - 1)}>
                          Previous
                        </button>
                      </li>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <li key={p} className={`page-item ${page === p ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => setPage(p)}>
                            {p}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setPage(page + 1)}>
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!confirmTarget}
        title={`${confirmTarget?.status === 'Active' ? 'Deactivate' : 'Activate'} Member`}
        message={`Are you sure you want to ${confirmTarget?.status === 'Active' ? 'deactivate' : 'activate'} ${confirmTarget?.firstName} ${confirmTarget?.lastName}?`}
        confirmText={confirmTarget?.status === 'Active' ? 'Deactivate' : 'Activate'}
        variant={confirmTarget?.status === 'Active' ? 'danger' : 'primary'}
        onConfirm={handleToggleStatus}
        onCancel={() => setConfirmTarget(null)}
        isLoading={toggling}
      />
    </div>
  );
}
