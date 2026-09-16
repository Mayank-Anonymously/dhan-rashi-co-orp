'use client';

import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/common/PageHeader';
import StatusBadge from '@/components/common/StatusBadge';
import EmptyState from '@/components/common/EmptyState';
import LoadingState from '@/components/common/LoadingState';
import ConfirmModal from '@/components/common/ConfirmModal';
import { branchService } from '@/services/branchService';
import { Branch, BranchFormData } from '@/types/branch';

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<BranchFormData>({
    code: '',
    name: '',
    managerId: 'usr-001',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Confirm Modal State for status toggle
  const [confirmTarget, setConfirmTarget] = useState<Branch | null>(null);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    loadBranches();
  }, []);

  async function loadBranches() {
    setLoading(true);
    const res = await branchService.getBranches();
    if (res.success) setBranches(res.data);
    setLoading(false);
  }

  const handleOpenAddModal = () => {
    setEditingBranch(null);
    setFormData({
      code: `DRCS-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      managerId: 'usr-001',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      code: branch.code,
      name: branch.name,
      managerId: branch.managerId,
      phone: branch.phone,
      email: branch.email,
      address: branch.address,
      city: branch.city,
      state: branch.state,
      pincode: branch.pincode,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (editingBranch) {
      await branchService.updateBranch(editingBranch.id, formData);
    } else {
      await branchService.createBranch(formData);
    }

    setSaving(false);
    setShowModal(false);
    loadBranches();
  };

  const handleToggleStatus = async () => {
    if (!confirmTarget) return;
    setToggling(true);
    await branchService.toggleStatus(confirmTarget.id);
    setToggling(false);
    setConfirmTarget(null);
    loadBranches();
  };

  // Filtered branches
  const filteredBranches = branches.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.code.toLowerCase().includes(search.toLowerCase()) ||
      b.city.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <PageHeader
        title="Branch Management"
        description="View and manage society operational branches and head offices."
      >
        <button className="btn btn-primary btn-sm" onClick={handleOpenAddModal}>
          <i className="bi bi-plus-lg me-1"></i> Add Branch
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
                  placeholder="Search by branch name, code or city..."
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

            {(search || statusFilter) && (
              <div className="col-auto ms-auto">
                <button
                  className="btn btn-link btn-sm text-decoration-none p-0 text-muted"
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('');
                  }}
                >
                  <i className="bi bi-x-circle me-1"></i> Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Branch Table */}
      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <LoadingState message="Loading branches..." />
          ) : filteredBranches.length === 0 ? (
            <EmptyState
              icon="bi-diagram-3"
              title="No branches found"
              message={search || statusFilter ? 'Try clearing your filters.' : 'Click Add Branch to create your first branch.'}
            />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Branch Name</th>
                    <th>Manager</th>
                    <th>Phone</th>
                    <th>City</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBranches.map((b) => (
                    <tr key={b.id}>
                      <td><code>{b.code}</code></td>
                      <td className="fw-semibold">{b.name}</td>
                      <td>{b.manager || 'Admin User'}</td>
                      <td>{b.phone}</td>
                      <td>{b.city}, {b.state}</td>
                      <td><StatusBadge status={b.status} /></td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-light border"
                            title="Edit Branch"
                            onClick={() => handleOpenEditModal(b)}
                          >
                            <i className="bi bi-pencil text-secondary"></i>
                          </button>
                          <button
                            className={`btn btn-light border ${b.status === 'Active' ? 'text-danger' : 'text-success'}`}
                            title={b.status === 'Active' ? 'Deactivate Branch' : 'Activate Branch'}
                            onClick={() => setConfirmTarget(b)}
                          >
                            <i className={`bi ${b.status === 'Active' ? 'bi-slash-circle' : 'bi-check-circle'}`}></i>
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

      {/* Add / Edit Branch Modal */}
      {showModal && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
          <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <form onSubmit={handleSave}>
                  <div className="modal-header">
                    <h5 className="modal-title">{editingBranch ? 'Edit Branch' : 'Add New Branch'}</h5>
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
                        <label className="form-label small fw-semibold">Branch Code</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={formData.code}
                          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-8">
                        <label className="form-label small fw-semibold">Branch Name</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="e.g. South Delhi Branch"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-semibold">Phone Number</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-semibold">Email Address</label>
                        <input
                          type="email"
                          className="form-control form-control-sm"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label small fw-semibold">Address</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-4">
                        <label className="form-label small fw-semibold">City</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-4">
                        <label className="form-label small fw-semibold">State</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-4">
                        <label className="form-label small fw-semibold">Pincode</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={formData.pincode}
                          onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
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
                      {saving ? 'Saving...' : editingBranch ? 'Update Branch' : 'Create Branch'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Confirmation Modal for activate/deactivate */}
      <ConfirmModal
        isOpen={!!confirmTarget}
        title={`${confirmTarget?.status === 'Active' ? 'Deactivate' : 'Activate'} Branch`}
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
