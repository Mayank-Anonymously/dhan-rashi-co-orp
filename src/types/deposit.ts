// Deposit types

export interface DepositProduct {
  id: string;
  name: string;
  code: string;
  depositType: 'FIXED_DEPOSIT' | 'RECURRING_DEPOSIT' | 'DAILY_PIGMY' | 'SAVINGS';
  interestRate: number;
  minAmount: number;
  maxAmount: number;
  minPeriodMonths: number;
  maxPeriodMonths: number;
  compoundingFrequency: string;
  penaltyPrematureRate: number;
  status: string;
  description: string;
}

export interface DepositAccount {
  id: string;
  accountNumber: string;
  certificateNumber: string;
  memberId: string;
  memberName: string;
  memberNumber: string;
  branchId: string;
  branchName: string;
  productId: string;
  productName: string;
  depositType: string;
  depositAmount: number;
  currentBalance: number;
  interestRate: number;
  tenureMonths: number;
  startDate: string;
  maturityDate: string;
  maturityAmount: number;
  status: 'ACTIVE' | 'MATURED' | 'PREMATURE_CLOSED' | 'CLOSED';
  nomineeName: string;
  nomineeRelationship: string;
  autoRenew: boolean;
  totalInterestAccrued: number;
}

export interface DepositTransaction {
  id: string;
  depositAccountId: string;
  accountNumber: string;
  memberId: string;
  memberName: string;
  transactionType: string;
  amount: number;
  balanceAfter: number;
  paymentMode: string;
  referenceNumber: string;
  transactionDate: string;
  remarks: string;
  performedBy: string;
}

export interface DepositFormData {
  memberId: string;
  productId: string;
  depositAmount: number;
  tenureMonths: number;
  paymentMode: string;
  nomineeName?: string;
  nomineeRelationship?: string;
  autoRenew?: boolean;
  remarks?: string;
}

export interface DailyCollection {
  id: string;
  receiptNumber: string;
  collectionDate: string;
  agentName: string;
  branchId: string;
  branchName: string;
  memberId: string;
  memberName: string;
  memberNumber: string;
  collectionType: string;
  referenceAccountId: string;
  accountNumber: string;
  amount: number;
  paymentMode: string;
  status: string;
  financialTransactionNumber: string;
  remarks: string;
}
