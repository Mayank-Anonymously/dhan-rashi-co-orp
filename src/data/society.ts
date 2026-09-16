import { Society } from '@/types/society';

export const societyData: Society = {
  name: 'Dhan Rashi Co-operative Society',
  registrationNumber: 'DRCS/2020/001234',
  registrationDate: '2020-04-15',
  pan: 'AABCD1234E',
  email: 'info@dhanrashi.coop',
  phone: '+91 11 2345 6789',
  website: 'www.dhanrashi.coop',
  address: {
    line1: '123, Cooperative Bhawan',
    line2: 'Sector 15, Institutional Area',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
  },
  openingTime: '09:30 AM',
  closingTime: '05:30 PM',
  weeklyOff: 'Sunday',
  financialYearStart: '1 April',
  financialYearEnd: '31 March',
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  defaultBranch: 'DRCS-HO',
};
