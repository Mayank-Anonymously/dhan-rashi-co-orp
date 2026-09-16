// Common types used across the application

export type Status = 'Active' | 'Inactive';

export type KYCStatus = 'Pending' | 'Verified' | 'Rejected';

export type Gender = 'Male' | 'Female' | 'Other';

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ServiceResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface SelectOption {
  value: string;
  label: string;
}
