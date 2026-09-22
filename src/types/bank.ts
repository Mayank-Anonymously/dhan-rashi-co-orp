export interface BankAccount {
  id: string;
  _id?: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  accountCode: string;
  ifscCode: string;
  branchId: string;
  branchName: string;
  chartOfAccountId?: string;
  openingBalance: number;
  bookBalance: number;
  statementBalance: number;
  status: 'Active' | 'Inactive';
}

export interface CashAccount {
  id: string;
  _id?: string;
  accountName: string;
  accountCode: string;
  branchId: string;
  branchName: string;
  chartOfAccountId?: string;
  openingBalance: number;
  currentBalance: number;
  status: 'Active' | 'Inactive';
}

export interface BankTransaction {
  id: string;
  _id?: string;
  bankAccountId: string;
  bankAccountNumber: string;
  transactionDate: string;
  valueDate?: string;
  referenceNumber: string;
  description: string;
  withdrawalAmount: number;
  depositAmount: number;
  statementBalance: number;
  reconciliationStatus: 'UNMATCHED' | 'MATCHED' | 'MANUALLY_MATCHED' | 'RECONCILED' | 'IGNORED';
  matchedTransactionId?: string;
  matchedTransactionNumber?: string;
  importedAt?: string;
  importedBy?: string;
}

export interface ReconciliationWorkspace {
  bank: BankAccount;
  bookBalance: number;
  statementBalance: number;
  difference: number;
  status: 'RECONCILED' | 'UNRECONCILED';
  unmatchedCount: number;
  matchedCount: number;
  statementTransactions: BankTransaction[];
  bookTransactions: any[];
}
