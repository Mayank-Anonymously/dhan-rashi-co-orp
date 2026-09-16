// Member service — mock implementation

import { ServiceResponse, PaginatedResponse } from '@/types/common';
import { Member, MemberFormData, MemberHistory, MemberFilters } from '@/types/member';
import { membersData, memberHistoryData } from '@/data/members';
import { branchesData } from '@/data/branches';
import { simulateDelay, generateId, getMemberFullName } from '@/utils/helpers';

// In-memory copy for mutations during the session
let members: Member[] = [...membersData];
const history: MemberHistory[] = [...memberHistoryData];

export const memberService = {
  async getMembers(filters: MemberFilters): Promise<ServiceResponse<PaginatedResponse<Member>>> {
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
    await simulateDelay();
    const member = members.find((m) => m.id === id) || null;
    return { success: true, data: member };
  },

  async createMember(formData: MemberFormData): Promise<ServiceResponse<Member>> {
    await simulateDelay(500);
    const branch = branchesData.find((b) => b.id === formData.branchId);
    const now = new Date().toISOString().split('T')[0];
    const newMember: Member = {
      id: generateId('mem'),
      ...formData,
      lastName: formData.lastName || '',
      fatherHusbandName: formData.fatherHusbandName || '',
      kycStatus: 'Pending',
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

    // Add history entry
    history.push({
      id: generateId('mh'),
      memberId: id,
      action: 'Profile Updated',
      description: 'Member profile information updated',
      date: now,
      performedBy: 'Admin User',
    });

    return { success: true, data: members[index], message: 'Member updated successfully.' };
  },

  async toggleStatus(id: string): Promise<ServiceResponse<Member | null>> {
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
    await simulateDelay();
    const memberHistory = history
      .filter((h) => h.memberId === memberId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return { success: true, data: memberHistory };
  },

  /**
   * Dashboard statistics
   */
  async getDashboardStats(): Promise<ServiceResponse<{
    totalMembers: number;
    activeMembers: number;
    newThisMonth: number;
    registrationTrend: { month: string; count: number }[];
    recentMembers: Member[];
  }>> {
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
