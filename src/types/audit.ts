export interface AuditLogItem {
  id: string;
  _id?: string;
  userId: string;
  userName: string;
  role: string;
  branchId: string;
  action: string;
  module: string;
  recordId: string;
  description: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  createdAt: string;
}
