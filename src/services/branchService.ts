// Branch service — real backend API with fallback

import { ServiceResponse } from '@/types/common';
import { Branch, BranchFormData } from '@/types/branch';
import { branchesData } from '@/data/branches';
import { simulateDelay, generateId } from '@/utils/helpers';

const API_BASE = 'http://localhost:5000/api/branches';

// In-memory copy for fallback
let branches: Branch[] = [...branchesData];

export const branchService = {
  async getBranches(): Promise<ServiceResponse<Branch[]>> {
    try {
      const res = await fetch(API_BASE);
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch {
      // Fallback
    }

    await simulateDelay();
    return { success: true, data: [...branches] };
  },

  async getBranch(id: string): Promise<ServiceResponse<Branch | null>> {
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
    const branch = branches.find((b) => b.id === id) || null;
    return { success: true, data: branch };
  },

  async createBranch(data: BranchFormData): Promise<ServiceResponse<Branch>> {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('dhanrashi_token') : '';
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch {
      // Fallback
    }

    await simulateDelay(500);
    const newBranch: Branch = {
      id: generateId('br'),
      ...data,
      manager: '',
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0],
    };
    branches = [newBranch, ...branches];
    return { success: true, data: newBranch, message: 'Branch created successfully.' };
  },

  async updateBranch(id: string, data: BranchFormData): Promise<ServiceResponse<Branch | null>> {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('dhanrashi_token') : '';
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch {
      // Fallback
    }

    await simulateDelay(500);
    const index = branches.findIndex((b) => b.id === id);
    if (index === -1) {
      return { success: false, data: null, message: 'Branch not found.' };
    }
    branches[index] = { ...branches[index], ...data };
    return { success: true, data: branches[index], message: 'Branch updated successfully.' };
  },

  async toggleStatus(id: string): Promise<ServiceResponse<Branch | null>> {
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
    const index = branches.findIndex((b) => b.id === id);
    if (index === -1) {
      return { success: false, data: null, message: 'Branch not found.' };
    }
    branches[index] = {
      ...branches[index],
      status: branches[index].status === 'Active' ? 'Inactive' : 'Active',
    };
    return { success: true, data: branches[index], message: `Branch ${branches[index].status === 'Active' ? 'activated' : 'deactivated'} successfully.` };
  },
};
