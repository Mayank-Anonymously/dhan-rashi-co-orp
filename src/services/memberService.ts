// Member service — real backend API with fallback

import { ServiceResponse, PaginatedResponse } from '@/types/common';
import { Member, MemberFormData, MemberHistory, MemberFilters } from '@/types/member';
import { membersData, memberHistoryData } from '@/data/members';
import { branchesData } from '@/data/branches';
import { simulateDelay, generateId, getMemberFullName } from '@/utils/helpers';

const API_BASE = 'http://localhost:5000/api/members';

// In-memory copy for mutations during fallback
let members: Member[] = [...membersData];
const history: MemberHistory[] = [...memberHistoryData];

export const memberService = {
  async getMembers(filters: MemberFilters): Promise<ServiceResponse<PaginatedResponse<Member>>> {
    try {
      const params = new URLSearchParams();
      if (filters.page) params.append('page', String(filters.page));
      if (filters.pageSize) params.append('pageSize', String(filters.pageSize));
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.branchId) params.append('branchId', filters.branchId);

      const res = await fetch(`${API_BASE}?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch {
      // Fallback
    }

    await simulateDelay();

    let filtered = [...members];

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.memberNumber.toLowerCase().includes(search) ||
          getMemberFullName(m.firstName, m.middleName, m.lastName).toLowerCase().includes(search) ||
          m.mobile.includes(search)
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter((m) => m.status === filters.status);
    }

    // Branch filter
    if (filters.branchId) {
      filtered = filtered.filter((m) => m.branchId === filters.branchId);
    }

    // Pagination
    const total = filtered.length;
    const totalPages = Math.ceil(total / filters.pageSize);
    const start = (filters.page - 1) * filters.pageSize;
    const data = filtered.slice(start, start + filters.pageSize);

    return {
      success: true,
      data: {
        data,
        total,
        page: filters.page,
        pageSize: filters.pageSize,
        totalPages,
      },
    };
  },

  async getMember(id: string): Promise<ServiceResponse<Member | null>> {
    try {
      const res = await fetch(`${API_BASE}/${id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch {
      // Fallback
    }

    await simulateDelay();
    const member = members.find((m) => m.id === id || m.memberNumber === id) || null;
    return { success: true, data: member };
  },

  async getMemberFullProfile(id: string): Promise<ServiceResponse<any>> {
    try {
      const res = await fetch(`${API_BASE}/${id}/360`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch {
      // Fallback
    }

    const memberRes = await this.getMember(id);
    return {
      success: true,
      data: {
        member: memberRes.data,
        shares: [],
        deposits: [],
        loans: [],
        history: [],
        ledgerEntries: [],
        metrics: { totalShareValue: 0, totalDepositBalance: 0, totalLoanOutstanding: 0 },
      },
    };
  },

  async createMember(formData: MemberFormData): Promise<ServiceResponse<Member>> {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('dhanrashi_token') : '';
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch {
      // Fallback
    }

    await simulateDelay(500);

    // Duplicate check
    const existing = members.find((m) => m.memberNumber.toLowerCase() === formData.memberNumber.toLowerCase());
    if (existing) {
      return { success: false, data: null as unknown as Member, message: `Member number '${formData.memberNumber}' already exists.` };
    }

    const branch = branchesData.find((b) => b.id === formData.branchId);
    const now = new Date().toISOString().split('T')[0];
    const newMember: Member = {
      id: generateId('mem'),
      ...formData,
      lastName: formData.lastName || '',
      fatherHusbandName: formData.fatherHusbandName || '',
      kycStatus: formData.aadhaarLast4 || formData.pan ? 'Verified' : 'Pending',
      branchName: branch?.name || '',
      status: 'Active',
      createdAt: now,
      updatedAt: now,
    };
    members = [newMember, ...members];

    // Add history entry
    history.push({
      id: generateId('mh'),
      memberId: newMember.id,
      action: 'Registered',
      description: `Member registered at ${newMember.branchName}`,
      date: now,
      performedBy: 'Admin User',
    });

    return { success: true, data: newMember, message: 'Member registered successfully.' };
  },

  async updateMember(id: string, formData: MemberFormData): Promise<ServiceResponse<Member | null>> {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('dhanrashi_token') : '';
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch {
      // Fallback
    }

    await simulateDelay(500);
    const index = members.findIndex((m) => m.id === id);
    if (index === -1) {
      return { success: false, data: null, message: 'Member not found.' };
    }
    const branch = branchesData.find((b) => b.id === formData.branchId);
    const now = new Date().toISOString().split('T')[0];
    members[index] = {
      ...members[index],
      ...formData,
      branchName: branch?.name || members[index].branchName,
      updatedAt: now,
    };

    return { success: true, data: members[index], message: 'Member updated successfully.' };
  },

  async toggleStatus(id: string): Promise<ServiceResponse<Member | null>> {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('dhanrashi_token') : '';
      const res = await fetch(`${API_BASE}/${id}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch {
      // Fallback
    }

    await simulateDelay(300);
    const index = members.findIndex((m) => m.id === id);
    if (index === -1) {
      return { success: false, data: null, message: 'Member not found.' };
    }
    members[index] = {
      ...members[index],
      status: members[index].status === 'Active' ? 'Inactive' : 'Active',
      updatedAt: new Date().toISOString().split('T')[0],
    };
    return { success: true, data: members[index], message: `Member ${members[index].status === 'Active' ? 'activated' : 'deactivated'} successfully.` };
  },

  async getMemberHistory(memberId: string): Promise<ServiceResponse<MemberHistory[]>> {
    try {
      const res = await fetch(`${API_BASE}/${memberId}/history`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch {
      // Fallback
    }

    await simulateDelay();
    const memberHistory = history
      .filter((h) => h.memberId === memberId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return { success: true, data: memberHistory };
  },

  async getDashboardStats(): Promise<ServiceResponse<{
    totalMembers: number;
    activeMembers: number;
    newThisMonth: number;
    registrationTrend: { month: string; count: number }[];
    recentMembers: Member[];
  }>> {
    try {
      const res = await fetch(`${API_BASE}/dashboard/stats`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch {
      // Fallback
    }

    await simulateDelay();
    const activeMembers = members.filter((m) => m.status === 'Active').length;
    const recentMembers = [...members]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return {
      success: true,
      data: {
        totalMembers: members.length,
        activeMembers,
        newThisMonth: 4,
        registrationTrend: [
          { month: 'Apr', count: 2 },
          { month: 'May', count: 3 },
          { month: 'Jun', count: 4 },
          { month: 'Jul', count: 3 },
          { month: 'Aug', count: 5 },
          { month: 'Sep', count: 4 },
        ],
        recentMembers,
      },
    };
  },
};
