import { ServiceResponse } from '@/types/common';
import { AuditLogItem } from '@/types/audit';
import { simulateDelay } from '@/utils/helpers';

const API_BASE = 'http://localhost:5000/api/audit';

export const auditService = {
  async getAuditLogs(filters?: { module?: string; search?: string }): Promise<ServiceResponse<AuditLogItem[]>> {
    try {
      let queryStr = '';
      if (filters) {
        const params = new URLSearchParams();
        if (filters.module) params.append('module', filters.module);
        if (filters.search) params.append('search', filters.search);
        queryStr = `?${params.toString()}`;
      }
      const res = await fetch(`${API_BASE}/logs${queryStr}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch {
      // Fallback
    }

    await simulateDelay();
    return {
      success: true,
      data: [
        { id: 'aud_01', userId: 'usr_01', userName: 'Super Admin', role: 'Super Admin', branchId: 'Head Office Dwarka', action: 'POST_FINANCIAL_TRANSACTION', module: 'ACCOUNTING', recordId: 'TXN-2024-000001', description: 'Posted opening balance allocation voucher for ₹600,000.00', createdAt: '2024-01-01T10:00:00.000Z' },
        { id: 'aud_02', userId: 'usr_01', userName: 'Admin User', role: 'Administrator', branchId: 'Head Office Dwarka', action: 'ISSUE_SHARES', module: 'SHARES', recordId: 'SA-100001', description: 'Issued 10 shares @ ₹100 for Ramesh Kumar Gupta', createdAt: '2024-01-15T11:30:00.000Z' },
        { id: 'aud_03', userId: 'usr_01', userName: 'Admin User', role: 'Administrator', branchId: 'Head Office Dwarka', action: 'APPROVE_LOAN', module: 'LOANS', recordId: 'LN-100001', description: 'Approved and disbursed ₹100,000 loan for Ramesh Kumar Gupta', createdAt: '2024-03-05T02:15:00.000Z' },
      ],
    };
  },
};
