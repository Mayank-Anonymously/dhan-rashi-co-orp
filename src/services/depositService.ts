import { ServiceResponse } from '@/types/common';
import {
  DepositProduct,
  DepositAccount,
  DepositTransaction,
  DepositFormData,
  DailyCollection,
} from '@/types/deposit';

const API_BASE = 'http://localhost:5000/api';

export const depositService = {
  // ── Deposit Products ──
  async getDepositProducts(): Promise<ServiceResponse<DepositProduct[]>> {
    try {
      const res = await fetch(`${API_BASE}/deposits/products`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch { /* fallback */ }
    return { success: true, data: [] };
  },

  async createDepositProduct(data: Partial<DepositProduct>): Promise<ServiceResponse<DepositProduct>> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('dhanrashi_token') : '';
    const res = await fetch(`${API_BASE}/deposits/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // ── Deposit Accounts ──
  async getDepositAccounts(filters?: {
    search?: string;
    memberId?: string;
    branchId?: string;
    status?: string;
    depositType?: string;
  }): Promise<ServiceResponse<DepositAccount[]>> {
    try {
      let queryStr = '';
      if (filters) {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.memberId) params.append('memberId', filters.memberId);
        if (filters.branchId) params.append('branchId', filters.branchId);
        if (filters.status) params.append('status', filters.status);
        if (filters.depositType) params.append('depositType', filters.depositType);
        queryStr = `?${params.toString()}`;
      }
      const res = await fetch(`${API_BASE}/deposits/accounts${queryStr}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch { /* fallback */ }
    return { success: true, data: [] };
  },

  async getDepositAccountDetails(id: string): Promise<ServiceResponse<{ account: DepositAccount; transactions: DepositTransaction[] } | null>> {
    try {
      const res = await fetch(`${API_BASE}/deposits/accounts/${id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch { /* fallback */ }
    return { success: false, data: null, message: 'Failed to load deposit details.' };
  },

  async openDepositAccount(data: DepositFormData): Promise<ServiceResponse<DepositAccount>> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('dhanrashi_token') : '';
    const res = await fetch(`${API_BASE}/deposits/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async depositInstallment(id: string, data: { amount: number; paymentMode?: string; remarks?: string }): Promise<ServiceResponse<any>> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('dhanrashi_token') : '';
    const res = await fetch(`${API_BASE}/deposits/accounts/${id}/installment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async closeDepositAccount(id: string, data: { closureType?: string; paymentMode?: string; remarks?: string }): Promise<ServiceResponse<DepositAccount>> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('dhanrashi_token') : '';
    const res = await fetch(`${API_BASE}/deposits/accounts/${id}/close`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // ── Daily Collections ──
  async getCollections(filters?: {
    date?: string;
    memberId?: string;
    branchId?: string;
    collectionType?: string;
  }): Promise<ServiceResponse<DailyCollection[]>> {
    try {
      let queryStr = '';
      if (filters) {
        const params = new URLSearchParams();
        if (filters.date) params.append('date', filters.date);
        if (filters.memberId) params.append('memberId', filters.memberId);
        if (filters.branchId) params.append('branchId', filters.branchId);
        if (filters.collectionType) params.append('collectionType', filters.collectionType);
        queryStr = `?${params.toString()}`;
      }
      const res = await fetch(`${API_BASE}/collections${queryStr}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch { /* fallback */ }
    return { success: true, data: [] };
  },

  async recordCollection(data: {
    memberId: string;
    collectionType: string;
    referenceAccountId: string;
    amount: number;
    paymentMode?: string;
    agentName?: string;
    remarks?: string;
  }): Promise<ServiceResponse<DailyCollection>> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('dhanrashi_token') : '';
    const res = await fetch(`${API_BASE}/collections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};
