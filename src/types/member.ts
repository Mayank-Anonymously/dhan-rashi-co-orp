// Member types

import { Address, Status, KYCStatus, Gender } from './common';

export interface Member {
  id: string;
  memberNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  fatherHusbandName: string;
  dob: string;
  gender: Gender;
  mobile: string;
  altMobile?: string;
  email?: string;
  pan?: string;
  aadhaarLast4?: string;
  kycType?: string;
  kycStatus: KYCStatus;
  kycVerifiedOn?: string;
  permanentAddress: Address;
  postalAddress: Address;
  sameAsPermanent: boolean;
  nomineeName?: string;
  nomineeRelationship?: string;
  nomineeMobile?: string;
  branchId: string;
  branchName: string;
  joiningDate: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface MemberFormData {
  memberNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  fatherHusbandName: string;
  dob: string;
  gender: Gender;
  mobile: string;
  altMobile?: string;
  email?: string;
  pan?: string;
  aadhaarLast4?: string;
  kycType?: string;
  permanentAddress: Address;
  postalAddress: Address;
  sameAsPermanent: boolean;
  nomineeName?: string;
  nomineeRelationship?: string;
  nomineeMobile?: string;
  branchId: string;
  joiningDate: string;
}

export interface MemberHistory {
  id: string;
  memberId: string;
  action: string;
  description: string;
  date: string;
  performedBy: string;
}

export interface MemberFilters {
  search?: string;
  status?: Status | '';
  branchId?: string;
  page: number;
  pageSize: number;
}
