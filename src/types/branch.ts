// Branch types

import { Status } from './common';

export interface Branch {
  id: string;
  code: string;
  name: string;
  manager: string;
  managerId: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  status: Status;
  createdAt: string;
}

export interface BranchFormData {
  code: string;
  name: string;
  managerId: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}
