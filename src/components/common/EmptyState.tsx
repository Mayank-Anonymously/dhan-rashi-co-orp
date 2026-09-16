// Empty State component

import React from 'react';

interface EmptyStateProps {
  icon?: string;
  title?: string;
  message?: string;
  children?: React.ReactNode;
}

export default function EmptyState({
  icon = 'bi-inbox',
  title = 'No data found',
  message = 'There are no records to display.',
  children,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <i className={`bi ${icon} d-block`}></i>
      <h5>{title}</h5>
      <p className="mb-3">{message}</p>
      {children}
    </div>
  );
}
