'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import StatusBadge from '@/components/common/StatusBadge';
import EmptyState from '@/components/common/EmptyState';
import LoadingState from '@/components/common/LoadingState';
import { depositService } from '@/services/depositService';
import { memberService } from '@/services/memberService';
import { branchService } from '@/services/branchService';
import { DepositAccount, DepositProduct, DepositFormData } from '@/types/deposit';
import { Member } from '@/types/member';
import { Branch } from '@/types/branch';

export default function DepositsPage() {
  const [accounts, setAccounts] = useState<DepositAccount[]>([]);
  const [products, setProducts] = useState<DepositProduct[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');

  // Modal State: Open Account
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');
  const [formData, setFormData] = useState<DepositFormData>({
    memberId: '',
    productId: '',
    depositAmount: 10000,
    tenureMonths: 12,
    paymentMode: 'Cash',
    remarks: '',
  });

  // Modal State: Pay Installment (RD)
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);
  const [selectedAccForInstallment, setSelectedAccForInstallment] = useState<DepositAccount | null>(null);
  const [installmentAmount, setInstallmentAmount] = useState<number>(1000);
  const [installmentPaymentMode, setInstallmentPaymentMode] = useState<string>('Cash');
  const [installmentRemarks, setInstallmentRemarks] = useState<string>('');

  // Modal State: Close Account
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedAccForClose, setSelectedAccForClose] = useState<DepositAccount | null>(null);
  const [closureType, setClosureType] = useState<string>('NORMAL_MATURITY');
  const [closeRemarks, setCloseRemarks] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [accRes, prodRes, memRes, brRes] = await Promise.all([
      depositService.getDepositAccounts(),
      depositService.getDepositProducts(),
      memberService.getMembers({ page: 1, pageSize: 100 }),
      branchService.getBranches(),
    ]);

    if (accRes.success) setAccounts(accRes.data);
    if (prodRes.success) setProducts(prodRes.data);
    if (memRes.success) setMembers(memRes.data.data);
    if (brRes.success) setBranches(brRes.data);
    setLoading(false);
  }

  const handleOpenAccountModal = () => {
    const defaultMember = members[0]?.id || '';
    const defaultProduct = products[0]?.id || '';
    const prod = products.find((p) => p.id === defaultProduct);
    setFormData({
      memberId: defaultMember,
      productId: defaultProduct,
      depositAmount: prod?.minAmount || 10000,
      tenureMonths: prod?.minPeriodMonths || 12,
      paymentMode: 'Cash',
      remarks: 'Initial deposit',
    });
    setModalError('');
    setShowOpenModal(true);
  };

  const handleProductChange = (prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    setFormData((prev) => ({
      ...prev,
      productId: prodId,
      depositAmount: prod?.minAmount || prev.depositAmount,
      tenureMonths: prod?.minPeriodMonths || prev.tenureMonths,
    }));
  };

  const calculatePreviewMaturity = () => {
    const prod = products.find((p) => p.id === formData.productId);
    if (!prod) return 0;
    const P = Number(formData.depositAmount) || 0;
    const r = prod.interestRate / 100;
    const t = (Number(formData.tenureMonths) || 0) / 12;

    if (prod.depositType === 'FIXED_DEPOSIT') {
      const n = 4; // Quarterly compound
      const A = P * Math.pow(1 + r / n, n * t);
      return Math.round(A * 100) / 100;
    } else if (prod.depositType === 'RECURRING_DEPOSIT') {
      const n = Number(formData.tenureMonths) || 1;
      const totalP = P * n;
      const interest = P * (n * (n + 1) / (2 * 12)) * r;
      return Math.round((totalP + interest) * 100) / 100;
    }
    return P;
  };

  const handleSaveOpenAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.memberId || !formData.productId) {
      setModalError('Please select both a Member and a Deposit Product.');
      return;
    }
    if (formData.depositAmount <= 0) {
      setModalError('Deposit amount must be greater than zero.');
      return;
    }

    setSaving(true);
    setModalError('');
    const res = await depositService.openDepositAccount(formData);
    setSaving(false);

    if (res.success) {
      setShowOpenModal(false);
      loadData();
    } else {
      setModalError(res.message || 'Failed to open deposit account.');
    }
  };

  const handleOpenInstallmentModal = (acc: DepositAccount) => {
    setSelectedAccForInstallment(acc);
    setInstallmentAmount(acc.depositAmount || 1000);
    setInstallmentPaymentMode('Cash');
    setInstallmentRemarks('Monthly Installment');
    setShowInstallmentModal(true);
  };

  const handleSaveInstallment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccForInstallment) return;

    setSaving(true);
    const res = await depositService.depositInstallment(selectedAccForInstallment.id, {
      amount: Number(installmentAmount),
      paymentMode: installmentPaymentMode,
      remarks: installmentRemarks,
    });
    setSaving(false);

    if (res.success) {
      setShowInstallmentModal(false);
      loadData();
    } else {
      alert(res.message || 'Failed to record installment.');
    }
  };

  const handleOpenCloseModal = (acc: DepositAccount) => {
    setSelectedAccForClose(acc);
    setClosureType('NORMAL_MATURITY');
    setCloseRemarks('Account closed on maturity');
    setShowCloseModal(true);
  };

  const handleSaveClose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccForClose) return;

    setSaving(true);
    const res = await depositService.closeDepositAccount(selectedAccForClose.id, {
      closureType,
      paymentMode: 'Cash',
      remarks: closeRemarks,
    });
    setSaving(false);

    if (res.success) {
      setShowCloseModal(false);
      loadData();
    } else {
      alert(res.message || 'Failed to close account.');
    }
  };

  // Filter accounts
  const filteredAccounts = accounts.filter((acc) => {
    const s = search.toLowerCase();
    const matchesSearch =
      !search ||
      acc.accountNumber.toLowerCase().includes(s) ||
      acc.memberName.toLowerCase().includes(s) ||
      acc.memberNumber.toLowerCase().includes(s);
    const matchesType = !typeFilter || acc.depositType === typeFilter;
    const matchesStatus = !statusFilter || acc.status === statusFilter;
    const matchesBranch = !branchFilter || acc.branchId === branchFilter;
    return matchesSearch && matchesType && matchesStatus && matchesBranch;
  });

  const totalDepositBalance = accounts.reduce((sum, a) => sum + (a.currentBalance || 0), 0);
  const fdCount = accounts.filter((a) => a.depositType === 'FIXED_DEPOSIT').length;
  const rdCount = accounts.filter((a) => a.depositType === 'RECURRING_DEPOSIT').length;

  return (
    <div>
      <PageHeader
        title="Deposit Accounts (FD / RD / Daily)"
        description="Manage term deposits, recurring deposits, maturity tracking, and double-entry accounting ledger."
      >
        <button className="btn btn-primary btn-sm" onClick={handleOpenAccountModal}>
          <i className="bi bi-plus-circle me-1"></i> Open Deposit Account
        </button>
      </PageHeader>

      {/* Summary KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-md-3">
          <div className="stat-card">
            <span className="stat-card-label">TOTAL DEPOSIT ACCOUNTS</span>
            <div className="stat-card-value text-primary mt-1">{accounts.length}</div>
            <div className="small text-muted mt-1"><i className="bi bi-person-check me-1"></i> Active Portfolio</div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-md-3">
          <div className="stat-card">
            <span className="stat-card-label">TOTAL DEPOSIT BALANCE</span>
            <div className="stat-card-value text-success mt-1">₹{totalDepositBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <div className="small text-muted mt-1"><i className="bi bi-bank me-1"></i> Total Society Liability</div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-md-3">
          <div className="stat-card">
            <span className="stat-card-label">FIXED DEPOSITS (FD)</span>
            <div className="stat-card-value text-info mt-1">{fdCount} Accounts</div>
            <div className="small text-muted mt-1"><i className="bi bi-lock me-1"></i> Compounded Quarterly</div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-md-3">
          <div className="stat-card">
            <span className="stat-card-label">RECURRING DEPOSITS (RD)</span>
            <div className="stat-card-value text-warning mt-1">{rdCount} Accounts</div>
            <div className="small text-muted mt-1"><i className="bi bi-calendar-check me-1"></i> Monthly Installments</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card mb-4">
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-4">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search Acc No, Member Name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="col-6 col-md-3">
              <select
                className="form-select form-select-sm"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Deposit Types</option>
                <option value="FIXED_DEPOSIT">Fixed Deposit (FD)</option>
                <option value="RECURRING_DEPOSIT">Recurring Deposit (RD)</option>
                <option value="DAILY_PIGMY">Daily Pigmy Deposit</option>
                <option value="SAVINGS">Savings Account</option>
              </select>
            </div>

            <div className="col-6 col-md-2">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="MATURED">MATURED</option>
                <option value="CLOSED">CLOSED</option>
                <option value="PREMATURE_CLOSED">PREMATURE_CLOSED</option>
              </select>
            </div>

            <div className="col-6 col-md-2">
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

            {(search || typeFilter || statusFilter || branchFilter) && (
              <div className="col-auto ms-auto">
                <button
                  className="btn btn-link btn-sm text-decoration-none p-0 text-muted"
                  onClick={() => {
                    setSearch('');
                    setTypeFilter('');
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

      {/* Deposits Table */}
      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <LoadingState message="Loading deposit accounts..." />
          ) : filteredAccounts.length === 0 ? (
            <EmptyState
              icon="bi-piggy-bank"
              title="No deposit accounts found"
              message="No records match your criteria. Click 'Open Deposit Account' to create one."
            />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Account No</th>
                    <th>Member Details</th>
                    <th>Product & Type</th>
                    <th className="text-end">Principal / Monthly</th>
                    <th className="text-center">Tenure / Rate</th>
                    <th className="text-end">Maturity Amount</th>
                    <th className="text-end">Current Balance</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.map((acc) => (
                    <tr key={acc.id}>
                      <td>
                        <code>{acc.accountNumber}</code>
                        <div className="small text-muted">{acc.startDate}</div>
                      </td>
                      <td>
                        <div className="fw-semibold">{acc.memberName}</div>
                        <div className="small text-muted">{acc.memberNumber} • {acc.branchName}</div>
                      </td>
                      <td>
                        <span className="badge bg-light text-primary border me-1">
                          {acc.depositType === 'FIXED_DEPOSIT' ? 'FD' : acc.depositType === 'RECURRING_DEPOSIT' ? 'RD' : acc.depositType}
                        </span>
                        <span className="small fw-semibold">{acc.productName}</span>
                      </td>
                      <td className="text-end fw-semibold">
                        ₹{(acc.depositAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        {acc.depositType === 'RECURRING_DEPOSIT' && <small className="text-muted d-block">/ month</small>}
                      </td>
                      <td className="text-center">
                        <div className="fw-semibold">{acc.tenureMonths} Mos</div>
                        <div className="badge bg-success-subtle text-success border">{acc.interestRate}% p.a.</div>
                      </td>
                      <td className="text-end fw-bold text-primary">
                        ₹{(acc.maturityAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        <small className="text-muted d-block">Due: {acc.maturityDate}</small>
                      </td>
                      <td className="text-end fw-bold text-success">
                        ₹{(acc.currentBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td>
                        <StatusBadge status={acc.status} />
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          {acc.depositType === 'RECURRING_DEPOSIT' && acc.status === 'ACTIVE' && (
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => handleOpenInstallmentModal(acc)}
                              title="Pay Installment"
                            >
                              <i className="bi bi-wallet2 me-1"></i> Pay
                            </button>
                          )}
                          {acc.status === 'ACTIVE' && (
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => handleOpenCloseModal(acc)}
                              title="Close / Settle Account"
                            >
                              <i className="bi bi-x-circle me-1"></i> Close
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Open New Deposit Account */}
      {showOpenModal && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
          <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <form onSubmit={handleSaveOpenAccount}>
                  <div className="modal-header">
                    <h5 className="modal-title">Open New Deposit Account (FD / RD)</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowOpenModal(false)}
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
                      <div className="col-12 col-md-6">
                        <label className="form-label small fw-semibold">Select Member *</label>
                        <select
                          className="form-select form-select-sm"
                          value={formData.memberId}
                          onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                          required
                        >
                          <option value="">-- Choose Member --</option>
                          {members.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.memberNumber} — {m.firstName} {m.lastName} ({m.branchName})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="form-label small fw-semibold">Select Deposit Product *</label>
                        <select
                          className="form-select form-select-sm"
                          value={formData.productId}
                          onChange={(e) => handleProductChange(e.target.value)}
                          required
                        >
                          <option value="">-- Choose Product --</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.depositType}) — {p.interestRate}% p.a.
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="form-label small fw-semibold">
                          {products.find((p) => p.id === formData.productId)?.depositType === 'RECURRING_DEPOSIT'
                            ? 'Monthly Installment (₹) *'
                            : 'Principal Deposit Amount (₹) *'}
                        </label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={formData.depositAmount}
                          onChange={(e) => setFormData({ ...formData, depositAmount: Number(e.target.value) })}
                          min={500}
                          required
                        />
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="form-label small fw-semibold">Tenure (Months) *</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={formData.tenureMonths}
                          onChange={(e) => setFormData({ ...formData, tenureMonths: Number(e.target.value) })}
                          min={1}
                          max={120}
                          required
                        />
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="form-label small fw-semibold">Payment Mode</label>
                        <select
                          className="form-select form-select-sm"
                          value={formData.paymentMode}
                          onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                        >
                          <option value="Cash">Cash (COA 1000)</option>
                          <option value="Bank">Bank Transfer (COA 1100)</option>
                        </select>
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="form-label small fw-semibold">Remarks</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={formData.remarks}
                          onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                        />
                      </div>

                      {/* Maturity Calculation Preview Card */}
                      <div className="col-12">
                        <div className="p-3 bg-light rounded border">
                          <div className="row align-items-center">
                            <div className="col-md-6">
                              <div className="small text-muted">Estimated Maturity Payout:</div>
                              <div className="fs-4 fw-bold text-success">
                                ₹{calculatePreviewMaturity().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </div>
                            </div>
                            <div className="col-md-6 text-md-end">
                              <small className="text-muted d-block">
                                Central Double-Entry Rule:
                              </small>
                              <span className="badge bg-primary">
                                DR Cash/Bank &rarr; CR Deposit Liability
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setShowOpenModal(false)}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                      {saving ? 'Opening Account...' : 'Confirm & Open Deposit'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal: Deposit Installment (RD) */}
      {showInstallmentModal && selectedAccForInstallment && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
          <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <form onSubmit={handleSaveInstallment}>
                  <div className="modal-header">
                    <h5 className="modal-title">Pay RD Installment</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowInstallmentModal(false)}
                      disabled={saving}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3 p-2 bg-light rounded border">
                      <div className="fw-semibold">{selectedAccForInstallment.accountNumber}</div>
                      <div className="small text-muted">{selectedAccForInstallment.memberName} • Current Balance: ₹{selectedAccForInstallment.currentBalance.toLocaleString('en-IN')}</div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Installment Amount (₹) *</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={installmentAmount}
                        onChange={(e) => setInstallmentAmount(Number(e.target.value))}
                        min={100}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Payment Mode</label>
                      <select
                        className="form-select form-select-sm"
                        value={installmentPaymentMode}
                        onChange={(e) => setInstallmentPaymentMode(e.target.value)}
                      >
                        <option value="Cash">Cash</option>
                        <option value="Bank">Bank Transfer</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Remarks</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={installmentRemarks}
                        onChange={(e) => setInstallmentRemarks(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setShowInstallmentModal(false)}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-success btn-sm" disabled={saving}>
                      {saving ? 'Recording...' : 'Record Installment'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal: Close / Settle Account */}
      {showCloseModal && selectedAccForClose && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
          <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <form onSubmit={handleSaveClose}>
                  <div className="modal-header">
                    <h5 className="modal-title">Close / Settle Deposit Account</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowCloseModal(false)}
                      disabled={saving}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3 p-3 bg-light rounded border">
                      <div className="fw-semibold">{selectedAccForClose.accountNumber} ({selectedAccForClose.productName})</div>
                      <div className="small text-muted mb-2">Member: {selectedAccForClose.memberName}</div>
                      <div className="d-flex justify-content-between">
                        <span>Principal / Balance:</span>
                        <strong>₹{selectedAccForClose.currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Maturity Expected:</span>
                        <strong className="text-success">₹{selectedAccForClose.maturityAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Closure Type</label>
                      <select
                        className="form-select form-select-sm"
                        value={closureType}
                        onChange={(e) => setClosureType(e.target.value)}
                      >
                        <option value="NORMAL_MATURITY">Normal Maturity Payout</option>
                        <option value="PREMATURE_CLOSURE">Premature Liquidation</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Remarks</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={closeRemarks}
                        onChange={(e) => setCloseRemarks(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setShowCloseModal(false)}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-danger btn-sm" disabled={saving}>
                      {saving ? 'Closing...' : 'Confirm Closure & Payout'}
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
