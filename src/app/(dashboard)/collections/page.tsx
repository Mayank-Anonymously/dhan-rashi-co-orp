'use client';

import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/common/PageHeader';
import StatusBadge from '@/components/common/StatusBadge';
import EmptyState from '@/components/common/EmptyState';
import LoadingState from '@/components/common/LoadingState';
import { depositService } from '@/services/depositService';
import { memberService } from '@/services/memberService';
import { loanService } from '@/services/loanService';
import { DailyCollection, DepositAccount } from '@/types/deposit';
import { Member } from '@/types/member';
import { LoanAccount } from '@/types/loan';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<DailyCollection[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loans, setLoans] = useState<LoanAccount[]>([]);
  const [deposits, setDeposits] = useState<DepositAccount[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Modal: Record Collection
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  const [formMemberId, setFormMemberId] = useState('');
  const [formCollectionType, setFormCollectionType] = useState('LOAN_EMI');
  const [formReferenceAccountId, setFormReferenceAccountId] = useState('');
  const [formAmount, setFormAmount] = useState<number>(1000);
  const [formPaymentMode, setFormPaymentMode] = useState('Cash');
  const [formAgentName, setFormAgentName] = useState('Field Officer (Dwarka)');
  const [formRemarks, setFormRemarks] = useState('Daily field collection');

  // Modal: Receipt View
  const [selectedReceipt, setSelectedReceipt] = useState<DailyCollection | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [colRes, memRes, loanRes, depRes] = await Promise.all([
      depositService.getCollections(),
      memberService.getMembers({ page: 1, pageSize: 100 }),
      loanService.getLoanAccounts(),
      depositService.getDepositAccounts(),
    ]);

    if (colRes.success) setCollections(colRes.data);
    if (memRes.success) setMembers(memRes.data.data);
    if (loanRes.success) setLoans(loanRes.data);
    if (depRes.success) setDeposits(depRes.data);
    setLoading(false);
  }

  const handleOpenRecordModal = () => {
    const firstMem = members[0]?.id || '';
    setFormMemberId(firstMem);
    setFormCollectionType('LOAN_EMI');
    setFormAmount(1000);
    setFormPaymentMode('Cash');
    setFormAgentName('Field Officer (Dwarka)');
    setFormRemarks('Daily collection');
    setModalError('');
    setShowModal(true);
  };

  // Filter accounts belonging to selected member
  const memberLoans = loans.filter((l) => l.memberId === formMemberId && l.status === 'ACTIVE');
  const memberDeposits = deposits.filter((d) => d.memberId === formMemberId && d.status === 'ACTIVE');

  const handleSaveCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMemberId) {
      setModalError('Please select a member.');
      return;
    }
    if (formAmount <= 0) {
      setModalError('Amount must be greater than zero.');
      return;
    }

    setSaving(true);
    setModalError('');
    const res = await depositService.recordCollection({
      memberId: formMemberId,
      collectionType: formCollectionType,
      referenceAccountId: formReferenceAccountId,
      amount: Number(formAmount),
      paymentMode: formPaymentMode,
      agentName: formAgentName,
      remarks: formRemarks,
    });
    setSaving(false);

    if (res.success) {
      setShowModal(false);
      loadData();
      if (res.data) {
        setSelectedReceipt(res.data);
      }
    } else {
      setModalError(res.message || 'Failed to record collection.');
    }
  };

  const filteredCollections = collections.filter((c) => {
    const s = search.toLowerCase();
    const matchesSearch =
      !search ||
      c.receiptNumber.toLowerCase().includes(s) ||
      c.memberName.toLowerCase().includes(s) ||
      c.memberNumber.toLowerCase().includes(s);
    const matchesType = !typeFilter || c.collectionType === typeFilter;
    const matchesDate = !dateFilter || c.collectionDate.startsWith(dateFilter);
    return matchesSearch && matchesType && matchesDate;
  });

  const totalCollected = collections.reduce((sum, c) => sum + (c.amount || 0), 0);
  const loanEMICollected = collections
    .filter((c) => c.collectionType === 'LOAN_EMI')
    .reduce((sum, c) => sum + (c.amount || 0), 0);
  const rdPigmyCollected = collections
    .filter((c) => c.collectionType === 'RD_INSTALLMENT' || c.collectionType === 'DAILY_PIGMY')
    .reduce((sum, c) => sum + (c.amount || 0), 0);

  return (
    <div>
      <PageHeader
        title="Daily Collections & Field Receipts"
        description="Record real-time field collection receipts for loan EMIs, RD installments, and pigmy deposits."
      >
        <button className="btn btn-primary btn-sm" onClick={handleOpenRecordModal}>
          <i className="bi bi-plus-circle me-1"></i> Record New Collection
        </button>
      </PageHeader>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-md-3">
          <div className="stat-card">
            <span className="stat-card-label">TOTAL RECEIPTS</span>
            <div className="stat-card-value text-primary mt-1">{collections.length}</div>
            <div className="small text-muted mt-1"><i className="bi bi-receipt me-1"></i> Real-time System Receipts</div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-md-3">
          <div className="stat-card">
            <span className="stat-card-label">TOTAL REVENUE COLLECTED</span>
            <div className="stat-card-value text-success mt-1">₹{totalCollected.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <div className="small text-muted mt-1"><i className="bi bi-cash-stack me-1"></i> Double-entry Auto-posted</div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-md-3">
          <div className="stat-card">
            <span className="stat-card-label">LOAN EMI RECOVERIES</span>
            <div className="stat-card-value text-info mt-1">₹{loanEMICollected.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <div className="small text-muted mt-1"><i className="bi bi-bank me-1"></i> Principal + Interest split</div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-md-3">
          <div className="stat-card">
            <span className="stat-card-label">RD & PIGMY DEPOSITS</span>
            <div className="stat-card-value text-warning mt-1">₹{rdPigmyCollected.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <div className="small text-muted mt-1"><i className="bi bi-piggy-bank me-1"></i> Member Savings Inflows</div>
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
                  placeholder="Search Receipt No, Member..."
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
                <option value="">All Collection Types</option>
                <option value="LOAN_EMI">Loan EMI Recovery</option>
                <option value="RD_INSTALLMENT">RD Installment</option>
                <option value="DAILY_PIGMY">Daily Pigmy Deposit</option>
                <option value="SHARE_PURCHASE">Share Capital Purchase</option>
              </select>
            </div>

            <div className="col-6 col-md-3">
              <input
                type="date"
                className="form-control form-control-sm"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>

            {(search || typeFilter || dateFilter) && (
              <div className="col-auto ms-auto">
                <button
                  className="btn btn-link btn-sm text-decoration-none p-0 text-muted"
                  onClick={() => {
                    setSearch('');
                    setTypeFilter('');
                    setDateFilter('');
                  }}
                >
                  <i className="bi bi-x-circle me-1"></i> Clear
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Collections Table */}
      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <LoadingState message="Loading collection records..." />
          ) : filteredCollections.length === 0 ? (
            <EmptyState
              icon="bi-wallet2"
              title="No collections recorded yet"
              message="Click 'Record New Collection' to log a field receipt."
            />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Receipt No</th>
                    <th>Date & Time</th>
                    <th>Member Details</th>
                    <th>Collection Type</th>
                    <th>Reference Account</th>
                    <th className="text-end">Amount</th>
                    <th>Payment Mode</th>
                    <th>Agent / Performed By</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCollections.map((col) => (
                    <tr key={col.id}>
                      <td>
                        <code>{col.receiptNumber}</code>
                      </td>
                      <td>
                        <div className="small fw-semibold">{col.collectionDate}</div>
                      </td>
                      <td>
                        <div className="fw-semibold">{col.memberName}</div>
                        <div className="small text-muted">{col.memberNumber} • {col.branchName}</div>
                      </td>
                      <td>
                        <span className="badge bg-light text-primary border">
                          {col.collectionType}
                        </span>
                      </td>
                      <td>
                        <span className="small text-muted">{col.referenceAccountId || '—'}</span>
                      </td>
                      <td className="text-end fw-bold text-success">
                        ₹{(col.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td>
                        <span className="badge bg-secondary-subtle text-secondary border">
                          {col.paymentMode}
                        </span>
                      </td>
                      <td>
                        <div className="small">{col.agentName || 'System'}</div>
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-light border"
                          onClick={() => setSelectedReceipt(col)}
                        >
                          <i className="bi bi-receipt me-1"></i> View Receipt
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

      {/* Modal: Record New Collection */}
      {showModal && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
          <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <form onSubmit={handleSaveCollection}>
                  <div className="modal-header">
                    <h5 className="modal-title">Record Daily Field Collection</h5>
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
                      <div className="col-12 col-md-6">
                        <label className="form-label small fw-semibold">Select Member *</label>
                        <select
                          className="form-select form-select-sm"
                          value={formMemberId}
                          onChange={(e) => setFormMemberId(e.target.value)}
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
                        <label className="form-label small fw-semibold">Collection Type *</label>
                        <select
                          className="form-select form-select-sm"
                          value={formCollectionType}
                          onChange={(e) => setFormCollectionType(e.target.value)}
                        >
                          <option value="LOAN_EMI">Loan EMI Repayment</option>
                          <option value="RD_INSTALLMENT">RD Monthly Installment</option>
                          <option value="DAILY_PIGMY">Daily Pigmy Deposit</option>
                          <option value="SAVINGS_DEPOSIT">Savings Deposit</option>
                          <option value="SHARE_PURCHASE">Share Capital Purchase</option>
                        </select>
                      </div>

                      {/* Linked Account Selector */}
                      <div className="col-12 col-md-6">
                        <label className="form-label small fw-semibold">Target Account</label>
                        <select
                          className="form-select form-select-sm"
                          value={formReferenceAccountId}
                          onChange={(e) => setFormReferenceAccountId(e.target.value)}
                        >
                          <option value="">-- Select Linked Account (Optional) --</option>
                          {formCollectionType === 'LOAN_EMI' &&
                            memberLoans.map((l) => (
                              <option key={l.id} value={l.id}>
                                {l.loanNumber} — {l.productName} (Outstanding: ₹{l.outstandingPrincipal?.toLocaleString()})
                              </option>
                            ))}
                          {formCollectionType.includes('RD') &&
                            memberDeposits.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.accountNumber} — {d.productName} (Balance: ₹{d.currentBalance?.toLocaleString()})
                              </option>
                            ))}
                        </select>
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="form-label small fw-semibold">Collection Amount (₹) *</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={formAmount}
                          onChange={(e) => setFormAmount(Number(e.target.value))}
                          min={1}
                          required
                        />
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="form-label small fw-semibold">Payment Mode</label>
                        <select
                          className="form-select form-select-sm"
                          value={formPaymentMode}
                          onChange={(e) => setFormPaymentMode(e.target.value)}
                        >
                          <option value="Cash">Cash (COA 1000)</option>
                          <option value="Bank">Bank Transfer / UPI (COA 1100)</option>
                        </select>
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="form-label small fw-semibold">Agent / Collector Name</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={formAgentName}
                          onChange={(e) => setFormAgentName(e.target.value)}
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label small fw-semibold">Remarks</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={formRemarks}
                          onChange={(e) => setFormRemarks(e.target.value)}
                        />
                      </div>

                      {/* Info box */}
                      <div className="col-12">
                        <div className="p-3 bg-light rounded border small">
                          <i className="bi bi-info-circle text-primary me-2"></i>
                          Submitting this receipt immediately credits society cash/bank, adjusts loan schedule or deposit ledger, and logs double-entry transaction in General Ledger in realtime.
                        </div>
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
                      {saving ? 'Processing...' : 'Submit & Generate Receipt'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal: View Receipt */}
      {selectedReceipt && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
          <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title fs-6">
                    <i className="bi bi-receipt me-2"></i> Official Collection Receipt
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setSelectedReceipt(null)}
                  ></button>
                </div>
                <div className="modal-body p-4">
                  <div className="text-center pb-3 border-bottom mb-3">
                    <h6 className="fw-bold mb-0">DHAN RASHI CO-OPERATIVE SOCIETY LTD.</h6>
                    <small className="text-muted">Reg No: MSCS/CR/1042/2021 | Head Office, New Delhi</small>
                  </div>

                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">Receipt No:</span>
                    <span className="fw-bold"><code>{selectedReceipt.receiptNumber}</code></span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">Date & Time:</span>
                    <span>{selectedReceipt.collectionDate}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">Member Name:</span>
                    <span className="fw-semibold">{selectedReceipt.memberName}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">Member No:</span>
                    <span>{selectedReceipt.memberNumber}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">Branch:</span>
                    <span>{selectedReceipt.branchName}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">Type:</span>
                    <span className="badge bg-light text-dark border">{selectedReceipt.collectionType}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">Payment Mode:</span>
                    <span>{selectedReceipt.paymentMode}</span>
                  </div>

                  <div className="p-3 bg-success-subtle rounded border border-success mt-3 text-center">
                    <small className="text-success-emphasis d-block fw-semibold">AMOUNT RECEIVED</small>
                    <span className="fs-3 fw-bold text-success">
                      ₹{(selectedReceipt.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="mt-3 text-center small text-muted">
                    Collected by: {selectedReceipt.agentName || 'Field Agent'}
                    <div className="mt-1">Computer Generated Receipt — No Signature Required</div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedReceipt(null)}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => window.print()}
                  >
                    <i className="bi bi-printer me-1"></i> Print Receipt
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
