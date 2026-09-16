'use client';

import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/common/PageHeader';
import StatusBadge from '@/components/common/StatusBadge';
import EmptyState from '@/components/common/EmptyState';
import LoadingState from '@/components/common/LoadingState';
import ConfirmModal from '@/components/common/ConfirmModal';
import { userService } from '@/services/userService';
import { branchService } from '@/services/branchService';
import { User, UserFormData, Role } from '@/types/user';
import { Branch } from '@/types/branch';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');

  // Active Tab: Users list vs Roles overview
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    roleId: 'role-003',
    branchId: 'br-001',
    phone: '',
  });

  // Confirm Modal State
  const [confirmTarget, setConfirmTarget] = useState<User | null>(null);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [userRes, roleRes, branchRes] = await Promise.all([
      userService.getUsers(),
      userService.getRoles(),
      branchService.getBranches(),
    ]);
    if (userRes.success) setUsers(userRes.data);
    if (roleRes.success) setRoles(roleRes.data);
    if (branchRes.success) setBranches(branchRes.data);
    setLoading(false);
  }

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      roleId: roles[1]?.id || 'role-002',
      branchId: branches[0]?.id || 'br-001',
      phone: '',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      roleId: user.roleId,
      branchId: user.branchId,
      phone: user.phone,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (editingUser) {
      await userService.updateUser(editingUser.id, formData);
    } else {
      await userService.createUser(formData);
    }
    setSaving(false);
    setShowModal(false);
    loadData();
  };

  const handleToggleStatus = async () => {
    if (!confirmTarget) return;
    setToggling(true);
    await userService.toggleStatus(confirmTarget.id);
    setToggling(false);
    setConfirmTarget(null);
    loadData();
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search);
    const matchesRole = !roleFilter || u.roleId === roleFilter;
    const matchesBranch = !branchFilter || u.branchId === branchFilter;
    return matchesSearch && matchesRole && matchesBranch;
  });

  return (
    <div>
      <PageHeader
        title="Users & Roles Management"
        description="Manage system users, access roles, and branch assignments."
      >
        <button className="btn btn-primary btn-sm" onClick={handleOpenAddModal}>
          <i className="bi bi-person-plus me-1"></i> Add User
        </button>
      </PageHeader>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <i className="bi bi-people me-1"></i> System Users ({users.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'roles' ? 'active' : ''}`}
            onClick={() => setActiveTab('roles')}
          >
            <i className="bi bi-shield-lock me-1"></i> Roles Directory ({roles.length})
          </button>
        </li>
      </ul>

      {activeTab === 'users' ? (
        <>
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
                      placeholder="Search by name, email or phone..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-md-3">
                  <select
                    className="form-select form-select-sm"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="">All Roles</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
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

                {(search || roleFilter || branchFilter) && (
                  <div className="col-auto ms-auto">
                    <button
                      className="btn btn-link btn-sm text-decoration-none p-0 text-muted"
                      onClick={() => {
                        setSearch('');
                        setRoleFilter('');
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

          {/* User Table */}
          <div className="card">
            <div className="card-body p-0">
              {loading ? (
                <LoadingState message="Loading users..." />
              ) : filteredUsers.length === 0 ? (
                <EmptyState
                  icon="bi-people"
                  title="No users found"
                  message="Try adjusting your search criteria."
                />
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Branch</th>
                        <th>Status</th>
                        <th>Last Login</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u.id}>
                          <td>
                            <div className="fw-semibold">{u.name}</div>
                            <small className="text-muted">{u.phone}</small>
                          </td>
                          <td><code>{u.email}</code></td>
                          <td>
                            <span className="badge bg-light text-dark border fw-normal">
                              {u.role}
                            </span>
                          </td>
                          <td>{u.branch}</td>
                          <td><StatusBadge status={u.status} /></td>
                          <td><small className="text-muted">{u.lastLogin}</small></td>
                          <td className="text-end">
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-light border"
                                title="Edit User"
                                onClick={() => handleOpenEditModal(u)}
                              >
                                <i className="bi bi-pencil text-secondary"></i>
                              </button>
                              <button
                                className={`btn btn-light border ${u.status === 'Active' ? 'text-danger' : 'text-success'}`}
                                title={u.status === 'Active' ? 'Deactivate User' : 'Activate User'}
                                onClick={() => setConfirmTarget(u)}
                              >
                                <i className={`bi ${u.status === 'Active' ? 'bi-slash-circle' : 'bi-check-circle'}`}></i>
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
        </>
      ) : (
        /* Roles Display */
        <div className="row g-3">
          {roles.map((role) => (
            <div key={role.id} className="col-12 col-md-6 col-xl-4">
              <div className="card h-100">
                <div className="card-header bg-light d-flex align-items-center justify-content-between">
                  <span className="fw-bold">{role.name}</span>
                  <span className="badge bg-primary rounded-pill">{role.userCount} Users</span>
                </div>
                <div className="card-body">
                  <p className="small text-muted mb-3">{role.description}</p>
                  <div className="detail-label mb-1">Permissions</div>
                  <div className="d-flex flex-wrap gap-1">
                    {role.permissions.map((perm) => (
                      <span key={perm} className="badge bg-light text-secondary border fw-normal">
                        <code>{perm}</code>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit User Modal */}
      {showModal && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
          <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <form onSubmit={handleSave}>
                  <div className="modal-header">
                    <h5 className="modal-title">{editingUser ? 'Edit User' : 'Add New User'}</h5>
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
                        <label className="form-label small fw-semibold">Full Name</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                      <div className="col-6">
                        <label className="form-label small fw-semibold">Mobile Phone</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-semibold">Assigned Role</label>
                        <select
                          className="form-select form-select-sm"
                          value={formData.roleId}
                          onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                        >
                          {roles.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-semibold">Assigned Branch</label>
                        <select
                          className="form-select form-select-sm"
                          value={formData.branchId}
                          onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                        >
                          {branches.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name}
                            </option>
                          ))}
                        </select>
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
                      {saving ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
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
        title={`${confirmTarget?.status === 'Active' ? 'Deactivate' : 'Activate'} User`}
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
