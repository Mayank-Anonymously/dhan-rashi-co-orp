'use client';

import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/common/PageHeader';
import LoadingState from '@/components/common/LoadingState';
import { accountingService } from '@/services/accountingService';
import { BalanceSheetResponse, BalanceSheetSectionItem, LedgerEntry } from '@/types/accounting';
import { formatDate } from '@/utils/helpers';

export default function BalanceSheetPage() {
  const [data, setData] = useState<BalanceSheetResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [asOnDate, setAsOnDate] = useState(new Date().toISOString().split('T')[0]);

  // Drill-down Modal State
  const [drillDownAccount, setDrillDownAccount] = useState<BalanceSheetSectionItem | null>(null);
  const [drillDownEntries, setDrillDownEntries] = useState<LedgerEntry[]>([]);
  const [drillDownLoading, setDrillDownLoading] = useState(false);

  useEffect(() => {
    loadBalanceSheet();
  }, [asOnDate]);

  async function loadBalanceSheet() {
    setLoading(true);
    const res = await accountingService.getBalanceSheet(asOnDate);
    if (res.success && res.data) {
      setData(res.data);
    }
    setLoading(false);
  }

  const handleOpenDrillDown = async (item: BalanceSheetSectionItem) => {
    setDrillDownAccount(item);
    setDrillDownLoading(true);
    const res = await accountingService.getGeneralLedger({ accountId: item.id });
    if (res.success) {
      setDrillDownEntries(res.data);
    }
    setDrillDownLoading(false);
  };

  if (loading || !data) {
    return <LoadingState message="Computing Balance Sheet from transaction ledger..." />;
  }

  return (
    <div>
      <PageHeader
        title="Balance Sheet Report"
        description="Official financial position statement of society Assets, Liabilities, and Equity Capital."
      >
        <div className="d-flex align-items-center gap-2">
          <label className="small fw-semibold text-muted mb-0">Balance Sheet As On:</label>
          <input
            type="date"
            className="form-control form-control-sm"
            style={{ width: '160px' }}
            value={asOnDate}
            onChange={(e) => setAsOnDate(e.target.value)}
          />
        </div>
      </PageHeader>

      {/* Balance Diagnostic Banner */}
      <div className={`alert ${data.status === 'BALANCED' ? 'alert-success border-success' : 'alert-danger border-danger'} p-3 mb-4`}>
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <i className={`bi ${data.status === 'BALANCED' ? 'bi-shield-check text-success fs-2' : 'bi-exclamation-triangle-fill text-danger fs-2'}`}></i>
            <div>
              <h6 className="fw-bold mb-0">
                Accounting Equation Status: {data.status === 'BALANCED' ? 'BALANCED (ASSETS = LIABILITIES + EQUITY)' : 'UNBALANCED DIFFERENCE'}
              </h6>
              <small className="text-muted">{data.diagnostics}</small>
            </div>
          </div>
          <div className="text-end">
            <div className="small text-muted fw-semibold">Balance Sheet Difference</div>
            <div className={`fs-5 fw-bold ${data.status === 'BALANCED' ? 'text-success' : 'text-danger'}`}>
              ₹{data.difference.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Balance Sheet Layout */}
      <div className="row g-4 mb-4">
        {/* ASSETS COLUMN */}
        <div className="col-12 col-lg-6">
          <div className="card h-100 shadow-sm border-0 border-top border-4 border-primary">
            <div className="card-header bg-white py-3 d-flex align-items-center justify-content-between">
              <h5 className="card-title mb-0 fw-bold text-primary">
                <i className="bi bi-wallet2 me-2"></i> ASSETS
              </h5>
              <span className="badge bg-primary-subtle text-primary border">{data.assets.items.length} Accounts</span>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Code</th>
                      <th>Asset Account Name</th>
                      <th className="text-end">Balance (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.assets.items.map((item) => (
                      <tr key={item.id} style={{ cursor: 'pointer' }} onClick={() => handleOpenDrillDown(item)}>
                        <td><code className="fw-bold text-primary">{item.code}</code></td>
                        <td>
                          <span className="fw-semibold text-dark">{item.name}</span>
                          <i className="bi bi-box-arrow-up-right text-muted ms-2 small"></i>
                        </td>
                        <td className="text-end fw-bold text-dark">
                          ₹{item.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card-footer bg-light py-3 d-flex align-items-center justify-content-between fw-bold">
              <span>TOTAL ASSETS</span>
              <span className="fs-5 text-primary">₹{data.assets.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* LIABILITIES & EQUITY COLUMN */}
        <div className="col-12 col-lg-6">
          <div className="card h-100 shadow-sm border-0 border-top border-4 border-success">
            <div className="card-header bg-white py-3 d-flex align-items-center justify-content-between">
              <h5 className="card-title mb-0 fw-bold text-success">
                <i className="bi bi-bank me-2"></i> LIABILITIES & EQUITY
              </h5>
              <span className="badge bg-success-subtle text-success border">Capital & Obligations</span>
            </div>
            <div className="card-body p-0">
              {/* Liabilities Header */}
              <div className="bg-light px-3 py-2 fw-bold text-muted small border-bottom border-top">
                LIABILITIES
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <tbody>
                    {data.liabilities.items.map((item) => (
                      <tr key={item.id} style={{ cursor: 'pointer' }} onClick={() => handleOpenDrillDown(item)}>
                        <td style={{ width: '100px' }}><code className="fw-bold text-danger">{item.code}</code></td>
                        <td>
                          <span className="fw-semibold text-dark">{item.name}</span>
                          <i className="bi bi-box-arrow-up-right text-muted ms-2 small"></i>
                        </td>
                        <td className="text-end fw-bold text-dark">
                          ₹{item.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Equity Header */}
              <div className="bg-light px-3 py-2 fw-bold text-muted small border-bottom border-top">
                EQUITY & CAPITAL RESERVES
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <tbody>
                    {data.equity.capitalItems.map((item) => (
                      <tr key={item.id} style={{ cursor: 'pointer' }} onClick={() => handleOpenDrillDown(item)}>
                        <td style={{ width: '100px' }}><code className="fw-bold text-success">{item.code}</code></td>
                        <td>
                          <span className="fw-semibold text-dark">{item.name}</span>
                          <i className="bi bi-box-arrow-up-right text-muted ms-2 small"></i>
                        </td>
                        <td className="text-end fw-bold text-dark">
                          ₹{item.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                    <tr className="table-info">
                      <td style={{ width: '100px' }}><code>NET-INC</code></td>
                      <td className="fw-semibold">Current Period Retained Net Surplus</td>
                      <td className="text-end fw-bold text-info">
                        ₹{data.equity.netSurplusCurrentPeriod.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card-footer bg-light py-3 d-flex align-items-center justify-content-between fw-bold">
              <span>TOTAL LIABILITIES & EQUITY</span>
              <span className="fs-5 text-success">₹{data.totalLiabilitiesAndEquity.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Account Drill-Down Modal */}
      {drillDownAccount && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
          <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1055 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    Drill-Down: <code>{drillDownAccount.code}</code> — {drillDownAccount.name}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setDrillDownAccount(null)}></button>
                </div>
                <div className="modal-body p-0">
                  {drillDownLoading ? (
                    <LoadingState message="Fetching underlying transactions..." />
                  ) : drillDownEntries.length === 0 ? (
                    <div className="p-4 text-center text-muted">No underlying transactions found for this account.</div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Date</th>
                            <th>Txn Reference</th>
                            <th>Description</th>
                            <th className="text-end">Debit (₹)</th>
                            <th className="text-end">Credit (₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {drillDownEntries.map((e) => (
                            <tr key={e.id}>
                              <td>{formatDate(e.entryDate)}</td>
                              <td><code>{e.transactionNumber}</code></td>
                              <td>{e.description}</td>
                              <td className="text-end fw-bold text-primary">
                                {e.debit > 0 ? `₹${e.debit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                              </td>
                              <td className="text-end fw-bold text-success">
                                {e.credit > 0 ? `₹${e.credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setDrillDownAccount(null)}>
                    Close Traceability View
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
