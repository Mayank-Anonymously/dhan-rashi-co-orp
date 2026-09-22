'use client';

import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/common/PageHeader';
import LoadingState from '@/components/common/LoadingState';
import { accountingService } from '@/services/accountingService';
import { TrialBalanceResponse } from '@/types/accounting';
import { formatDate } from '@/utils/helpers';

export default function TrialBalancePage() {
  const [data, setData] = useState<TrialBalanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [asOnDate, setAsOnDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadTrialBalance();
  }, [asOnDate]);

  async function loadTrialBalance() {
    setLoading(true);
    const res = await accountingService.getTrialBalance(asOnDate);
    if (res.success && res.data) {
      setData(res.data);
    }
    setLoading(false);
  }

  if (loading || !data) {
    return <LoadingState message="Calculating Trial Balance from ledger transactions..." />;
  }

  return (
    <div>
      <PageHeader
        title="Trial Balance Report"
        description="Verification statement ensuring total debit balances equal total credit balances across all society ledger accounts."
      >
        <div className="d-flex align-items-center gap-2">
          <label className="small fw-semibold text-muted mb-0">As On Date:</label>
          <input
            type="date"
            className="form-control form-control-sm"
            style={{ width: '160px' }}
            value={asOnDate}
            onChange={(e) => setAsOnDate(e.target.value)}
          />
        </div>
      </PageHeader>

      {/* Trial Balance Status Indicator Banner */}
      <div className={`alert ${data.status === 'BALANCED' ? 'alert-success border-success' : 'alert-danger border-danger'} d-flex align-items-center justify-content-between p-3 mb-4`}>
        <div className="d-flex align-items-center gap-3">
          <i className={`bi ${data.status === 'BALANCED' ? 'bi-check-circle-fill text-success fs-2' : 'bi-exclamation-triangle-fill text-danger fs-2'}`}></i>
          <div>
            <h6 className="fw-bold mb-0">
              Trial Balance Status: {data.status === 'BALANCED' ? 'PERFECTLY BALANCED' : 'UNBALANCED DIFFERENCE DETECTED'}
            </h6>
            <small className="text-muted">
              {data.status === 'BALANCED'
                ? `Total Debit (₹${data.totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}) matches Total Credit exactly as of ${formatDate(data.asOnDate)}.`
                : `Unbalanced difference of ₹${Math.abs(data.difference).toLocaleString('en-IN', { minimumFractionDigits: 2 })} found. Check unposted vouchers.`}
            </small>
          </div>
        </div>

        <div className="text-end">
          <div className="small text-muted fw-semibold">Net Difference</div>
          <div className={`fs-5 fw-bold ${data.status === 'BALANCED' ? 'text-success' : 'text-danger'}`}>
            ₹{data.difference.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Trial Balance Table */}
      <div className="card">
        <div className="card-header bg-white py-3">
          <h6 className="card-title mb-0 fw-bold text-dark">
            <i className="bi bi-calculator me-2 text-primary"></i> Account Debit & Credit Totals
          </h6>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '120px' }}>Code</th>
                  <th>Account Name</th>
                  <th>Account Type</th>
                  <th className="text-end">Debit Balance (₹)</th>
                  <th className="text-end">Credit Balance (₹)</th>
                </tr>
              </thead>
              <tbody>
                {data.accounts.map((acc) => (
                  <tr key={acc.id}>
                    <td><code className="fw-bold">{acc.code}</code></td>
                    <td className="fw-semibold">{acc.name}</td>
                    <td>
                      <span className="badge bg-light text-dark border">{acc.type}</span>
                    </td>
                    <td className="text-end fw-bold text-primary">
                      {acc.debit > 0 ? `₹${acc.debit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td className="text-end fw-bold text-success">
                      {acc.credit > 0 ? `₹${acc.credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="table-dark">
                <tr>
                  <td colSpan={3} className="fw-bold fs-6">TOTALS</td>
                  <td className="text-end fw-bold fs-6 text-white">
                    ₹{data.totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="text-end fw-bold fs-6 text-white">
                    ₹{data.totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
