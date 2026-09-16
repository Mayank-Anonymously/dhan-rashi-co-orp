// Branch service — mock implementation

import { ServiceResponse } from '@/types/common';
import { Branch, BranchFormData } from '@/types/branch';
import { branchesData } from '@/data/branches';
import { simulateDelay, generateId } from '@/utils/helpers';

// In-memory copy for mutations during the session
let branches: Branch[] = [...branchesData];

export const branchService = {
  async getBranches(): Promise<ServiceResponse<Branch[]>> {
    await simulateDelay();
    return { success: true, data: [...branches] };
  },

  async getBranch(id: string): Promise<ServiceResponse<Branch | null>> {
    await simulateDelay();
    const branch = branches.find((b) => b.id === id) || null;
    return { success: true, data: branch };
  },

  async createBranch(data: BranchFormData): Promise<ServiceResponse<Branch>> {
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
    await simulateDelay(500);
    const index = branches.findIndex((b) => b.id === id);
    if (index === -1) {
      return { success: false, data: null, message: 'Branch not found.' };
    }
    branches[index] = { ...branches[index], ...data };
    return { success: true, data: branches[index], message: 'Branch updated successfully.' };
  },

  async toggleStatus(id: string): Promise<ServiceResponse<Branch | null>> {
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
