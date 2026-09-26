// Society service — real backend API with fallback

import { ServiceResponse } from '@/types/common';
import { Society } from '@/types/society';
import { societyData } from '@/data/society';
import { simulateDelay } from '@/utils/helpers';

const API_BASE = 'http://localhost:5000/api/society';
const SOCIETY_STORAGE_KEY = 'dhanrashi_society_data';

function getSocietyData(): Society {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(SOCIETY_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored) as Society;
      } catch {
        // fall through
      }
    }
  }
  return { ...societyData };
}

export const societyService = {
  async getSociety(): Promise<ServiceResponse<Society>> {
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
    return { success: true, data: getSocietyData() };
  },

  async updateSociety(data: Society): Promise<ServiceResponse<Society>> {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('dhanrashi_token') : '';
      const res = await fetch(API_BASE, {
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
    if (typeof window !== 'undefined') {
      localStorage.setItem(SOCIETY_STORAGE_KEY, JSON.stringify(data));
    }
    return { success: true, data, message: 'Society settings saved successfully.' };
  },
};
