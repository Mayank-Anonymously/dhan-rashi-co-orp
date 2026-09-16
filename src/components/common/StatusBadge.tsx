// Status Badge component

import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const statusMap: Record<string, { className: string; label: string }> = {
  Active: { className: 'bg-success', label: 'Active' },
  Inactive: { className: 'bg-secondary', label: 'Inactive' },
  Pending: { className: 'bg-warning text-dark', label: 'Pending' },
  Verified: { className: 'bg-success', label: 'Verified' },
  Rejected: { className: 'bg-danger', label: 'Rejected' },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusMap[status] || { className: 'bg-secondary', label: status };
  const sizeClass = size === 'sm' ? 'badge-status' : 'badge-status';

  return (
    <span className={`badge ${config.className} ${sizeClass}`}>
      {config.label}
    </span>
  );
}
