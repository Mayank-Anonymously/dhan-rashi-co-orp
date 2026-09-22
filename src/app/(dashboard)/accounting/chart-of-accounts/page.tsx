'use client';

import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/common/PageHeader';
import LoadingState from '@/components/common/LoadingState';
import EmptyState from '@/components/common/EmptyState';
import StatusBadge from '@/components/common/StatusBadge';
import { accountingService } from '@/services/accountingService';
import { ChartOfAccount, AccountType } from '@/types/accounting';

export default function ChartOfAccountsPage() {
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Add Account Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'ASSET' as AccountType,
    openingBalance: 0,
    openingBalanceType: 'DR' as 'DR' | 'CR',
    description: '',
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  async function loadAccounts() {
    setLoading(true);
    const res = await accountingService.getChartOfAccounts();
    if (res.success) setAccounts(res.data);
    setLoading(false);
  }

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setModalError('');
    const res = await accountingService.createChartOfAccount(formData);
    setSaving(false);

    if (res.success) {
      setShowAddModal(false);
      loadAccounts();
    } else {
      setModalError(res.message || 'Failed to create chart of account.');
    }
  };

  const filteredAccounts = accounts.filter((acc) => {
    const s = search.toLowerCase();
    const matchesSearch = !search || acc.code.toLowerCase().includes(s) || acc.name.toLowerCase().includes(s);
    const matchesType = !typeFilter || acc.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeBadgeClass = (type: AccountType) => {
    switch (type) {
      case 'ASSET': return 'bg-primary';
      case 'LIABILITY': return 'bg-danger';
      case 'EQUITY': return 'bg-success';
      case 'INCOME': return 'bg-info text-dark';
      case 'EXPENSE': return 'bg-warning text-dark';
      default: return 'bg-secondary';
    }
  };

  return (
    <div>
      <PageHeader
        title="Chart of Accounts"
        description="Master ledger structure defining assets, liabilities, equity, income, and expense accounts."
      >
        <button className="btn btn-primary btn-sm" onClick={() => { setFormData({ code: '', name: '', type: 'ASSET', openingBalance: 0, openingBalanceType: 'DR', description: '' }); setModalError(''); setShowAddModal(true); }}>
          <i className="bi bi-plus-circle me-1"></i> Add New Account
        </button>
      </PageHeader>

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
                  placeholder="Search by Code or Account Name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <select
                className="form-select form-select-sm"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Account Types</option>
                <option value="ASSET">Assets</option>
                <option value="LIABILITY">Liabilities</option>
                <option value="EQUITY">Equity / Capital</option>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expenses</option>
              </select>
            </div>

            {(search || typeFilter) && (
              <div className="col-auto ms-auto">
                <button className="btn btn-link btn-sm text-decoration-none p-0 text-muted" onClick={() => { setSearch(''); setTypeFilter(''); }}>
                  <i className="bi bi-x-circle me-1"></i> Clear
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <LoadingState message="Loading chart of accounts..." />
          ) : filteredAccounts.length === 0 ? (
            <EmptyState icon="bi-folder-x" title="No accounts found" message="No chart of accounts match your filter." />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '100px' }}>Code</th>
                    <th>Account Name</th>
                    <th>Type</th>
                    <th className="text-end">Opening Balance</th>
                    <th>System Account</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.map((acc) => (
                    <tr key={acc.id}>
                      <td><code className="fw-bold fs-6">{acc.code}</code></td>
                      <td className="fw-semibold">{acc.name}</td>
                      <td>
                        <span className={`badge ${getTypeBadgeClass(acc.type)}`}>
                          {acc.type}
                        </span>
                      </td>
                      <td className="text-end fw-bold">
                        ₹{acc.openingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({acc.openingBalanceType})
                      </td>
                      <td>
                        {acc.isSystemAccount ? (
                          <span className="badge bg-light text-primary border"><i className="bi bi-lock-fill me-1"></i> System</span>
                        ) : (
                          <span className="badge bg-light text-muted border">Custom</span>
                        )}
                      </td>
                      <td><StatusBadge status={acc.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Account Modal */}
      {showAddModal && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
          <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <form onSubmit={handleSaveAccount}>
                  <div className="modal-header">
                    <h5 className="modal-title">Add Chart of Account</h5>
                    <button type="button" className="btn-close" onClick={() => setShowAddModal(false)} disabled={saving}></button>
                  </div>
                  <div className="modal-body">
                    {modalError && <div className="alert alert-danger py-2 px-3 mb-3 small">{modalError}</div>}
                    <div className="row g-3">
                      <div className="col-4">
                        <label className="form-label small fw-semibold">Account Code *</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="e.g. 1400"
                          value={formData.code}
                          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-8">
                        <label className="form-label small fw-semibold">Account Name *</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="e.g. Office Equipment"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>

                      <div className="col-6">
                        <label className="form-label small fw-semibold">Account Type *</label>
                        <select
                          className="form-select form-select-sm"
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value as AccountType })}
                        >
                          <option value="ASSET">ASSET</option>
                          <option value="LIABILITY">LIABILITY</option>
                          <option value="EQUITY">EQUITY</option>
                          <option value="INCOME">INCOME</option>
                          <option value="EXPENSE">EXPENSE</option>
                        </select>
                      </div>

                      <div className="col-6">
                        <label className="form-label small fw-semibold">Opening Balance (₹)</label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            className="form-control"
                            value={formData.openingBalance}
                            onChange={(e) => setFormData({ ...formData, openingBalance: Number(e.target.value) })}
                          />
                          <select
                            className="form-select"
                            style={{ maxWidth: '80px' }}
                            value={formData.openingBalanceType}
                            onChange={(e) => setFormData({ ...formData, openingBalanceType: e.target.value as 'DR' | 'CR' })}
                          >
                            <option value="DR">DR</option>
                            <option value="CR">CR</option>
                          </select>
                        </div>
                      </div>

                      <div className="col-12">
                        <label className="form-label small fw-semibold">Description</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Account purpose notes"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)} disabled={saving}>Cancel</button>
                    <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Saving...' : 'Save Account'}</button>
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
