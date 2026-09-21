export interface ShareProduct {
  id: string;
  name: string;
  code: string;
  faceValue: number;
  minShares: number;
  maxShares: number;
  status: 'Active' | 'Inactive';
  description?: string;
}

export interface ShareAccount {
  id: string;
  accountNumber: string;
  memberId: string;
  memberName: string;
  branchId: string;
  branchName: string;
  totalShares: number;
  faceValue: number;
  totalValue: number;
  status: 'Active' | 'Inactive' | 'Closed';
  createdAt?: string;
}

export interface ShareTransaction {
  id: string;
  shareAccountId: string;
  memberId: string;
  type: 'ALLOTMENT' | 'TRANSFER' | 'CANCELLATION' | 'ADJUSTMENT' | 'REVERSAL';
  shares: number;
  faceValue: number;
  totalValue: number;
  date: string;
  referenceNumber: string;
  remarks?: string;
  createdBy: string;
}

export interface ShareFormData {
  memberId: string;
  shares: number;
  faceValue: number;
  referenceNumber?: string;
  remarks?: string;
}
