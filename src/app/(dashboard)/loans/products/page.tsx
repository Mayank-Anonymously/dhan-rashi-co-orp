'use client';

import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/common/PageHeader';
import StatusBadge from '@/components/common/StatusBadge';
import EmptyState from '@/components/common/EmptyState';
import LoadingState from '@/components/common/LoadingState';
import ConfirmModal from '@/components/common/ConfirmModal';
import { loanService } from '@/services/loanService';
import { LoanProduct, InterestType } from '@/types/loan';

export default function LoanProductsPage() {
  const [products, setProducts] = useState<LoanProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<LoanProduct | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    loanType: 'Personal Loan',
    minAmount: 10000,
    maxAmount: 500000,
    interestRateType: 'REDUCING_BALANCE' as InterestType,
    baseInterestRate: 12,
    minPeriod: 6,
    maxPeriod: 60,
    processingCharge: 1,
    description: '',
  });

  // Confirm Modal State
  const [confirmTarget, setConfirmTarget] = useState<LoanProduct | null>(null);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    const res = await loanService.getLoanProducts();
    if (res.success) setProducts(res.data);
    setLoading(false);
  }

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      code: `LP-${Math.floor(10 + Math.random() * 90)}`,
      loanType: 'Personal Loan',
      minAmount: 10000,
      maxAmount: 500000,
      interestRateType: 'REDUCING_BALANCE',
      baseInterestRate: 12,
      minPeriod: 6,
      maxPeriod: 60,
      processingCharge: 1,
      description: '',
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await loanService.createLoanProduct(formData);
    setSaving(false);
    setShowModal(false);
    loadProducts();
  };

  const handleToggleStatus = async () => {
    if (!confirmTarget) return;
    setToggling(true);
    await loanService.toggleProductStatus(confirmTarget.id);
    setToggling(false);
    setConfirmTarget(null);
    loadProducts();
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <PageHeader
        title="Loan Products Configuration"
        description="Configure society loan product rules, limits, interest calculation methods, and charges."
      >
        <button className="btn btn-primary btn-sm" onClick={handleOpenAddModal}>
          <i className="bi bi-plus-lg me-1"></i> Add Loan Product
        </button>
      </PageHeader>

      {/* Filter Toolbar */}
      <div className="card mb-4">
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-6 col-lg-4">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by product name or code..."
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
                <option value="">All Statuses</option>
                <option value="Active">Active Only</option>
                <option value="Inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <LoadingState message="Loading loan products..." />
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              icon="bi-box-seam"
              title="No loan products found"
              message="Click Add Loan Product to configure your first product."
            />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Product Name</th>
                    <th>Amount Range</th>
                    <th>Interest Method</th>
                    <th>Base Rate</th>
                    <th>Tenure Range</th>
                    <th>Processing Fee</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p.id}>
                      <td><code>{p.code}</code></td>
                      <td>
                        <div className="fw-semibold">{p.name}</div>
                        <small className="text-muted">{p.loanType}</small>
                      </td>
                      <td>
                        ₹{p.minAmount.toLocaleString()} — ₹{p.maxAmount.toLocaleString()}
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {p.interestRateType === 'REDUCING_BALANCE' ? 'Reducing Balance' : 'Flat Rate'}
                        </span>
                      </td>
                      <td className="fw-bold text-primary">{p.baseInterestRate}% p.a.</td>
                      <td>{p.minPeriod} — {p.maxPeriod} mos</td>
                      <td>{p.processingCharge}%</td>
                      <td><StatusBadge status={p.status} /></td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            className={`btn btn-light border ${p.status === 'Active' ? 'text-danger' : 'text-success'}`}
                            title={p.status === 'Active' ? 'Deactivate Product' : 'Activate Product'}
                            onClick={() => setConfirmTarget(p)}
                          >
                            <i className={`bi ${p.status === 'Active' ? 'bi-slash-circle' : 'bi-check-circle'}`}></i>
                          </button>
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

      {/* Add Loan Product Modal */}
      {showModal && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
          <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1055 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <form onSubmit={handleSave}>
                  <div className="modal-header">
                    <h5 className="modal-title">{editingProduct ? 'Edit Loan Product' : 'Add Loan Product'}</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowModal(false)}
                      disabled={saving}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-4">
                        <label className="form-label small fw-semibold">Product Code *</label>
                        <input
                          type="text"
                          className="form-control form-control-sm text-uppercase"
                          value={formData.code}
                          onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                          required
                        />
                      </div>
                      <div className="col-8">
                        <label className="form-label small fw-semibold">Product Name *</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="e.g. Consumer Vehicle Loan"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>

                      <div className="col-6">
                        <label className="form-label small fw-semibold">Minimum Amount (₹) *</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={formData.minAmount}
                          onChange={(e) => setFormData({ ...formData, minAmount: Number(e.target.value) })}
                          required
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-semibold">Maximum Amount (₹) *</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={formData.maxAmount}
                          onChange={(e) => setFormData({ ...formData, maxAmount: Number(e.target.value) })}
                          required
                        />
                      </div>

                      <div className="col-6">
                        <label className="form-label small fw-semibold">Interest Calculation Type *</label>
                        <select
                          className="form-select form-select-sm"
                          value={formData.interestRateType}
                          onChange={(e) => setFormData({ ...formData, interestRateType: e.target.value as InterestType })}
                        >
                          <option value="REDUCING_BALANCE">Reducing Balance (EMI)</option>
                          <option value="FLAT">Flat Rate</option>
                        </select>
                      </div>

                      <div className="col-6">
                        <label className="form-label small fw-semibold">Base Interest Rate (% p.a.) *</label>
                        <input
                          type="number"
                          step="0.1"
                          className="form-control form-control-sm"
                          value={formData.baseInterestRate}
                          onChange={(e) => setFormData({ ...formData, baseInterestRate: Number(e.target.value) })}
                          required
                        />
                      </div>

                      <div className="col-4">
                        <label className="form-label small fw-semibold">Min Period (Months) *</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={formData.minPeriod}
                          onChange={(e) => setFormData({ ...formData, minPeriod: Number(e.target.value) })}
                          required
                        />
                      </div>

                      <div className="col-4">
                        <label className="form-label small fw-semibold">Max Period (Months) *</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={formData.maxPeriod}
                          onChange={(e) => setFormData({ ...formData, maxPeriod: Number(e.target.value) })}
                          required
                        />
                      </div>

                      <div className="col-4">
                        <label className="form-label small fw-semibold">Processing Fee (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          className="form-control form-control-sm"
                          value={formData.processingCharge}
                          onChange={(e) => setFormData({ ...formData, processingCharge: Number(e.target.value) })}
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label small fw-semibold">Description</label>
                        <textarea
                          rows={2}
                          className="form-control form-control-sm"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                      {saving ? 'Saving...' : 'Create Loan Product'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!confirmTarget}
        title={`${confirmTarget?.status === 'Active' ? 'Deactivate' : 'Activate'} Product`}
        message={`Are you sure you want to ${confirmTarget?.status === 'Active' ? 'deactivate' : 'activate'} ${confirmTarget?.name}?`}
        confirmText={confirmTarget?.status === 'Active' ? 'Deactivate' : 'Activate'}
        variant={confirmTarget?.status === 'Active' ? 'danger' : 'primary'}
        onConfirm={handleToggleStatus}
        onCancel={() => setConfirmTarget(null)}
        isLoading={toggling}
      />
    </div>
  );
}
