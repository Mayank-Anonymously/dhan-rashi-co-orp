// User service — real backend API with fallback

import { ServiceResponse } from '@/types/common';
import { User, UserFormData, Role } from '@/types/user';
import { usersData, rolesData } from '@/data/users';
import { branchesData } from '@/data/branches';
import { simulateDelay, generateId } from '@/utils/helpers';

const API_BASE = 'http://localhost:5000/api/users';

// In-memory copy for fallback
let users: User[] = [...usersData];

export const userService = {
  async getUsers(): Promise<ServiceResponse<User[]>> {
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
    return { success: true, data: [...users] };
  },

  async getUser(id: string): Promise<ServiceResponse<User | null>> {
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
    const user = users.find((u) => u.id === id) || null;
    return { success: true, data: user };
  },

  async createUser(data: UserFormData): Promise<ServiceResponse<User>> {
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
    const role = rolesData.find((r) => r.id === data.roleId);
    const branch = branchesData.find((b) => b.id === data.branchId);
    const newUser: User = {
      id: generateId('usr'),
      name: data.name,
      email: data.email,
      role: role?.name || '',
      roleId: data.roleId,
      branch: branch?.name || '',
      branchId: data.branchId,
      phone: data.phone,
      status: 'Active',
      lastLogin: '—',
      createdAt: new Date().toISOString().split('T')[0],
    };
    users = [newUser, ...users];
    return { success: true, data: newUser, message: 'User created successfully.' };
  },

  async updateUser(id: string, data: UserFormData): Promise<ServiceResponse<User | null>> {
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
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) {
      return { success: false, data: null, message: 'User not found.' };
    }
    const role = rolesData.find((r) => r.id === data.roleId);
    const branch = branchesData.find((b) => b.id === data.branchId);
    users[index] = {
      ...users[index],
      ...data,
      role: role?.name || users[index].role,
      branch: branch?.name || users[index].branch,
    };
    return { success: true, data: users[index], message: 'User updated successfully.' };
  },

  async toggleStatus(id: string): Promise<ServiceResponse<User | null>> {
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
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) {
      return { success: false, data: null, message: 'User not found.' };
    }
    users[index] = {
      ...users[index],
      status: users[index].status === 'Active' ? 'Inactive' : 'Active',
    };
    return { success: true, data: users[index], message: `User ${users[index].status === 'Active' ? 'activated' : 'deactivated'} successfully.` };
  },

  async getRoles(): Promise<ServiceResponse<Role[]>> {
    try {
      const res = await fetch('http://localhost:5000/api/roles');
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch {
      // Fallback
    }

    await simulateDelay();
    return { success: true, data: [...rolesData] };
  },
};
