'use client';

import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/common/PageHeader';
import StatusBadge from '@/components/common/StatusBadge';
import EmptyState from '@/components/common/EmptyState';
import LoadingState from '@/components/common/LoadingState';
import ConfirmModal from '@/components/common/ConfirmModal';
import { loanService } from '@/services/loanService';
import { memberService } from '@/services/memberService';
import { branchService } from '@/services/branchService';
import { LoanApplication, LoanProduct } from '@/types/loan';
import { Member } from '@/types/member';
import { Branch } from '@/types/branch';
import { formatDate } from '@/utils/helpers';

export default function LoanApplicationsPage() {
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [products, setProducts] = useState<LoanProduct[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');

  // New Application Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');
  const [formData, setFormData] = useState({
    memberId: '',
    productId: '',
    requestedAmount: 50000,
    requestedPeriod: 12,
    purpose: 'Personal Loan requirement',
  });

  // Approval Confirm Modal State
  const [approveTarget, setApproveTarget] = useState<LoanApplication | null>(null);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [appRes, prodRes, memRes, branchRes] = await Promise.all([
      loanService.getLoanApplications(),
      loanService.getLoanProducts(),
      memberService.getMembers({ page: 1, pageSize: 50 }),
      branchService.getBranches(),
    ]);
    if (appRes.success) setApplications(appRes.data);
    if (prodRes.success) setProducts(prodRes.data);
    if (memRes.success) setMembers(memRes.data.data);
    if (branchRes.success) setBranches(branchRes.data);
    setLoading(false);
  }

  const handleOpenAddModal = () => {
    setFormData({
      memberId: members[0]?.id || '',
      productId: products[0]?.id || '',
      requestedAmount: 50000,
      requestedPeriod: 12,
      purpose: 'Personal Requirement',
    });
    setModalError('');
    setShowAddModal(true);
  };

  const handleSaveApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setModalError('');

    const res = await loanService.createLoanApplication(formData);
    setSaving(false);

    if (res.success) {
      setShowAddModal(false);
      loadData();
    } else {
      setModalError(res.message || 'Failed to submit loan application.');
    }
  };

  const handleApproveApplication = async () => {
    if (!approveTarget) return;
    setApproving(true);
    await loanService.approveLoanApplication(approveTarget.id, 'Application approved by Credit Committee');
    setApproving(false);
    setApproveTarget(null);
    loadData();
  };

  const filteredApps = applications.filter((app) => {
    const s = search.toLowerCase();
    const matchesSearch =
      !search ||
      app.applicationNumber.toLowerCase().includes(s) ||
      app.memberName.toLowerCase().includes(s) ||
      app.memberNumber.toLowerCase().includes(s);
    const matchesStatus = !statusFilter || app.status === statusFilter;
    const matchesBranch = !branchFilter || app.branchId === branchFilter;
    return matchesSearch && matchesStatus && matchesBranch;
  });

  return (
    <div>
      <PageHeader
        title="Loan Applications & Approvals Workflow"
        description="Review member loan requests, manage approval lifecycle, and auto-disburse approved loan accounts."
      >
        <button className="btn btn-primary btn-sm" onClick={handleOpenAddModal}>
          <i className="bi bi-file-earmark-plus me-1"></i> New Loan Application
        </button>
      </PageHeader>

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
                  placeholder="Search App No, Member Name or No..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Application Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <select
                className="form-select form-select-sm"
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
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
                  }}
                >
                  <i className="bi bi-x-circle me-1"></i> Clear
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <LoadingState message="Loading loan applications..." />
          ) : filteredApps.length === 0 ? (
            <EmptyState
              icon="bi-file-earmark-text"
              title="No loan applications found"
              message="No records match your criteria."
            />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>App Number</th>
                    <th>Member Details</th>
                    <th>Product</th>
                    <th>Requested Amount</th>
                    <th>Period</th>
                    <th>App Date</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApps.map((app) => (
                    <tr key={app.id}>
                      <td><code>{app.applicationNumber}</code></td>
                      <td>
                        <div className="fw-semibold">{app.memberName}</div>
                        <small className="text-muted">{app.memberNumber} • {app.branchName}</small>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {app.productName}
                        </span>
                      </td>
                      <td className="fw-bold">₹{app.requestedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td>{app.requestedPeriod} Months</td>
                      <td>{formatDate(app.applicationDate)}</td>
                      <td><StatusBadge status={app.status} /></td>
                      <td className="text-end">
                        {app.status === 'SUBMITTED' ? (
                          <button
                            className="btn btn-sm btn-success px-3"
                            onClick={() => setApproveTarget(app)}
                          >
                            <i className="bi bi-check-circle me-1"></i> Approve Loan
                          </button>
                        ) : (
                          <span className="badge bg-light text-muted border">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Loan Application Modal */}
      {showAddModal && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
          <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <form onSubmit={handleSaveApplication}>
                  <div className="modal-header">
                    <h5 className="modal-title">New Loan Application</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowAddModal(false)}
                      disabled={saving}
                    ></button>
                  </div>
                  <div className="modal-body">
                    {modalError && (
                      <div className="alert alert-danger py-2 px-3 mb-3 small" role="alert">
                        {modalError}
                      </div>
                    )}

                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label small fw-semibold">Select Member *</label>
                        <select
                          className="form-select form-select-sm"
                          value={formData.memberId}
                          onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                          required
                        >
                          {members.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.memberNumber} — {m.firstName} {m.lastName} ({m.branchName})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-12">
                        <label className="form-label small fw-semibold">Select Loan Product *</label>
                        <select
                          className="form-select form-select-sm"
                          value={formData.productId}
                          onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                          required
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.code}) — {p.baseInterestRate}% p.a.
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-6">
                        <label className="form-label small fw-semibold">Requested Amount (₹) *</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={formData.requestedAmount}
                          onChange={(e) => setFormData({ ...formData, requestedAmount: Number(e.target.value) })}
                          required
                        />
                      </div>

                      <div className="col-6">
                        <label className="form-label small fw-semibold">Requested Period (Months) *</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={formData.requestedPeriod}
                          onChange={(e) => setFormData({ ...formData, requestedPeriod: Number(e.target.value) })}
                          required
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label small fw-semibold">Loan Purpose *</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="e.g. Small Business Expansion"
                          value={formData.purpose}
                          onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setShowAddModal(false)}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                      {saving ? 'Submitting...' : 'Submit Loan Application'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Confirmation Modal for Application Approval */}
      <ConfirmModal
        isOpen={!!approveTarget}
        title="Approve Loan Application"
        message={`Are you sure you want to approve application ${approveTarget?.applicationNumber} for ₹${approveTarget?.requestedAmount.toLocaleString()}? An active Loan Account and Repayment Schedule will be automatically created.`}
        confirmText="Approve & Disburse Loan"
        variant="success"
        onConfirm={handleApproveApplication}
        onCancel={() => setApproveTarget(null)}
        isLoading={approving}
      />
    </div>
  );
}
