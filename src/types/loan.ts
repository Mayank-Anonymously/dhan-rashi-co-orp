export type InterestType = 'FLAT' | 'REDUCING_BALANCE';

export type ApplicationStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export type LoanStatus = 'PENDING' | 'ACTIVE' | 'PARTIALLY_PAID' | 'OVERDUE' | 'CLOSED' | 'CANCELLED' | 'WRITTEN_OFF';

export interface LoanProduct {
  id: string;
  name: string;
  code: string;
  loanType: string;
  minAmount: number;
  maxAmount: number;
  interestRateType: InterestType;
  baseInterestRate: number;
  minPeriod: number;
  maxPeriod: number;
  repaymentFrequency: string;
  installmentType: string;
  processingCharge: number;
  otherCharges?: number;
  status: 'Active' | 'Inactive';
  description?: string;
}

export interface LoanRate {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  minAmount: number;
  maxAmount: number;
  interestRate: number;
  effectiveFrom: string;
  effectiveTo?: string;
  status: 'Active' | 'Inactive';
}

export interface LoanApplicationHistory {
  date: string;
  action: string;
  user: string;
  description: string;
}

export interface LoanApplication {
  id: string;
  applicationNumber: string;
  memberId: string;
  memberName: string;
  memberNumber: string;
  branchId: string;
  branchName: string;
  productId: string;
  productName: string;
  productCode?: string;
  requestedAmount: number;
  requestedPeriod: number;
  purpose: string;
  applicationDate: string;
  status: ApplicationStatus;
  remarks?: string;
  history?: LoanApplicationHistory[];
}

export interface LoanScheduleItem {
  id: string;
  loanId: string;
  installmentNo: number;
  dueDate: string;
  principalDue: number;
  interestDue: number;
  totalInstallment: number;
  principalPaid: number;
  interestPaid: number;
  outstandingPrincipal: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
}

export interface LoanLedgerEntry {
  id: string;
  loanId: string;
  entryDate: string;
  entryType: string;
  description: string;
  amount: number;
  performedBy: string;
}

export interface LoanAccount {
  id: string;
  loanNumber: string;
  applicationId: string;
  memberId: string;
  memberName: string;
  memberNumber: string;
  branchId: string;
  branchName: string;
  productId: string;
  productName: string;
  principalAmount: number;
  interestRate: number;
  interestType: InterestType;
  loanPeriod: number;
  installmentFrequency: string;
  numberOfInstallments: number;
  startDate: string;
  maturityDate: string;
  status: LoanStatus;
  totalInterest: number;
  totalRepayment: number;
  emiAmount: number;
  outstandingPrincipal: number;
}
