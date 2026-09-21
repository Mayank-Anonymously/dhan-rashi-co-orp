'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import StatusBadge from '@/components/common/StatusBadge';
import LoadingState from '@/components/common/LoadingState';
import EmptyState from '@/components/common/EmptyState';
import { loanService } from '@/services/loanService';
import { LoanAccount, LoanScheduleItem, LoanLedgerEntry } from '@/types/loan';
import { formatDate } from '@/utils/helpers';

interface PageParams {
  params: Promise<{ id: string }>;
}

export default function LoanAccountDetailPage({ params }: PageParams) {
  const { id } = use(params);

  const [loan, setLoan] = useState<LoanAccount | null>(null);
  const [schedule, setSchedule] = useState<LoanScheduleItem[]>([]);
  const [ledger, setLedger] = useState<LoanLedgerEntry[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'schedule' | 'ledger' | 'overview' | 'history'>('schedule');

  useEffect(() => {
    loadDetails();
  }, [id]);

  async function loadDetails() {
    setLoading(true);
    const res = await loanService.getLoanAccountDetails(id);
    if (res.success && res.data) {
      setLoan(res.data.loan);
      setSchedule(res.data.schedule || []);
      setLedger(res.data.ledger || []);
      setHistory(res.data.history || []);
    }
    setLoading(false);
  }

  if (loading) {
    return <LoadingState message="Loading loan account details..." />;
  }

  if (!loan) {
    return (
      <div>
        <PageHeader title="Loan Account Details" description="Loan account not found." />
        <div className="card">
          <div className="card-body py-5 text-center">
            <EmptyState icon="bi-exclamation-triangle" title="Account Not Found" message="The requested loan account does not exist or has been removed." />
            <Link href="/loans" className="btn btn-primary btn-sm mt-3">
              <i className="bi bi-arrow-left me-1"></i> Back to Loan Accounts Directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <PageHeader
        title={`Loan Account: ${loan.loanNumber}`}
        description={`Member: ${loan.memberName} (${loan.memberNumber}) • Product: ${loan.productName}`}
      >
        <Link href="/loans" className="btn btn-outline-secondary btn-sm me-2">
          <i className="bi bi-arrow-left me-1"></i> Back
        </Link>
        <StatusBadge status={loan.status} />
      </PageHeader>

      {/* Top Financial Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 border-start border-4 border-primary">
            <div className="card-body p-3">
              <div className="text-muted small fw-medium">Disbursed Principal</div>
              <div className="fs-4 fw-bold text-dark mt-1">₹{loan.principalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
              <small className="text-muted">{loan.loanPeriod} Months @ {loan.interestRate}% p.a.</small>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 border-start border-4 border-success">
            <div className="card-body p-3">
              <div className="text-muted small fw-medium">Monthly Installment (EMI)</div>
              <div className="fs-4 fw-bold text-success mt-1">₹{loan.emiAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
              <small className="text-muted">Calculated ({loan.interestType})</small>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 border-start border-4 border-danger">
            <div className="card-body p-3">
              <div className="text-muted small fw-medium">Outstanding Principal</div>
              <div className="fs-4 fw-bold text-danger mt-1">₹{loan.outstandingPrincipal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
              <small className="text-muted">Total Payable: ₹{loan.totalRepayment.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</small>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 border-start border-4 border-warning">
            <div className="card-body p-3">
              <div className="text-muted small fw-medium">Total Interest Charge</div>
              <div className="fs-4 fw-bold text-dark mt-1">₹{loan.totalInterest.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
              <small className="text-muted">Maturity: {formatDate(loan.maturityDate)}</small>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'schedule' ? 'active fw-bold text-primary' : 'text-muted'}`}
            onClick={() => setActiveTab('schedule')}
          >
            <i className="bi bi-calendar3 me-1"></i> Repayment Schedule ({schedule.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'ledger' ? 'active fw-bold text-primary' : 'text-muted'}`}
            onClick={() => setActiveTab('ledger')}
          >
            <i className="bi bi-journal-text me-1"></i> Loan Ledger ({ledger.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'overview' ? 'active fw-bold text-primary' : 'text-muted'}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="bi bi-info-circle me-1"></i> Account Parameters
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'history' ? 'active fw-bold text-primary' : 'text-muted'}`}
            onClick={() => setActiveTab('history')}
          >
            <i className="bi bi-clock-history me-1"></i> Audit Trail
          </button>
        </li>
      </ul>

      {/* Tab Contents */}
      {activeTab === 'schedule' && (
        <div className="card">
          <div className="card-header bg-white py-3 d-flex align-items-center justify-content-between">
            <h6 className="card-title mb-0 fw-bold text-dark">
              <i className="bi bi-table me-2 text-primary"></i> Amortization Repayment Schedule
            </h6>
            <span className="badge bg-light text-dark border">
              EMI Frequency: {loan.installmentFrequency}
            </span>
          </div>
          <div className="card-body p-0">
            {schedule.length === 0 ? (
              <EmptyState icon="bi-calendar-x" title="No Schedule Found" message="Repayment schedule for this loan has not been generated." />
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '60px' }}>#</th>
                      <th>Due Date</th>
                      <th className="text-end">Principal Due</th>
                      <th className="text-end">Interest Due</th>
                      <th className="text-end">Total EMI</th>
                      <th className="text-end">Principal Paid</th>
                      <th className="text-end">Interest Paid</th>
                      <th className="text-end">Outstanding Principal</th>
                      <th className="text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((item) => (
                      <tr key={item.id}>
                        <td className="fw-bold text-muted">{item.installmentNo}</td>
                        <td>{formatDate(item.dueDate)}</td>
                        <td className="text-end">₹{item.principalDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td className="text-end text-muted">₹{item.interestDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td className="text-end fw-bold text-primary">₹{item.totalInstallment.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td className="text-end text-success">₹{item.principalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td className="text-end text-success">₹{item.interestPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td className="text-end fw-bold text-dark">₹{item.outstandingPrincipal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td className="text-center">
                          <StatusBadge status={item.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'ledger' && (
        <div className="card">
          <div className="card-header bg-white py-3">
            <h6 className="card-title mb-0 fw-bold text-dark">
              <i className="bi bi-journal-check me-2 text-primary"></i> Loan Financial Ledger & Disbursements
            </h6>
          </div>
          <div className="card-body p-0">
            {ledger.length === 0 ? (
              <EmptyState icon="bi-journal-x" title="No Ledger Entries" message="No financial transactions recorded for this loan account." />
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Date</th>
                      <th>Entry Type</th>
                      <th>Description</th>
                      <th className="text-end">Amount</th>
                      <th>Performed By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledger.map((entry) => (
                      <tr key={entry.id}>
                        <td>{formatDate(entry.entryDate)}</td>
                        <td>
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                            {entry.entryType}
                          </span>
                        </td>
                        <td>{entry.description}</td>
                        <td className="text-end fw-bold text-dark">₹{entry.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td><small className="text-muted">{entry.performedBy}</small></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="row g-4">
          <div className="col-12 col-md-6">
            <div className="card h-100">
              <div className="card-header bg-white py-3">
                <h6 className="card-title mb-0 fw-bold text-dark">
                  <i className="bi bi-person me-2 text-primary"></i> Borrower & Branch Info
                </h6>
              </div>
              <div className="card-body">
                <table className="table table-borderless table-sm mb-0">
                  <tbody>
                    <tr>
                      <td className="text-muted" style={{ width: '140px' }}>Member Name:</td>
                      <td className="fw-semibold">{loan.memberName}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Member Number:</td>
                      <td><code>{loan.memberNumber}</code></td>
                    </tr>
                    <tr>
                      <td className="text-muted">Society Branch:</td>
                      <td>{loan.branchName}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Member Link:</td>
                      <td>
                        <Link href={`/members/${loan.memberId}`} className="btn btn-link btn-sm p-0 text-decoration-none">
                          View Member Profile <i className="bi bi-arrow-right"></i>
                        </Link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="card h-100">
              <div className="card-header bg-white py-3">
                <h6 className="card-title mb-0 fw-bold text-dark">
                  <i className="bi bi-sliders me-2 text-primary"></i> Contract & Rate Parameters
                </h6>
              </div>
              <div className="card-body">
                <table className="table table-borderless table-sm mb-0">
                  <tbody>
                    <tr>
                      <td className="text-muted" style={{ width: '160px' }}>Loan Product:</td>
                      <td className="fw-semibold">{loan.productName}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Interest Calculation:</td>
                      <td><span className="badge bg-light text-dark border">{loan.interestType}</span></td>
                    </tr>
                    <tr>
                      <td className="text-muted">Interest Rate:</td>
                      <td className="fw-bold text-primary">{loan.interestRate}% p.a.</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Loan Period:</td>
                      <td>{loan.loanPeriod} Months</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Start Date:</td>
                      <td>{formatDate(loan.startDate)}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Maturity Date:</td>
                      <td>{formatDate(loan.maturityDate)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="card">
          <div className="card-header bg-white py-3">
            <h6 className="card-title mb-0 fw-bold text-dark">
              <i className="bi bi-clock-history me-2 text-primary"></i> Audit & Lifecycle Timeline
            </h6>
          </div>
          <div className="card-body">
            {history.length === 0 ? (
              <EmptyState icon="bi-clock" title="No History Available" message="No lifecycle log entries recorded." />
            ) : (
              <div className="timeline position-relative ps-3">
                {history.map((h, idx) => (
                  <div key={idx} className="mb-4 position-relative">
                    <div className="d-flex align-items-center mb-1">
                      <span className="badge bg-primary me-2">{h.action}</span>
                      <small className="text-muted">{formatDate(h.date)}</small>
                    </div>
                    <div className="fw-semibold text-dark">{h.description}</div>
                    <small className="text-muted">Executed by: {h.user}</small>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
