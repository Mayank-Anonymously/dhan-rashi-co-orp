'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import StatusBadge from '@/components/common/StatusBadge';
import EmptyState from '@/components/common/EmptyState';
import LoadingState from '@/components/common/LoadingState';
import { shareService } from '@/services/shareService';
import { branchService } from '@/services/branchService';
import { memberService } from '@/services/memberService';
import { ShareAccount } from '@/types/share';
import { Branch } from '@/types/branch';
import { Member } from '@/types/member';

export default function SharesPage() {
  const [accounts, setAccounts] = useState<ShareAccount[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State for Issue / Allot Shares
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [sharesInput, setSharesInput] = useState(10);
  const [faceValueInput] = useState(100);
  const [refInput, setRefInput] = useState('');
  const [remarksInput, setRemarksInput] = useState('');
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [accRes, branchRes, memRes] = await Promise.all([
      shareService.getShareAccounts(),
      branchService.getBranches(),
      memberService.getMembers({ page: 1, pageSize: 50 }),
    ]);
    if (accRes.success) setAccounts(accRes.data);
    if (branchRes.success) setBranches(branchRes.data);
    if (memRes.success) setMembers(memRes.data.data);
    setLoading(false);
  }

  const handleOpenModal = () => {
    setSelectedMemberId(members[0]?.id || '');
    setSharesInput(10);
    setRefInput(`REF-ORD-${Math.floor(100 + Math.random() * 900)}`);
    setRemarksInput('Share allotment');
    setModalError('');
    setShowModal(true);
  };

  const handleSaveIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) {
      setModalError('Please select a member.');
      return;
    }
    if (sharesInput <= 0) {
      setModalError('Shares count must be greater than zero.');
      return;
    }

    setSaving(true);
    setModalError('');
    const res = await shareService.createShareAccount({
      memberId: selectedMemberId,
      shares: Number(sharesInput),
      faceValue: Number(faceValueInput),
      referenceNumber: refInput,
      remarks: remarksInput,
    });
    setSaving(false);

    if (res.success) {
      setShowModal(false);
      loadData();
    } else {
      setModalError(res.message || 'Failed to issue shares.');
    }
  };

  const filteredAccounts = accounts.filter((acc) => {
    const s = search.toLowerCase();
    const matchesSearch = !search || acc.accountNumber.toLowerCase().includes(s) || acc.memberName.toLowerCase().includes(s);
    const matchesBranch = !branchFilter || acc.branchId === branchFilter;
    const matchesStatus = !statusFilter || acc.status === statusFilter;
    return matchesSearch && matchesBranch && matchesStatus;
  });

  const totalHoldingValue = accounts.reduce((acc, a) => acc + a.totalValue, 0);
  const totalSharesIssued = accounts.reduce((acc, a) => acc + a.totalShares, 0);

  return (
    <div>
      <PageHeader
        title="Share Accounts Directory"
        description="Manage member share capital holdings, allotments, and share account registers."
      >
        <button className="btn btn-primary btn-sm" onClick={handleOpenModal}>
          <i className="bi bi-plus-circle me-1"></i> Issue / Allot Shares
        </button>
      </PageHeader>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-md-4">
          <div className="stat-card">
            <span className="stat-card-label">TOTAL SHARE ACCOUNTS</span>
            <div className="stat-card-value text-primary mt-1">{accounts.length}</div>
            <div className="small text-muted mt-1"><i className="bi bi-person-check me-1"></i> Member Share Capital Accounts</div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-md-4">
          <div className="stat-card">
            <span className="stat-card-label">TOTAL SHARES ISSUED</span>
            <div className="stat-card-value text-success mt-1">{totalSharesIssued.toLocaleString()}</div>
            <div className="small text-muted mt-1"><i className="bi bi-pie-chart me-1"></i> Ordinary Shares @ ₹100 Face Value</div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-md-4">
          <div className="stat-card">
            <span className="stat-card-label">TOTAL SHARE CAPITAL VALUE</span>
            <div className="stat-card-value text-dark mt-1">₹{totalHoldingValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <div className="small text-muted mt-1"><i className="bi bi-bank me-1"></i> Backend Calculated Paid-Up Capital</div>
          </div>
        </div>
      </div>

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
                  placeholder="Search by Share Acc No or Member Name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
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

            <div className="col-12 col-sm-6 col-md-3">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Active">Active Only</option>
                <option value="Inactive">Inactive Only</option>
              </select>
            </div>

            {(search || branchFilter || statusFilter) && (
              <div className="col-auto ms-auto">
                <button
                  className="btn btn-link btn-sm text-decoration-none p-0 text-muted"
                  onClick={() => {
                    setSearch('');
                    setBranchFilter('');
                    setStatusFilter('');
                  }}
                >
                  <i className="bi bi-x-circle me-1"></i> Clear
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Table */}
      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <LoadingState message="Loading share accounts..." />
          ) : filteredAccounts.length === 0 ? (
            <EmptyState
              icon="bi-pie-chart"
              title="No share accounts found"
              message="No records match your search criteria."
            />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Share Account No</th>
                    <th>Member Name</th>
                    <th>Branch</th>
                    <th className="text-center">No. of Shares</th>
                    <th className="text-end">Face Value</th>
                    <th className="text-end">Total Share Value</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.map((acc) => (
                    <tr key={acc.id}>
                      <td><code>{acc.accountNumber}</code></td>
                      <td className="fw-semibold">{acc.memberName}</td>
                      <td>{acc.branchName}</td>
                      <td className="text-center">
                        <span className="badge bg-light text-dark border px-2 py-1 fs-6">
                          {acc.totalShares}
                        </span>
                      </td>
                      <td className="text-end">₹{acc.faceValue.toFixed(2)}</td>
                      <td className="text-end fw-bold">₹{acc.totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td><StatusBadge status={acc.status} /></td>
                      <td className="text-end">
                        <Link href={`/shares/${acc.id}`} className="btn btn-sm btn-light border">
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Allot Shares Modal */}
      {showModal && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
          <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <form onSubmit={handleSaveIssue}>
                  <div className="modal-header">
                    <h5 className="modal-title">Issue / Allot Shares</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowModal(false)}
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
                          value={selectedMemberId}
                          onChange={(e) => setSelectedMemberId(e.target.value)}
                          required
                        >
                          {members.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.memberNumber} — {m.firstName} {m.lastName} ({m.branchName})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-6">
                        <label className="form-label small fw-semibold">Number of Shares *</label>
                        <input
                          type="number"
                          min={1}
                          max={1000}
                          className="form-control form-control-sm"
                          value={sharesInput}
                          onChange={(e) => setSharesInput(Number(e.target.value))}
                          required
                        />
                      </div>

                      <div className="col-6">
                        <label className="form-label small fw-semibold">Face Value (₹)</label>
                        <input
                          type="number"
                          className="form-control form-control-sm bg-light"
                          value={faceValueInput}
                          disabled
                        />
                      </div>

                      <div className="col-12">
                        <div className="p-2 bg-light rounded border text-end">
                          <small className="text-muted d-block">Calculated Total Share Value:</small>
                          <span className="fs-5 fw-bold text-primary">
                            ₹{(sharesInput * faceValueInput).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      <div className="col-6">
                        <label className="form-label small fw-semibold">Reference Number</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={refInput}
                          onChange={(e) => setRefInput(e.target.value)}
                        />
                      </div>

                      <div className="col-6">
                        <label className="form-label small fw-semibold">Remarks</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={remarksInput}
                          onChange={(e) => setRemarksInput(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setShowModal(false)}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                      {saving ? 'Processing...' : 'Confirm Allotment'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
