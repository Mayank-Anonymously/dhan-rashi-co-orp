'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/common/StatusBadge';
import LoadingState from '@/components/common/LoadingState';
import EmptyState from '@/components/common/EmptyState';
import { shareService } from '@/services/shareService';
import { ShareAccount, ShareTransaction } from '@/types/share';
import { formatDate } from '@/utils/helpers';

export default function ShareAccountDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [account, setAccount] = useState<ShareAccount | null>(null);
  const [transactions, setTransactions] = useState<ShareTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions'>('overview');

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      const res = await shareService.getShareAccountDetails(id);
      if (isMounted && res.success && res.data) {
        setAccount(res.data.account);
        setTransactions(res.data.transactions);
      }
      if (isMounted) setLoading(false);
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) return <LoadingState message="Loading share account details..." />;

  if (!account) {
    return (
      <EmptyState icon="bi-pie-chart" title="Share Account Not Found" message="The requested share account record could not be found.">
        <Link href="/shares" className="btn btn-primary btn-sm mt-2">
          Back to Shares Directory
        </Link>
      </EmptyState>
    );
  }

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <Link href="/shares" className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-arrow-left me-1"></i> Back to Share Accounts
        </Link>
      </div>

      {/* Share Account Header Card */}
      <div className="profile-header d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div className="d-flex align-items-center gap-3">
          <div className="profile-avatar bg-success">
            <i className="bi bi-pie-chart-fill"></i>
          </div>
          <div>
            <h4 className="fw-bold mb-1">{account.accountNumber}</h4>
            <div className="d-flex flex-wrap align-items-center gap-2">
              <span className="fw-semibold text-dark">{account.memberName}</span>
              <span className="text-muted">•</span>
              <span className="text-muted">{account.branchName}</span>
              <span className="text-muted">•</span>
              <StatusBadge status={account.status} />
            </div>
          </div>
        </div>

        <div className="d-flex flex-wrap gap-4 text-end">
          <div>
            <div className="detail-label">Total Shares</div>
            <div className="fw-bold fs-5 text-primary">{account.totalShares}</div>
          </div>
          <div>
            <div className="detail-label">Face Value</div>
            <div className="fw-semibold">₹{account.faceValue.toFixed(2)}</div>
          </div>
          <div>
            <div className="detail-label">Total Capital Value</div>
            <div className="fw-bold fs-5 text-success">
              ₹{account.totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="bi bi-grid me-1"></i> Account Overview
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            <i className="bi bi-clock-history me-1"></i> Share Transactions ({transactions.length})
          </button>
        </li>
      </ul>

      {activeTab === 'overview' ? (
        <div className="card">
          <div className="card-header bg-light">Holdings & Account Information</div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-12 col-sm-6 col-md-3">
                <div className="detail-label">Share Account Number</div>
                <div className="detail-value"><code>{account.accountNumber}</code></div>
              </div>
              <div className="col-12 col-sm-6 col-md-3">
                <div className="detail-label">Member Name</div>
                <div className="detail-value fw-semibold">{account.memberName}</div>
              </div>
              <div className="col-12 col-sm-6 col-md-3">
                <div className="detail-label">Branch Location</div>
                <div className="detail-value">{account.branchName}</div>
              </div>
              <div className="col-12 col-sm-6 col-md-3">
                <div className="detail-label">Account Status</div>
                <div><StatusBadge status={account.status} /></div>
              </div>

              <div className="col-12 col-sm-6 col-md-3">
                <div className="detail-label">Total Holdings</div>
                <div className="detail-value fw-bold">{account.totalShares} Shares</div>
              </div>
              <div className="col-12 col-sm-6 col-md-3">
                <div className="detail-label">Face Value per Share</div>
                <div className="detail-value">₹{account.faceValue.toFixed(2)}</div>
              </div>
              <div className="col-12 col-sm-6 col-md-3">
                <div className="detail-label">Total Capital Value</div>
                <div className="detail-value text-success fw-bold">
                  ₹{account.totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Transactions Tab */
        <div className="card">
          <div className="card-header bg-light">Share Transaction Ledger</div>
          <div className="card-body p-0">
            {transactions.length === 0 ? (
              <p className="text-muted p-3 mb-0">No transactions recorded.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Transaction Type</th>
                      <th>Reference No</th>
                      <th className="text-center">Shares</th>
                      <th className="text-end">Face Value</th>
                      <th className="text-end">Total Amount</th>
                      <th>Created By</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => (
                      <tr key={t.id}>
                        <td>{formatDate(t.date)}</td>
                        <td>
                          <span className="badge bg-success bg-opacity-10 text-success border border-success">
                            {t.type}
                          </span>
                        </td>
                        <td><code>{t.referenceNumber}</code></td>
                        <td className="text-center fw-bold">{t.shares}</td>
                        <td className="text-end">₹{t.faceValue.toFixed(2)}</td>
                        <td className="text-end fw-bold">
                          ₹{t.totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td><small className="text-muted">{t.createdBy}</small></td>
                        <td><small className="text-muted">{t.remarks || '—'}</small></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
