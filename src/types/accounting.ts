export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';

export interface ChartOfAccount {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  parentAccount?: string | null;
  branchId?: string | null;
  openingBalance: number;
  openingBalanceType: 'DR' | 'CR';
  isSystemAccount?: boolean;
  status: 'Active' | 'Inactive';
  description?: string;
}

export interface LedgerEntry {
  id: string;
  transactionId: string;
  transactionNumber: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  entryDate: string;
  branchId: string;
  branchName?: string;
  memberId?: string | null;
  debit: number;
  credit: number;
  description: string;
  sourceModule: string;
}

export interface TrialBalanceItem {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  debit: number;
  credit: number;
}

export interface TrialBalanceResponse {
  asOnDate: string;
  accounts: TrialBalanceItem[];
  totalDebit: number;
  totalCredit: number;
  difference: number;
  status: 'BALANCED' | 'NOT_BALANCED';
}

export interface BalanceSheetSectionItem {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  debit: number;
  credit: number;
  balance: number;
}

export interface BalanceSheetResponse {
  asOnDate: string;
  assets: {
    items: BalanceSheetSectionItem[];
    total: number;
  };
  liabilities: {
    items: BalanceSheetSectionItem[];
    total: number;
  };
  equity: {
    capitalItems: BalanceSheetSectionItem[];
    netSurplusCurrentPeriod: number;
    totalCapital: number;
    totalCalculatedEquity: number;
  };
  totalLiabilitiesAndEquity: number;
  difference: number;
  status: 'BALANCED' | 'NOT_BALANCED';
  diagnostics: string;
}
