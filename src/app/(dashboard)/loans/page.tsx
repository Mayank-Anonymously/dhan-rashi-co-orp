'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import StatusBadge from '@/components/common/StatusBadge';
import EmptyState from '@/components/common/EmptyState';
import LoadingState from '@/components/common/LoadingState';
import { loanService } from '@/services/loanService';
import { branchService } from '@/services/branchService';
import { LoanAccount } from '@/types/loan';
import { Branch } from '@/types/branch';
import { formatDate } from '@/utils/helpers';

export default function LoanAccountsPage() {
  const [loans, setLoans] = useState<LoanAccount[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [loanRes, branchRes] = await Promise.all([
      loanService.getLoanAccounts(),
      branchService.getBranches(),
    ]);
    if (loanRes.success) setLoans(loanRes.data);
    if (branchRes.success) setBranches(branchRes.data);
    setLoading(false);
  }

  const filteredLoans = loans.filter((loan) => {
    const s = search.toLowerCase();
    const matchesSearch =
      !search ||
      loan.loanNumber.toLowerCase().includes(s) ||
      loan.memberName.toLowerCase().includes(s) ||
      loan.memberNumber.toLowerCase().includes(s);
    const matchesStatus = !statusFilter || loan.status === statusFilter;
    const matchesBranch = !branchFilter || loan.branchId === branchFilter;
    return matchesSearch && matchesStatus && matchesBranch;
  });

  const totalDisbursed = loans.reduce((acc, l) => acc + l.principalAmount, 0);
  const totalOutstanding = loans.reduce((acc, l) => acc + l.outstandingPrincipal, 0);
  const activeCount = loans.filter((l) => l.status === 'ACTIVE').length;

  return (
    <div>
      <PageHeader
        title="Loan Accounts Directory"
        description="Monitor active and closed loan accounts, track principal balances, EMIs, and repayment schedules."
      >
        <Link href="/loans/applications" className="btn btn-primary btn-sm">
          <i className="bi bi-plus-circle me-1"></i> New Loan Application
        </Link>
      </PageHeader>

      {/* Summary KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 border-start border-4 border-primary">
            <div className="card-body p-3">
              <div className="text-muted small fw-medium">Total Loan Accounts</div>
              <div className="fs-4 fw-bold text-dark mt-1">{loans.length}</div>
              <small className="text-success"><i className="bi bi-check-circle me-1"></i>{activeCount} Active</small>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 border-start border-4 border-success">
            <div className="card-body p-3">
              <div className="text-muted small fw-medium">Total Disbursed Principal</div>
              <div className="fs-4 fw-bold text-dark mt-1">₹{totalDisbursed.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
              <small className="text-muted">Across all branches</small>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 border-start border-4 border-warning">
            <div className="card-body p-3">
              <div className="text-muted small fw-medium">Outstanding Principal Balance</div>
              <div className="fs-4 fw-bold text-dark mt-1">₹{totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
              <small className="text-muted">Active loans</small>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 border-start border-4 border-info">
            <div className="card-body p-3">
              <div className="text-muted small fw-medium">Loan Products</div>
              <div className="fs-4 fw-bold text-dark mt-1">
                <Link href="/loans/products" className="text-decoration-none text-dark">
                  View Products <i className="bi bi-arrow-right small"></i>
                </Link>
              </div>
              <small className="text-muted">Personal & Emergency Loans</small>
            </div>
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
                  placeholder="Search Loan No, Member Name or No..."
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
                <option value="">All Loan Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="CLOSED">Closed</option>
                <option value="OVERDUE">Overdue</option>
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

            {(search || statusFilter || branchFilter) && (
              <div className="col-auto ms-auto">
                <button
                  className="btn btn-link btn-sm text-decoration-none p-0 text-muted"
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('');
                    setBranchFilter('');
                  }}
                >
                  <i className="bi bi-x-circle me-1"></i> Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loans Table */}
      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <LoadingState message="Loading loan accounts..." />
          ) : filteredLoans.length === 0 ? (
            <EmptyState
              icon="bi-cash-coin"
              title="No loan accounts found"
              message="No records match your filters."
            />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Loan Number</th>
                    <th>Member Details</th>
                    <th>Product & Interest</th>
                    <th>Disbursed Principal</th>
                    <th>Monthly EMI</th>
                    <th>Outstanding Bal</th>
                    <th>Start Date</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLoans.map((loan) => (
                    <tr key={loan.id}>
                      <td>
                        <Link href={`/loans/${loan.id}`} className="fw-bold text-primary text-decoration-none">
                          {loan.loanNumber}
                        </Link>
                      </td>
                      <td>
                        <div className="fw-semibold">{loan.memberName}</div>
                        <small className="text-muted">{loan.memberNumber} • {loan.branchName}</small>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border me-1">{loan.productName}</span>
                        <small className="text-muted">{loan.interestRate}% ({loan.interestType})</small>
                      </td>
                      <td className="fw-bold">₹{loan.principalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="text-success fw-bold">₹{loan.emiAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="fw-bold text-danger">₹{loan.outstandingPrincipal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td>{formatDate(loan.startDate)}</td>
                      <td><StatusBadge status={loan.status} /></td>
                      <td className="text-end">
                        <Link href={`/loans/${loan.id}`} className="btn btn-sm btn-outline-primary">
                          <i className="bi bi-eye me-1"></i> View Details
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
    </div>
  );
}
