'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import LoadingState from '@/components/common/LoadingState';
import { bankService } from '@/services/bankService';
import { BankAccount } from '@/types/bank';

export default function BankStatementImportPage() {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedBankId, setSelectedBankId] = useState('');
  const [loading, setLoading] = useState(true);

  // CSV Import Form
  const [csvContent, setCsvContent] = useState(
`Date,Description,ReferenceNumber,Withdrawal,Deposit,Balance
2024-03-15,NEFT/MEMBER DEPOSIT/RAMESH GUPTA,REF-DEP-001,0,5000,405000
2024-03-18,CHQ-987123/OFFICE SUPPLIES,CHQ-987123,2500,0,402500
2024-03-20,BANK INTEREST CREDIT,INT-2024-Q1,0,1500,404000`
  );

  const [importing, setImporting] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  useEffect(() => {
    loadBanks();
  }, []);

  async function loadBanks() {
    setLoading(true);
    const res = await bankService.getBankAccounts();
    if (res.success && res.data.length > 0) {
      setBankAccounts(res.data);
      setSelectedBankId(res.data[0].id || res.data[0]._id || '');
    }
    setLoading(false);
  }

  const parseCSV = (text: string) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const dateIdx = headers.findIndex((h) => h.includes('date'));
    const descIdx = headers.findIndex((h) => h.includes('desc') || h.includes('particular'));
    const refIdx = headers.findIndex((h) => h.includes('ref') || h.includes('cheque') || h.includes('utr'));
    const drIdx = headers.findIndex((h) => h.includes('withdrawal') || h.includes('debit') || h.includes('dr'));
    const crIdx = headers.findIndex((h) => h.includes('deposit') || h.includes('credit') || h.includes('cr'));
    const balIdx = headers.findIndex((h) => h.includes('balance'));

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim());
      if (parts.length >= 2) {
        rows.push({
          date: parts[dateIdx >= 0 ? dateIdx : 0] || new Date().toISOString().split('T')[0],
          description: parts[descIdx >= 0 ? descIdx : 1] || 'Bank transaction',
          referenceNumber: refIdx >= 0 ? parts[refIdx] : '',
          withdrawal: drIdx >= 0 ? Number(parts[drIdx]) || 0 : 0,
          deposit: crIdx >= 0 ? Number(parts[crIdx]) || 0 : 0,
          balance: balIdx >= 0 ? Number(parts[balIdx]) || 0 : 0,
        });
      }
    }
    return rows;
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertMsg(null);

    const parsed = parseCSV(csvContent);
    if (parsed.length === 0) {
      setAlertMsg({ type: 'danger', text: 'No valid CSV rows parsed. Check CSV column format.' });
      return;
    }

    setImporting(true);
    const res = await bankService.importBankStatementCSV(selectedBankId, parsed);
    setImporting(false);

    if (res.success) {
      setAlertMsg({ type: 'success', text: res.message || `Imported ${parsed.length} transactions successfully.` });
    } else {
      setAlertMsg({ type: 'danger', text: res.message || 'Failed to import CSV statement.' });
    }
  };

  const previewRows = parseCSV(csvContent);

  return (
    <div>
      <PageHeader
        title="Import Bank Statement CSV"
        description="Upload and parse bank CSV statements with automatic duplicate protection fingerprinting."
      >
        <Link href="/banking/reconciliation" className="btn btn-outline-primary btn-sm">
          <i className="bi bi-arrow-repeat me-1"></i> Open Reconciliation Workspace
        </Link>
      </PageHeader>

      {alertMsg && (
        <div className={`alert alert-${alertMsg.type} alert-dismissible fade show mb-4`} role="alert">
          {alertMsg.text}
          <button type="button" className="btn-close" onClick={() => setAlertMsg(null)}></button>
        </div>
      )}

      {loading ? (
        <LoadingState message="Loading bank accounts..." />
      ) : (
        <div className="row g-4">
          <div className="col-12 col-lg-5">
            <div className="card h-100">
              <div className="card-header bg-white py-3">
                <h6 className="card-title mb-0 fw-bold text-dark">
                  <i className="bi bi-upload me-2 text-primary"></i> Select Bank & Paste CSV Content
                </h6>
              </div>
              <div className="card-body">
                <form onSubmit={handleImport}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Target Bank Account *</label>
                    <select
                      className="form-select form-select-sm"
                      value={selectedBankId}
                      onChange={(e) => setSelectedBankId(e.target.value)}
                      required
                    >
                      {bankAccounts.map((b) => (
                        <option key={b.id || b._id} value={b.id || b._id}>
                          {b.bankName} — {b.accountNumber} ({b.accountName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">CSV File Raw Data *</label>
                    <textarea
                      className="form-control form-control-sm font-monospace"
                      rows={10}
                      value={csvContent}
                      onChange={(e) => setCsvContent(e.target.value)}
                      required
                    ></textarea>
                    <small className="text-muted d-block mt-1">
                      Required Columns: <code>Date, Description, ReferenceNumber, Withdrawal, Deposit, Balance</code>
                    </small>
                  </div>

                  <button type="submit" className="btn btn-primary btn-sm w-100" disabled={importing}>
                    {importing ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                        Parsing & Importing...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-cloud-arrow-up me-1"></i> Import Statement & Run Duplicate Protection
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-7">
            <div className="card h-100">
              <div className="card-header bg-white py-3 d-flex align-items-center justify-content-between">
                <h6 className="card-title mb-0 fw-bold text-dark">
                  <i className="bi bi-eye me-2 text-primary"></i> CSV Parsed Transactions Preview ({previewRows.length})
                </h6>
                <span className="badge bg-light text-dark border">Normalised Data</span>
              </div>
              <div className="card-body p-0">
                {previewRows.length === 0 ? (
                  <div className="p-4 text-center text-muted">Paste valid CSV content to view live parsed preview.</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Date</th>
                          <th>Ref No</th>
                          <th>Description</th>
                          <th className="text-end">Withdrawal</th>
                          <th className="text-end">Deposit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.map((row, idx) => (
                          <tr key={idx}>
                            <td>{row.date}</td>
                            <td><code>{row.referenceNumber || '—'}</code></td>
                            <td>{row.description}</td>
                            <td className="text-end text-danger fw-bold">
                              {row.withdrawal > 0 ? `₹${row.withdrawal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                            </td>
                            <td className="text-end text-success fw-bold">
                              {row.deposit > 0 ? `₹${row.deposit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
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
        </div>
      )}
    </div>
  );
}
