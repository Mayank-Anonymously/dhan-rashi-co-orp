// Utility helper functions

/**
 * Format a date string to a readable format
 * @param dateStr - ISO date string or date format string
 * @param includeTime - Whether to include time in the output
 */
export function formatDate(dateStr: string, includeTime = false): string {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    };
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    return date.toLocaleDateString('en-IN', options);
  } catch {
    return dateStr;
  }
}

/**
 * Get initials from a full name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

/**
 * Generate a simple unique ID
 */
export function generateId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Get the full name of a member
 */
export function getMemberFullName(firstName: string, middleName?: string, lastName?: string): string {
  return [firstName, middleName, lastName].filter(Boolean).join(' ');
}

/**
 * Simulate API delay for mock services
 */
export function simulateDelay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Format a phone number for display
 */
export function formatPhone(phone: string): string {
  if (!phone) return '—';
  // If already formatted, return as is
  if (phone.includes('+') || phone.includes(' ')) return phone;
  // Format 10-digit Indian mobile
  if (phone.length === 10) {
    return `${phone.slice(0, 5)} ${phone.slice(5)}`;
  }
  return phone;
}
