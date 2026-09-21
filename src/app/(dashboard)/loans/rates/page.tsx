'use client';

import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/common/PageHeader';
import StatusBadge from '@/components/common/StatusBadge';
import EmptyState from '@/components/common/EmptyState';
import LoadingState from '@/components/common/LoadingState';
import { loanService } from '@/services/loanService';
import { LoanRate, LoanProduct } from '@/types/loan';
import { formatDate } from '@/utils/helpers';

export default function LoanRatesPage() {
  const [rates, setRates] = useState<LoanRate[]>([]);
  const [products, setProducts] = useState<LoanProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    minAmount: 10000,
    maxAmount: 100000,
    interestRate: 12,
    effectiveFrom: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [rateRes, prodRes] = await Promise.all([
      loanService.getLoanRates(),
      loanService.getLoanProducts(),
    ]);
    if (rateRes.success) setRates(rateRes.data);
    if (prodRes.success) {
      setProducts(prodRes.data);
      if (prodRes.data.length > 0) {
        setFormData((prev) => ({ ...prev, productId: prodRes.data[0].id }));
      }
    }
    setLoading(false);
  }

  const handleOpenAddModal = () => {
    setFormData({
      productId: products[0]?.id || '',
      minAmount: 10000,
      maxAmount: 100000,
      interestRate: 12,
      effectiveFrom: new Date().toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await loanService.createLoanRate(formData);
    setSaving(false);
    setShowModal(false);
    loadData();
  };

  return (
    <div>
      <PageHeader
        title="Interest Rate Slabs & Versioning"
        description="Configure tiered interest rate slabs for loan products based on loan amount ranges and effective dates."
      >
        <button className="btn btn-primary btn-sm" onClick={handleOpenAddModal}>
          <i className="bi bi-plus-circle me-1"></i> Add Interest Rate Slab
        </button>
      </PageHeader>

      {/* Info Alert */}
      <div className="alert alert-info py-2 px-3 mb-4 small" role="alert">
        <i className="bi bi-shield-check me-2"></i>
        <strong>Immutable Rate Versioning:</strong> Modifying or creating new interest rate slabs creates a new effective version without retroactively changing existing active loan accounts.
      </div>

      {/* Rates Table */}
      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <LoadingState message="Loading interest rate slabs..." />
          ) : rates.length === 0 ? (
            <EmptyState
              icon="bi-percent"
              title="No rate slabs found"
              message="Click Add Interest Rate Slab to configure rate tiers."
            />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Product Code</th>
                    <th>Product Name</th>
                    <th>Slab Amount Range</th>
                    <th>Applicable Interest Rate</th>
                    <th>Effective From</th>
                    <th>Effective To</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rates.map((r) => (
                    <tr key={r.id}>
                      <td><code>{r.productCode}</code></td>
                      <td className="fw-semibold">{r.productName}</td>
                      <td>
                        ₹{r.minAmount.toLocaleString()} — ₹{r.maxAmount.toLocaleString()}
                      </td>
                      <td>
                        <span className="badge bg-primary fs-6 fw-bold px-2 py-1">
                          {r.interestRate}% p.a.
                        </span>
                      </td>
                      <td>{formatDate(r.effectiveFrom)}</td>
                      <td>{r.effectiveTo === '2099-12-31' ? 'Indefinite' : formatDate(r.effectiveTo || '')}</td>
                      <td><StatusBadge status={r.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Rate Slab Modal */}
      {showModal && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
          <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <form onSubmit={handleSave}>
                  <div className="modal-header">
                    <h5 className="modal-title">Add Interest Rate Slab</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowModal(false)}
                      disabled={saving}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="row g-3">
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
                              {p.name} ({p.code})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-6">
                        <label className="form-label small fw-semibold">Slab Min Amount (₹) *</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={formData.minAmount}
                          onChange={(e) => setFormData({ ...formData, minAmount: Number(e.target.value) })}
                          required
                        />
                      </div>

                      <div className="col-6">
                        <label className="form-label small fw-semibold">Slab Max Amount (₹) *</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={formData.maxAmount}
                          onChange={(e) => setFormData({ ...formData, maxAmount: Number(e.target.value) })}
                          required
                        />
                      </div>

                      <div className="col-6">
                        <label className="form-label small fw-semibold">Interest Rate (% p.a.) *</label>
                        <input
                          type="number"
                          step="0.1"
                          className="form-control form-control-sm"
                          value={formData.interestRate}
                          onChange={(e) => setFormData({ ...formData, interestRate: Number(e.target.value) })}
                          required
                        />
                      </div>

                      <div className="col-6">
                        <label className="form-label small fw-semibold">Effective From Date *</label>
                        <input
                          type="date"
                          className="form-control form-control-sm"
                          value={formData.effectiveFrom}
                          onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                          required
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
                      {saving ? 'Saving...' : 'Create Rate Slab'}
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
