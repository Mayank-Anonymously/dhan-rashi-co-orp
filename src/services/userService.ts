// User service — mock implementation

import { ServiceResponse } from '@/types/common';
import { User, UserFormData, Role } from '@/types/user';
import { usersData, rolesData } from '@/data/users';
import { branchesData } from '@/data/branches';
import { simulateDelay, generateId } from '@/utils/helpers';

// In-memory copy for mutations during the session
let users: User[] = [...usersData];

export const userService = {
  async getUsers(): Promise<ServiceResponse<User[]>> {
    await simulateDelay();
    return { success: true, data: [...users] };
  },

  async getUser(id: string): Promise<ServiceResponse<User | null>> {
    await simulateDelay();
    const user = users.find((u) => u.id === id) || null;
    return { success: true, data: user };
  },

  async createUser(data: UserFormData): Promise<ServiceResponse<User>> {
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
    await simulateDelay();
    return { success: true, data: [...rolesData] };
  },
};
