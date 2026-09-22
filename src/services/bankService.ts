import { ServiceResponse } from '@/types/common';
import { BankAccount, CashAccount, ReconciliationWorkspace } from '@/types/bank';
import { simulateDelay } from '@/utils/helpers';

const API_BASE = 'http://localhost:5000/api/banking';

export const bankService = {
  async getBankAccounts(): Promise<ServiceResponse<BankAccount[]>> {
    try {
      const res = await fetch(`${API_BASE}/bank-accounts`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch {
      // Fallback
    }
    await simulateDelay();
    return {
      success: true,
      data: [
        { id: 'bnk_01', bankName: 'State Bank of India', accountNumber: 'SBI-98765432101', accountName: 'Dhan Rashi Society SBI Main Account', accountCode: '1100', ifscCode: 'SBIN0001234', branchId: 'br_01', branchName: 'Head Office Dwarka', openingBalance: 500000, bookBalance: 400000, statementBalance: 400000, status: 'Active' },
      ],
    };
  },

  async getCashAccounts(): Promise<ServiceResponse<CashAccount[]>> {
    try {
      const res = await fetch(`${API_BASE}/cash-accounts`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch {
      // Fallback
    }
    await simulateDelay();
    return {
      success: true,
      data: [
        { id: 'csh_01', accountName: 'Main Cash Vault Account', accountCode: '1000', branchId: 'br_01', branchName: 'Head Office Dwarka', openingBalance: 100000, currentBalance: 101500, status: 'Active' },
      ],
    };
  },

  async createBankAccount(data: Partial<BankAccount>): Promise<ServiceResponse<BankAccount>> {
    try {
      const res = await fetch(`${API_BASE}/bank-accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch {
      // Fallback
    }
    await simulateDelay();
    const newBank: BankAccount = {
      id: `bnk_${Date.now()}`,
      bankName: data.bankName || 'New Bank',
      accountNumber: data.accountNumber || `ACC-${Date.now()}`,
      accountName: data.accountName || 'Society Account',
      accountCode: data.accountCode || '1100',
      ifscCode: data.ifscCode || 'IFSC0001234',
      branchId: data.branchId || 'br_01',
      branchName: 'Head Office Dwarka',
      openingBalance: Number(data.openingBalance) || 0,
      bookBalance: Number(data.openingBalance) || 0,
      statementBalance: Number(data.openingBalance) || 0,
      status: 'Active',
    };
    return { success: true, data: newBank, message: 'Bank account added successfully.' };
  },

  async importBankStatementCSV(bankAccountId: string, rows: any[]): Promise<ServiceResponse<{ importedCount: number; duplicateCount: number; statementBalance: number }>> {
    try {
      const res = await fetch(`${API_BASE}/import-statement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankAccountId, rows }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch {
      // Fallback
    }

    await simulateDelay();
    return {
      success: true,
      data: { importedCount: rows.length, duplicateCount: 0, statementBalance: 400000 },
      message: `Imported ${rows.length} transactions successfully.`,
    };
  },

  async getReconciliationWorkspace(bankAccountId?: string): Promise<ServiceResponse<ReconciliationWorkspace>> {
    try {
      const queryStr = bankAccountId ? `?bankAccountId=${bankAccountId}` : '';
      const res = await fetch(`${API_BASE}/reconciliation${queryStr}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch {
      // Fallback
    }

    await simulateDelay();
    return {
      success: true,
      data: {
        bank: { id: 'bnk_01', bankName: 'State Bank of India', accountNumber: 'SBI-98765432101', accountName: 'Dhan Rashi Society SBI Main Account', accountCode: '1100', ifscCode: 'SBIN0001234', branchId: 'br_01', branchName: 'Head Office Dwarka', openingBalance: 500000, bookBalance: 400000, statementBalance: 400000, status: 'Active' },
        bookBalance: 400000,
        statementBalance: 400000,
        difference: 0,
        status: 'RECONCILED',
        unmatchedCount: 1,
        matchedCount: 2,
        statementTransactions: [
          { id: 'bt_01', bankAccountId: 'bnk_01', bankAccountNumber: 'SBI-98765432101', transactionDate: '2024-01-15', referenceNumber: 'REF-ORD-001', description: 'CLG/SHARE SUBSCRIPTION/RAMESH GUPTA', withdrawalAmount: 0, depositAmount: 1000, statementBalance: 501000, reconciliationStatus: 'MATCHED', matchedTransactionNumber: 'TXN-2024-000002' },
          { id: 'bt_02', bankAccountId: 'bnk_01', bankAccountNumber: 'SBI-98765432101', transactionDate: '2024-03-05', referenceNumber: 'LN-100001', description: 'NEFT/LOAN DISBURSEMENT/RAMESH GUPTA', withdrawalAmount: 100000, depositAmount: 0, statementBalance: 401000, reconciliationStatus: 'MATCHED', matchedTransactionNumber: 'TXN-2024-000003' },
          { id: 'bt_03', bankAccountId: 'bnk_01', bankAccountNumber: 'SBI-98765432101', transactionDate: '2024-03-10', referenceNumber: 'CHQ-554411', description: 'BANK SERVICE CHARGES AND SMS ALERT', withdrawalAmount: 1000, depositAmount: 0, statementBalance: 400000, reconciliationStatus: 'UNMATCHED' },
        ],
        bookTransactions: [],
      },
    };
  },

  async runAutoMatching(bankAccountId: string): Promise<ServiceResponse<{ matchCount: number }>> {
    try {
      const res = await fetch(`${API_BASE}/auto-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankAccountId }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch {
      // Fallback
    }

    await simulateDelay();
    return { success: true, data: { matchCount: 2 }, message: 'Auto-matching completed.' };
  },
};
