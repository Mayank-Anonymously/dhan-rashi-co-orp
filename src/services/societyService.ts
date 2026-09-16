// Society service — mock implementation

import { ServiceResponse } from '@/types/common';
import { Society } from '@/types/society';
import { societyData } from '@/data/society';
import { simulateDelay } from '@/utils/helpers';

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
    await simulateDelay();
    return { success: true, data: getSocietyData() };
  },

  async updateSociety(data: Society): Promise<ServiceResponse<Society>> {
    await simulateDelay(500);
    if (typeof window !== 'undefined') {
      localStorage.setItem(SOCIETY_STORAGE_KEY, JSON.stringify(data));
    }
    return { success: true, data, message: 'Society settings saved successfully.' };
  },
};
