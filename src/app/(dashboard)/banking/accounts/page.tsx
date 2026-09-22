'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import LoadingState from '@/components/common/LoadingState';
import StatusBadge from '@/components/common/StatusBadge';
import { bankService } from '@/services/bankService';
import { BankAccount, CashAccount } from '@/types/bank';

export default function BankingAccountsPage() {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [cashAccounts, setCashAccounts] = useState<CashAccount[]>([]);
  const [loading, setLoading] = useState(true);

  // New Bank Account Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');
  const [formData, setFormData] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    ifscCode: 'SBIN0001234',
    openingBalance: 100000,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [bankRes, cashRes] = await Promise.all([
      bankService.getBankAccounts(),
      bankService.getCashAccounts(),
    ]);
    if (bankRes.success) setBankAccounts(bankRes.data);
    if (cashRes.success) setCashAccounts(cashRes.data);
    setLoading(false);
  }

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setModalError('');
    const res = await bankService.createBankAccount(formData);
    setSaving(false);

    if (res.success) {
      setShowAddModal(false);
      loadData();
    } else {
      setModalError(res.message || 'Failed to add bank account.');
    }
  };

  const totalBankBook = bankAccounts.reduce((acc, b) => acc + b.bookBalance, 0);
  const totalCashVault = cashAccounts.reduce((acc, c) => acc + c.currentBalance, 0);

  return (
    <div>
      <PageHeader
        title="Cash & Bank Accounts Management"
        description="Monitor physical cash vaults and bank accounts connected to the central financial accounting ledger."
      >
        <button className="btn btn-primary btn-sm me-2" onClick={() => setShowAddModal(true)}>
          <i className="bi bi-bank2 me-1"></i> Add Bank Account
        </button>
        <Link href="/banking/reconciliation" className="btn btn-outline-primary btn-sm">
          <i className="bi bi-arrow-repeat me-1"></i> Bank Reconciliation
        </Link>
      </PageHeader>

      {/* Financial Liquidity Summary */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 border-start border-4 border-primary">
            <div className="card-body p-3">
              <div className="text-muted small fw-bold">TOTAL BANK BOOK BALANCE</div>
              <div className="fs-4 fw-bold text-dark mt-1">₹{totalBankBook.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
              <small className="text-muted">{bankAccounts.length} Society Bank Accounts</small>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 border-start border-4 border-success">
            <div className="card-body p-3">
              <div className="text-muted small fw-bold">PHYSICAL CASH VAULT BALANCE</div>
              <div className="fs-4 fw-bold text-dark mt-1">₹{totalCashVault.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
              <small className="text-muted">{cashAccounts.length} Branch Cash Accounts</small>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 border-start border-4 border-info">
            <div className="card-body p-3">
              <div className="text-muted small fw-bold">STATEMENT RECONCILIATION</div>
              <div className="fs-4 fw-bold text-dark mt-1">
                <Link href="/banking/reconciliation" className="text-decoration-none text-dark">
                  Workspace <i className="bi bi-arrow-right small"></i>
                </Link>
              </div>
              <small className="text-muted">Statement CSV Import & Matching</small>
            </div>
          </div>
        </div>
      </div>

      {/* Bank Accounts Section */}
      <div className="card mb-4">
        <div className="card-header bg-white py-3 d-flex align-items-center justify-content-between">
          <h6 className="card-title mb-0 fw-bold text-dark">
            <i className="bi bi-building me-2 text-primary"></i> Registered Society Bank Accounts
          </h6>
          <Link href="/banking/import" className="btn btn-sm btn-outline-secondary">
            <i className="bi bi-file-earmark-spreadsheet me-1"></i> Import Statement CSV
          </Link>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <LoadingState message="Loading bank accounts..." />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Bank Name</th>
                    <th>Account Number</th>
                    <th>Account Name</th>
                    <th>IFSC Code</th>
                    <th>Branch</th>
                    <th className="text-end">Book Balance</th>
                    <th className="text-end">Statement Balance</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bankAccounts.map((b) => (
                    <tr key={b.id}>
                      <td className="fw-semibold">{b.bankName}</td>
                      <td><code>{b.accountNumber}</code></td>
                      <td>{b.accountName}</td>
                      <td><small className="text-muted">{b.ifscCode}</small></td>
                      <td>{b.branchName}</td>
                      <td className="text-end fw-bold text-primary">₹{b.bookBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="text-end fw-bold text-success">₹{b.statementBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td><StatusBadge status={b.status} /></td>
                      <td className="text-end">
                        <Link href="/banking/reconciliation" className="btn btn-sm btn-outline-primary">
                          Reconcile
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

      {/* Cash Accounts Section */}
      <div className="card">
        <div className="card-header bg-white py-3">
          <h6 className="card-title mb-0 fw-bold text-dark">
            <i className="bi bi-cash-stack me-2 text-success"></i> Branch Physical Cash Accounts
          </h6>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <LoadingState message="Loading cash accounts..." />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Account Name</th>
                    <th>Code</th>
                    <th>Branch</th>
                    <th className="text-end">Opening Balance</th>
                    <th className="text-end">Current Cash Balance</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {cashAccounts.map((c) => (
                    <tr key={c.id}>
                      <td className="fw-semibold">{c.accountName}</td>
                      <td><code>{c.accountCode}</code></td>
                      <td>{c.branchName}</td>
                      <td className="text-end">₹{c.openingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="text-end fw-bold text-success">₹{c.currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td><StatusBadge status={c.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Bank Modal */}
      {showAddModal && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
          <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <form onSubmit={handleSaveBank}>
                  <div className="modal-header">
                    <h5 className="modal-title">Register New Bank Account</h5>
                    <button type="button" className="btn-close" onClick={() => setShowAddModal(false)} disabled={saving}></button>
                  </div>
                  <div className="modal-body">
                    {modalError && <div className="alert alert-danger py-2 px-3 mb-3 small">{modalError}</div>}
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label small fw-semibold">Bank Name *</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="e.g. Punjab National Bank"
                          value={formData.bankName}
                          onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                          required
                        />
                      </div>

                      <div className="col-6">
                        <label className="form-label small fw-semibold">Account Number *</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="e.g. PNB-1122334455"
                          value={formData.accountNumber}
                          onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                          required
                        />
                      </div>

                      <div className="col-6">
                        <label className="form-label small fw-semibold">IFSC Code *</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={formData.ifscCode}
                          onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                          required
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label small fw-semibold">Account Display Name *</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="e.g. Society PNB Main Account"
                          value={formData.accountName}
                          onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                          required
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label small fw-semibold">Opening Book Balance (₹)</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={formData.openingBalance}
                          onChange={(e) => setFormData({ ...formData, openingBalance: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)} disabled={saving}>Cancel</button>
                    <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Saving...' : 'Register Account'}</button>
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
