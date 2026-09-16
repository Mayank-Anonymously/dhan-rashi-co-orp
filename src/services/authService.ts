// Authentication service (DEMO ONLY — not real security)

import { ServiceResponse } from '@/types/common';
import { User } from '@/types/user';
import { usersData } from '@/data/users';
import { simulateDelay } from '@/utils/helpers';

// DEMO credentials — NOT production authentication
const DEMO_EMAIL = 'admin@dhanrashi-demo.local';
const DEMO_PASSWORD = 'Demo@12345';

const AUTH_STORAGE_KEY = 'dhanrashi_demo_auth';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  branch: string;
}

export const authService = {
  /**
   * Demo login — validates against hardcoded credentials
   * Real authentication will be handled by the Node.js backend
   */
  async login(email: string, password: string): Promise<ServiceResponse<AuthUser | null>> {
    await simulateDelay(500);

    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      const adminUser = usersData.find((u) => u.email === DEMO_EMAIL);
      if (adminUser) {
        const authUser: AuthUser = {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role,
          branch: adminUser.branch,
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
        }
        return { success: true, data: authUser };
      }
    }

    return { success: false, data: null, message: 'Invalid email or password.' };
  },

  /**
   * Demo logout — clears localStorage
   */
  async logout(): Promise<void> {
    await simulateDelay(200);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  },

  /**
   * Get current demo user from localStorage
   */
  getCurrentUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored) as AuthUser;
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * Check if demo user is logged in
   */
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  },

  /**
   * Get full user details for the current user
   */
  async getCurrentUserDetails(): Promise<ServiceResponse<User | null>> {
    const authUser = this.getCurrentUser();
    if (!authUser) {
      return { success: false, data: null, message: 'Not authenticated' };
    }
    const user = usersData.find((u) => u.id === authUser.id) || null;
    return { success: true, data: user };
  },
};
