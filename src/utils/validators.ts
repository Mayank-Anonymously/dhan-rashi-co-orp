// Form validation utilities

export function validateEmail(email: string): boolean {
  if (!email) return true; // Optional field
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

export function validateMobile(mobile: string): boolean {
  if (!mobile) return false;
  const pattern = /^[6-9]\d{9}$/;
  return pattern.test(mobile.replace(/\s/g, ''));
}

export function validatePAN(pan: string): boolean {
  if (!pan) return true; // Optional field
  const pattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return pattern.test(pan.toUpperCase());
}

export function validatePincode(pincode: string): boolean {
  if (!pincode) return false;
  const pattern = /^[1-9][0-9]{5}$/;
  return pattern.test(pincode);
}

export function validateAadhaarLast4(digits: string): boolean {
  if (!digits) return true; // Optional field
  const pattern = /^\d{4}$/;
  return pattern.test(digits);
}

export interface ValidationError {
  field: string;
  message: string;
}

export function validateMemberForm(data: {
  memberNumber?: string;
  firstName?: string;
  mobile?: string;
  email?: string;
  pan?: string;
  branchId?: string;
  joiningDate?: string;
  permanentAddress?: { pincode?: string };
  aadhaarLast4?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.memberNumber?.trim()) {
    errors.push({ field: 'memberNumber', message: 'Please enter the member number.' });
  }
  if (!data.firstName?.trim()) {
    errors.push({ field: 'firstName', message: 'Please enter the first name.' });
  }
  if (!data.mobile?.trim()) {
    errors.push({ field: 'mobile', message: 'Please enter the mobile number.' });
  } else if (!validateMobile(data.mobile)) {
    errors.push({ field: 'mobile', message: 'Please enter a valid 10-digit mobile number.' });
  }
  if (data.email && !validateEmail(data.email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address.' });
  }
  if (data.pan && !validatePAN(data.pan)) {
    errors.push({ field: 'pan', message: 'Please enter a valid PAN (e.g., ABCDE1234F).' });
  }
  if (data.aadhaarLast4 && !validateAadhaarLast4(data.aadhaarLast4)) {
    errors.push({ field: 'aadhaarLast4', message: 'Please enter exactly 4 digits.' });
  }
  if (!data.branchId) {
    errors.push({ field: 'branchId', message: 'Please select a branch.' });
  }
  if (!data.joiningDate) {
    errors.push({ field: 'joiningDate', message: 'Please enter the joining date.' });
  }
  if (data.permanentAddress?.pincode && !validatePincode(data.permanentAddress.pincode)) {
    errors.push({ field: 'permanentAddress.pincode', message: 'Please enter a valid 6-digit pincode.' });
  }

  return errors;
}
