import { ServiceResponse } from '@/types/common';
import { ShareProduct, ShareAccount, ShareTransaction, ShareFormData } from '@/types/share';
import { simulateDelay } from '@/utils/helpers';

const API_BASE_URL = 'http://localhost:5000/api/shares';

// In-Memory Fallback Demo Data
const fallbackShareProducts: ShareProduct[] = [
  {
    id: 'sp_01',
    name: 'Ordinary Share',
    code: 'ORD',
    faceValue: 100,
    minShares: 1,
    maxShares: 1000,
    status: 'Active',
    description: 'Standard equity shares for society members',
  },
];

let fallbackShareAccounts: ShareAccount[] = [
  {
    id: 'sha_01',
    accountNumber: 'SA-100001',
    memberId: 'mem-001',
    memberName: 'Rahul Kumar Sharma',
    branchId: 'br-001',
    branchName: 'Head Office',
    totalShares: 10,
    faceValue: 100,
    totalValue: 1000,
    status: 'Active',
  },
  {
    id: 'sha_02',
    accountNumber: 'SA-100002',
    memberId: 'mem-002',
    memberName: 'Amit Verma',
    branchId: 'br-003',
    branchName: 'Noida Branch',
    totalShares: 5,
    faceValue: 100,
    totalValue: 500,
    status: 'Active',
  },
];

const fallbackTransactions: ShareTransaction[] = [
  {
    id: 'st_01',
    shareAccountId: 'sha_01',
    memberId: 'mem-001',
    type: 'ALLOTMENT',
    shares: 10,
    faceValue: 100,
    totalValue: 1000,
    date: '2024-04-10',
    referenceNumber: 'REF-ORD-001',
    remarks: 'Initial share allotment upon registration',
    createdBy: 'Admin User',
  },
  {
    id: 'st_02',
    shareAccountId: 'sha_02',
    memberId: 'mem-002',
    type: 'ALLOTMENT',
    shares: 5,
    faceValue: 100,
    totalValue: 500,
    date: '2024-04-15',
    referenceNumber: 'REF-ORD-002',
    remarks: 'Initial share allotment upon registration',
    createdBy: 'Admin User',
  },
];

export const shareService = {
  async getShareProducts(): Promise<ServiceResponse<ShareProduct[]>> {
    try {
      const res = await fetch(`${API_BASE_URL}/products`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch {
      // Fallback to in-memory
    }
    await simulateDelay();
    return { success: true, data: [...fallbackShareProducts] };
  },

  async getShareAccounts(filters?: { search?: string; branchId?: string; status?: string; memberId?: string }): Promise<ServiceResponse<ShareAccount[]>> {
    try {
      let queryStr = '';
      if (filters) {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.branchId) params.append('branchId', filters.branchId);
        if (filters.status) params.append('status', filters.status);
        if (filters.memberId) params.append('memberId', filters.memberId);
        queryStr = `?${params.toString()}`;
      }

      const res = await fetch(`${API_BASE_URL}${queryStr}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch {
      // Fallback
    }

    await simulateDelay();
    let result = [...fallbackShareAccounts];
    if (filters?.memberId) {
      result = result.filter((a) => a.memberId === filters.memberId);
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      result = result.filter((a) => a.accountNumber.toLowerCase().includes(s) || a.memberName.toLowerCase().includes(s));
    }
    if (filters?.branchId) {
      result = result.filter((a) => a.branchId === filters.branchId);
    }
    if (filters?.status) {
      result = result.filter((a) => a.status === filters.status);
    }

    return { success: true, data: result };
  },

  async getShareAccountDetails(id: string): Promise<ServiceResponse<{ account: ShareAccount; transactions: ShareTransaction[] } | null>> {
    try {
      const res = await fetch(`${API_BASE_URL}/${id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch {
      // Fallback
    }

    await simulateDelay();
    const account = fallbackShareAccounts.find((a) => a.id === id);
    if (!account) return { success: false, data: null, message: 'Share account not found.' };

    const transactions = fallbackTransactions.filter((t) => t.shareAccountId === id);
    return { success: true, data: { account, transactions } };
  },

  async createShareAccount(data: ShareFormData): Promise<ServiceResponse<ShareAccount>> {
    try {
      const res = await fetch(`${API_BASE_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch {
      // Fallback
    }

    await simulateDelay();
    if (data.shares <= 0) {
      return { success: false, data: null as unknown as ShareAccount, message: 'Shares must be greater than zero.' };
    }

    const faceVal = data.faceValue || 100;
    const totVal = data.shares * faceVal;
    let account = fallbackShareAccounts.find((a) => a.memberId === data.memberId);

    if (!account) {
      account = {
        id: `sha_${Date.now()}`,
        accountNumber: `SA-${Math.floor(100000 + Math.random() * 900000)}`,
        memberId: data.memberId,
        memberName: 'Society Member',
        branchId: 'br-001',
        branchName: 'Head Office',
        totalShares: data.shares,
        faceValue: faceVal,
        totalValue: totVal,
        status: 'Active',
      };
      fallbackShareAccounts.unshift(account);
    } else {
      account.totalShares += data.shares;
      account.totalValue = account.totalShares * account.faceValue;
    }

    fallbackTransactions.unshift({
      id: `st_${Date.now()}`,
      shareAccountId: account.id,
      memberId: data.memberId,
      type: 'ALLOTMENT',
      shares: data.shares,
      faceValue: faceVal,
      totalValue: totVal,
      date: new Date().toISOString().split('T')[0],
      referenceNumber: data.referenceNumber || `REF-${Date.now().toString(36).toUpperCase()}`,
      remarks: data.remarks || 'Share allotment',
      createdBy: 'Admin User',
    });

    return { success: true, data: account, message: 'Shares issued successfully.' };
  },
};
