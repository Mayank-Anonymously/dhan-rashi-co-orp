import { ServiceResponse } from '@/types/common';
import { ChartOfAccount, LedgerEntry, TrialBalanceResponse, BalanceSheetResponse } from '@/types/accounting';
import { simulateDelay } from '@/utils/helpers';

const API_BASE = 'http://localhost:5000/api/accounting';

// Fallback Chart of Accounts
const fallbackCOA: ChartOfAccount[] = [
  { id: 'coa_1000', code: '1000', name: 'Cash in Hand', type: 'ASSET', openingBalance: 100000, openingBalanceType: 'DR', isSystemAccount: true, status: 'Active', description: 'Main cash vault balance' },
  { id: 'coa_1100', code: '1100', name: 'State Bank of India - Main A/c', type: 'ASSET', openingBalance: 500000, openingBalanceType: 'DR', isSystemAccount: true, status: 'Active', description: 'SBI primary operational account' },
  { id: 'coa_1200', code: '1200', name: 'HDFC Bank - Operating A/c', type: 'ASSET', openingBalance: 250000, openingBalanceType: 'DR', isSystemAccount: true, status: 'Active', description: 'HDFC secondary account' },
  { id: 'coa_1300', code: '1300', name: 'Loans & Advances Receivable', type: 'ASSET', openingBalance: 100000, openingBalanceType: 'DR', isSystemAccount: true, status: 'Active', description: 'Member loan principal receivables' },
  { id: 'coa_2000', code: '2000', name: 'Member Fixed & Savings Deposits', type: 'LIABILITY', openingBalance: 250000, openingBalanceType: 'CR', isSystemAccount: true, status: 'Active', description: 'Member deposit liabilities' },
  { id: 'coa_3000', code: '3000', name: 'Member Share Capital', type: 'EQUITY', openingBalance: 600000, openingBalanceType: 'CR', isSystemAccount: true, status: 'Active', description: 'Total member share capital pool' },
  { id: 'coa_3100', code: '3100', name: 'Statutory Reserve Fund', type: 'EQUITY', openingBalance: 0, openingBalanceType: 'CR', isSystemAccount: true, status: 'Active', description: 'Cooperative statutory reserve' },
  { id: 'coa_4000', code: '4000', name: 'Interest Income on Loans', type: 'INCOME', openingBalance: 0, openingBalanceType: 'CR', isSystemAccount: true, status: 'Active', description: 'Loan interest earned' },
  { id: 'coa_4100', code: '4100', name: 'Processing & Loan Charges Income', type: 'INCOME', openingBalance: 0, openingBalanceType: 'CR', isSystemAccount: true, status: 'Active', description: 'Fee and documentation charges' },
  { id: 'coa_5000', code: '5000', name: 'Operating & Administrative Expenses', type: 'EXPENSE', openingBalance: 0, openingBalanceType: 'DR', isSystemAccount: true, status: 'Active', description: 'Rent, electricity, software & office exp' },
];

