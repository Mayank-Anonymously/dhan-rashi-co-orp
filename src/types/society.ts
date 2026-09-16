// Society configuration types

import { Address } from './common';

export interface Society {
  name: string;
  registrationNumber: string;
  registrationDate: string;
  pan: string;
  email: string;
  phone: string;
  website: string;
  address: Address;
  openingTime: string;
  closingTime: string;
  weeklyOff: string;
  financialYearStart: string;
  financialYearEnd: string;
  currency: string;
  timezone: string;
  defaultBranch: string;
}
