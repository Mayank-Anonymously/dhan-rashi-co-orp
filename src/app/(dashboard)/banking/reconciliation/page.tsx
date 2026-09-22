'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import LoadingState from '@/components/common/LoadingState';
import StatusBadge from '@/components/common/StatusBadge';
import { bankService } from '@/services/bankService';
import { ReconciliationWorkspace } from '@/types/bank';
import { formatDate } from '@/utils/helpers';

export default function BankReconciliationPage() {
  const [workspace, setWorkspace] = useState<ReconciliationWorkspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoMatching, setAutoMatching] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  useEffect(() => {
    loadWorkspace();
  }, []);

  async function loadWorkspace() {
    setLoading(true);
    const res = await bankService.getReconciliationWorkspace();
    if (res.success && res.data) {
      setWorkspace(res.data);
    }
    setLoading(false);
  }

  const handleRunAutoMatch = async () => {
    if (!workspace) return;
    setAutoMatching(true);
    setAlertMsg(null);
    const res = await bankService.runAutoMatching(workspace.bank.id || workspace.bank._id || '');
    setAutoMatching(false);

    if (res.success) {
      setAlertMsg({ type: 'success', text: res.message || 'Automated reconciliation matching completed.' });
      loadWorkspace();
    } else {
      setAlertMsg({ type: 'danger', text: res.message || 'Auto-matching failed.' });
    }
  };

  if (loading || !workspace) {
    return <LoadingState message="Loading bank reconciliation workspace..." />;
  }

  return (
    <div>
      <PageHeader
        title="Bank Reconciliation Workspace"
        description="Reconcile internal accounting book balances with external bank statement transactions."
      >
        <button className="btn btn-primary btn-sm me-2" onClick={handleRunAutoMatch} disabled={autoMatching}>
          {autoMatching ? (
            <>
              <span className="spinner-border spinner-border-sm me-1" role="status"></span>
              Matching...
            </>
          ) : (
            <>
              <i className="bi bi-lightning-charge me-1"></i> Run Auto-Match Engine
            </>
          )}
        </button>
        <Link href="/banking/import" className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-upload me-1"></i> Import Statement CSV
        </Link>
      </PageHeader>

      {alertMsg && (
        <div className={`alert alert-${alertMsg.type} alert-dismissible fade show mb-4`} role="alert">
          {alertMsg.text}
          <button type="button" className="btn-close" onClick={() => setAlertMsg(null)}></button>
        </div>
      )}

      {/* Reconciliation Difference & Balance Summary */}
      <div className={`alert ${workspace.status === 'RECONCILED' ? 'alert-success border-success' : 'alert-warning border-warning'} p-3 mb-4`}>
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <i className={`bi ${workspace.status === 'RECONCILED' ? 'bi-check-circle-fill text-success fs-2' : 'bi-exclamation-triangle-fill text-warning fs-2'}`}></i>
            <div>
              <h6 className="fw-bold mb-0">
                Reconciliation Status: {workspace.status === 'RECONCILED' ? 'FULLY RECONCILED' : 'RECONCILIATION DIFFERENCE PENDING'}
              </h6>
              <small className="text-muted">
                Target Bank Account: <strong className="text-dark">{workspace.bank.bankName} — {workspace.bank.accountNumber}</strong>
              </small>
            </div>
          </div>

          <div className="d-flex align-items-center gap-4 text-end">
            <div>
              <div className="small text-muted fw-semibold">Book Balance</div>
              <div className="fs-5 fw-bold text-primary">₹{workspace.bookBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </div>
            <div>
              <div className="small text-muted fw-semibold">Statement Balance</div>
              <div className="fs-5 fw-bold text-success">₹{workspace.statementBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </div>
            <div>
              <div className="small text-muted fw-semibold">Difference</div>
              <div className={`fs-5 fw-bold ${workspace.difference === 0 ? 'text-success' : 'text-danger'}`}>
                ₹{workspace.difference.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Unmatched Bank Statement Transactions */}
      <div className="card mb-4">
        <div className="card-header bg-white py-3 d-flex align-items-center justify-content-between">
          <h6 className="card-title mb-0 fw-bold text-dark">
            <i className="bi bi-list-check me-2 text-primary"></i> Statement Transactions ({workspace.statementTransactions.length})
          </h6>
          <span className="badge bg-light text-dark border">
            Unmatched: {workspace.unmatchedCount} | Matched: {workspace.matchedCount}
          </span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Ref Number</th>
                  <th>Statement Description</th>
                  <th className="text-end">Withdrawal (DR)</th>
                  <th className="text-end">Deposit (CR)</th>
                  <th>Match Status</th>
                  <th>Linked Book Txn</th>
                </tr>
              </thead>
              <tbody>
                {workspace.statementTransactions.map((t) => (
                  <tr key={t.id || t._id}>
                    <td>{formatDate(t.transactionDate)}</td>
                    <td><code>{t.referenceNumber || '—'}</code></td>
                    <td className="fw-semibold">{t.description}</td>
                    <td className="text-end text-danger fw-bold">
                      {t.withdrawalAmount > 0 ? `₹${t.withdrawalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td className="text-end text-success fw-bold">
                      {t.depositAmount > 0 ? `₹${t.depositAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td>
                      <StatusBadge status={t.reconciliationStatus} />
                    </td>
                    <td>
                      {t.matchedTransactionNumber ? (
                        <code className="fw-bold text-primary">{t.matchedTransactionNumber}</code>
                      ) : (
                        <span className="text-muted small">Unlinked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
