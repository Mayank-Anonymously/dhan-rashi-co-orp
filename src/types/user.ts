// User and Role types

import { Status } from './common';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  roleId: string;
  branch: string;
  branchId: string;
  phone: string;
  status: Status;
  lastLogin: string;
  createdAt: string;
}

export interface UserFormData {
  name: string;
  email: string;
  roleId: string;
  branchId: string;
  phone: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}
