'use client';

import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/common/PageHeader';
import LoadingState from '@/components/common/LoadingState';
import EmptyState from '@/components/common/EmptyState';
import { accountingService } from '@/services/accountingService';
import { LedgerEntry, ChartOfAccount } from '@/types/accounting';
import { formatDate } from '@/utils/helpers';

export default function GeneralLedgerPage() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Journal Modal State
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [posting, setPosting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [journalForm, setJournalForm] = useState({
    description: 'Manual Journal Voucher',
    drAccountId: '',
    crAccountId: '',
    amount: 1000,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [ledgerRes, coaRes] = await Promise.all([
      accountingService.getGeneralLedger(),
      accountingService.getChartOfAccounts(),
    ]);
    if (ledgerRes.success) setEntries(ledgerRes.data);
    if (coaRes.success) {
      setAccounts(coaRes.data);
      if (coaRes.data.length >= 2) {
        setJournalForm((prev) => ({
          ...prev,
          drAccountId: coaRes.data[0].id,
          crAccountId: coaRes.data[1].id,
        }));
      }
    }
    setLoading(false);
  }

  const handlePostJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosting(true);
    setModalError('');

    const drAcc = accounts.find((a) => a.id === journalForm.drAccountId);
    const crAcc = accounts.find((a) => a.id === journalForm.crAccountId);

    if (!drAcc || !crAcc) {
      setModalError('Please select valid Debit and Credit accounts.');
      setPosting(false);
      return;
    }

    if (drAcc.id === crAcc.id) {
      setModalError('Debit account and Credit account cannot be the same.');
      setPosting(false);
      return;
    }

    const payload = {
      description: journalForm.description,
      entries: [
        {
          accountId: drAcc.id,
          accountCode: drAcc.code,
          accountName: drAcc.name,
          debit: Number(journalForm.amount),
          credit: 0,
          description: journalForm.description,
        },
        {
          accountId: crAcc.id,
          accountCode: crAcc.code,
          accountName: crAcc.name,
          debit: 0,
          credit: Number(journalForm.amount),
          description: journalForm.description,
        },
      ],
    };

    const res = await accountingService.postJournalTransaction(payload);
    setPosting(false);

    if (res.success) {
      setShowJournalModal(false);
      loadData();
    } else {
      setModalError(res.message || 'Failed to post journal voucher.');
    }
  };

  const filteredEntries = entries.filter((e) => {
    const s = search.toLowerCase();
    const matchesSearch =
      !search ||
      e.transactionNumber.toLowerCase().includes(s) ||
      e.accountName.toLowerCase().includes(s) ||
      e.description.toLowerCase().includes(s);
    const matchesAccount = !selectedAccountId || e.accountId === selectedAccountId;
    return matchesSearch && matchesAccount;
  });

  const totalDebit = filteredEntries.reduce((acc, e) => acc + e.debit, 0);
  const totalCredit = filteredEntries.reduce((acc, e) => acc + e.credit, 0);

  return (
    <div>
      <PageHeader
        title="General Ledger"
        description="Comprehensive audit trail of double-entry accounting transactions posted to society accounts."
      >
        <button className="btn btn-primary btn-sm" onClick={() => setShowJournalModal(true)}>
          <i className="bi bi-pencil-square me-1"></i> Post Journal Voucher
        </button>
      </PageHeader>

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
                  placeholder="Search Txn No, Account or Description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="col-12 col-sm-6 col-md-4">
              <select
                className="form-select form-select-sm"
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
              >
                <option value="">All Ledger Accounts</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.code} — {a.name}
                  </option>
                ))}
              </select>
            </div>

            {(search || selectedAccountId) && (
              <div className="col-auto ms-auto">
                <button
                  className="btn btn-link btn-sm text-decoration-none p-0 text-muted"
                  onClick={() => {
                    setSearch('');
                    setSelectedAccountId('');
                  }}
                >
                  <i className="bi bi-x-circle me-1"></i> Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="card">
        <div className="card-header bg-white py-3 d-flex align-items-center justify-content-between">
          <h6 className="card-title mb-0 fw-bold text-dark">
            <i className="bi bi-journal-text me-2 text-primary"></i> Ledger Journal Postings ({filteredEntries.length})
          </h6>
          <div className="small fw-semibold text-muted">
            Filtered Total Debit: <span className="text-primary fw-bold">₹{totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span> | Credit: <span className="text-success fw-bold">₹{totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <LoadingState message="Loading general ledger entries..." />
          ) : filteredEntries.length === 0 ? (
            <EmptyState icon="bi-journal-x" title="No ledger entries found" message="No transaction records match your query criteria." />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Txn Reference</th>
                    <th>Account</th>
                    <th>Module</th>
                    <th>Description</th>
                    <th className="text-end">Debit (₹)</th>
                    <th className="text-end">Credit (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((e) => (
                    <tr key={e.id}>
                      <td>{formatDate(e.entryDate)}</td>
                      <td><code>{e.transactionNumber}</code></td>
                      <td>
                        <span className="fw-semibold text-dark me-1">{e.accountCode}</span>
                        <small className="text-muted">• {e.accountName}</small>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">{e.sourceModule}</span>
                      </td>
                      <td>{e.description}</td>
                      <td className="text-end fw-bold text-primary">
                        {e.debit > 0 ? `₹${e.debit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                      </td>
                      <td className="text-end fw-bold text-success">
                        {e.credit > 0 ? `₹${e.credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Post Journal Modal */}
      {showJournalModal && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
          <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <form onSubmit={handlePostJournal}>
                  <div className="modal-header">
                    <h5 className="modal-title">Post Double-Entry Journal Voucher</h5>
                    <button type="button" className="btn-close" onClick={() => setShowJournalModal(false)} disabled={posting}></button>
                  </div>
                  <div className="modal-body">
                    {modalError && <div className="alert alert-danger py-2 px-3 mb-3 small">{modalError}</div>}
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label small fw-semibold">Voucher Description *</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={journalForm.description}
                          onChange={(e) => setJournalForm({ ...journalForm, description: e.target.value })}
                          required
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label small fw-semibold">Debit Account (DR) *</label>
                        <select
                          className="form-select form-select-sm"
                          value={journalForm.drAccountId}
                          onChange={(e) => setJournalForm({ ...journalForm, drAccountId: e.target.value })}
                          required
                        >
                          {accounts.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.code} — {a.name} ({a.type})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-12">
                        <label className="form-label small fw-semibold">Credit Account (CR) *</label>
                        <select
                          className="form-select form-select-sm"
                          value={journalForm.crAccountId}
                          onChange={(e) => setJournalForm({ ...journalForm, crAccountId: e.target.value })}
                          required
                        >
                          {accounts.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.code} — {a.name} ({a.type})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-12">
                        <label className="form-label small fw-semibold">Voucher Amount (₹) *</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={journalForm.amount}
                          onChange={(e) => setJournalForm({ ...journalForm, amount: Number(e.target.value) })}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowJournalModal(false)} disabled={posting}>Cancel</button>
                    <button type="submit" className="btn btn-primary btn-sm" disabled={posting}>{posting ? 'Posting...' : 'Post Voucher'}</button>
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