export const accountingService = {
  // Chart of Accounts
  async getChartOfAccounts(): Promise<ServiceResponse<ChartOfAccount[]>> {
    try {
      const res = await fetch(`${API_BASE}/chart-of-accounts`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch {
      // Fallback
    }
    await simulateDelay();
    return { success: true, data: [...fallbackCOA] };
  },

  async createChartOfAccount(data: Partial<ChartOfAccount>): Promise<ServiceResponse<ChartOfAccount>> {
    try {
      const res = await fetch(`${API_BASE}/chart-of-accounts`, {
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
    const newCoa: ChartOfAccount = {
      id: `coa_${Date.now()}`,
      code: data.code || '9999',
      name: data.name || 'Custom Ledger Account',
      type: data.type || 'ASSET',
      openingBalance: Number(data.openingBalance) || 0,
      openingBalanceType: data.openingBalanceType || 'DR',
      status: 'Active',
      description: data.description || '',
    };
    fallbackCOA.push(newCoa);
    return { success: true, data: newCoa, message: 'Chart of Account created successfully.' };
  },

  // General Ledger
  async getGeneralLedger(filters?: { search?: string; accountId?: string; branchId?: string; fromDate?: string; toDate?: string }): Promise<ServiceResponse<LedgerEntry[]>> {
    try {
      let queryStr = '';
      if (filters) {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.accountId) params.append('accountId', filters.accountId);
        if (filters.branchId) params.append('branchId', filters.branchId);
        if (filters.fromDate) params.append('fromDate', filters.fromDate);
        if (filters.toDate) params.append('toDate', filters.toDate);
        queryStr = `?${params.toString()}`;
      }
      const res = await fetch(`${API_BASE}/ledger${queryStr}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch {
      // Fallback
    }

    await simulateDelay();
    const mockLedger: LedgerEntry[] = [
      { id: 'le_01', transactionId: 'txn_01', transactionNumber: 'TXN-2024-000001', accountId: 'coa_1100', accountCode: '1100', accountName: 'State Bank of India - Main A/c', entryDate: '2024-01-01', branchId: 'br_01', branchName: 'Head Office Dwarka', debit: 500000, credit: 0, description: 'Opening SBI Bank Fund Allocation', sourceModule: 'OPENING_BALANCE' },
      { id: 'le_02', transactionId: 'txn_01', transactionNumber: 'TXN-2024-000001', accountId: 'coa_1000', accountCode: '1000', accountName: 'Cash in Hand', entryDate: '2024-01-01', branchId: 'br_01', branchName: 'Head Office Dwarka', debit: 100000, credit: 0, description: 'Opening Cash in Hand', sourceModule: 'OPENING_BALANCE' },
      { id: 'le_03', transactionId: 'txn_01', transactionNumber: 'TXN-2024-000001', accountId: 'coa_3000', accountCode: '3000', accountName: 'Member Share Capital', entryDate: '2024-01-01', branchId: 'br_01', branchName: 'Head Office Dwarka', debit: 0, credit: 600000, description: 'Opening Share Capital Reserves', sourceModule: 'OPENING_BALANCE' },
      { id: 'le_04', transactionId: 'txn_02', transactionNumber: 'TXN-2024-000002', accountId: 'coa_1100', accountCode: '1100', accountName: 'State Bank of India - Main A/c', entryDate: '2024-01-15', branchId: 'br_01', branchName: 'Head Office Dwarka', debit: 1000, credit: 0, description: 'Bank receipt for share subscription', sourceModule: 'SHARES' },
      { id: 'le_05', transactionId: 'txn_02', transactionNumber: 'TXN-2024-000002', accountId: 'coa_3000', accountCode: '3000', accountName: 'Member Share Capital', entryDate: '2024-01-15', branchId: 'br_01', branchName: 'Head Office Dwarka', debit: 0, credit: 1000, description: 'Share Capital Allotted SA-100001', sourceModule: 'SHARES' },
      { id: 'le_06', transactionId: 'txn_03', transactionNumber: 'TXN-2024-000003', accountId: 'coa_1300', accountCode: '1300', accountName: 'Loans & Advances Receivable', entryDate: '2024-03-05', branchId: 'br_01', branchName: 'Head Office Dwarka', debit: 100000, credit: 0, description: 'Loan Principal Receivable created LN-100001', sourceModule: 'LOAN_DISBURSEMENT' },
      { id: 'le_07', transactionId: 'txn_03', transactionNumber: 'TXN-2024-000003', accountId: 'coa_1100', accountCode: '1100', accountName: 'State Bank of India - Main A/c', entryDate: '2024-03-05', branchId: 'br_01', branchName: 'Head Office Dwarka', debit: 0, credit: 100000, description: 'Bank payout for Loan Disbursement LN-100001', sourceModule: 'LOAN_DISBURSEMENT' },
    ];
    return { success: true, data: mockLedger };
  },

  // Post Journal Voucher
  async postJournalTransaction(data: { description: string; entries: { accountId: string; accountCode: string; accountName: string; debit: number; credit: number; description?: string }[] }): Promise<ServiceResponse<any>> {
    try {
      const res = await fetch(`${API_BASE}/journal`, {
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
    return { success: true, data: null, message: 'Journal voucher posted successfully.' };
  },

  // Trial Balance
  async getTrialBalance(asOnDate?: string): Promise<ServiceResponse<TrialBalanceResponse>> {
    try {
      const queryStr = asOnDate ? `?asOnDate=${asOnDate}` : '';
      const res = await fetch(`${API_BASE}/trial-balance${queryStr}`);
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
        asOnDate: asOnDate || new Date().toISOString().split('T')[0],
        accounts: [
          { id: 'coa_1000', code: '1000', name: 'Cash in Hand', type: 'ASSET', debit: 100000, credit: 0 },
          { id: 'coa_1100', code: '1100', name: 'State Bank of India - Main A/c', type: 'ASSET', debit: 401000, credit: 0 },
          { id: 'coa_1200', code: '1200', name: 'HDFC Bank - Operating A/c', type: 'ASSET', debit: 250000, credit: 0 },
          { id: 'coa_1300', code: '1300', name: 'Loans & Advances Receivable', type: 'ASSET', debit: 100000, credit: 0 },
          { id: 'coa_2000', code: '2000', name: 'Member Fixed & Savings Deposits', type: 'LIABILITY', debit: 0, credit: 250000 },
          { id: 'coa_3000', code: '3000', name: 'Member Share Capital', type: 'EQUITY', debit: 0, credit: 601000 },
        ],
        totalDebit: 851000,
        totalCredit: 851000,
        difference: 0,
        status: 'BALANCED',
      },
    };
  },

  // Balance Sheet
  async getBalanceSheet(asOnDate?: string): Promise<ServiceResponse<BalanceSheetResponse>> {
    try {
      const queryStr = asOnDate ? `?asOnDate=${asOnDate}` : '';
      const res = await fetch(`${API_BASE}/balance-sheet${queryStr}`);
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
        asOnDate: asOnDate || new Date().toISOString().split('T')[0],
        assets: {
          items: [
            { id: 'coa_1000', code: '1000', name: 'Cash in Hand', type: 'ASSET', debit: 100000, credit: 0, balance: 100000 },
            { id: 'coa_1100', code: '1100', name: 'State Bank of India - Main A/c', type: 'ASSET', debit: 401000, credit: 0, balance: 401000 },
            { id: 'coa_1200', code: '1200', name: 'HDFC Bank - Operating A/c', type: 'ASSET', debit: 250000, credit: 0, balance: 250000 },
            { id: 'coa_1300', code: '1300', name: 'Loans & Advances Receivable', type: 'ASSET', debit: 100000, credit: 0, balance: 100000 },
          ],
          total: 851000,
        },
        liabilities: {
          items: [
            { id: 'coa_2000', code: '2000', name: 'Member Fixed & Savings Deposits', type: 'LIABILITY', debit: 0, credit: 250000, balance: 250000 },
          ],
          total: 250000,
        },
        equity: {
          capitalItems: [
            { id: 'coa_3000', code: '3000', name: 'Member Share Capital', type: 'EQUITY', debit: 0, credit: 601000, balance: 601000 },
          ],
          netSurplusCurrentPeriod: 0,
          totalCapital: 601000,
          totalCalculatedEquity: 601000,
        },
        totalLiabilitiesAndEquity: 851000,
        difference: 0,
        status: 'BALANCED',
        diagnostics: 'Balance Sheet is perfectly balanced (Total Assets = Total Liabilities + Total Equity).',
      },
    };
  },
};
