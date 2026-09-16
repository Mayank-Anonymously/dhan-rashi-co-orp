'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/authService';
import { getInitials } from '@/utils/helpers';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
}

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard Overview',
  '/society': 'Society Configuration',
  '/branches': 'Branch Management',
  '/users': 'Users & Roles Management',
  '/members': 'Member Directory',
  '/members/new': 'New Member Registration',
  '/settings': 'System Settings',
};

export default function Header({ onToggleMobileSidebar }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user] = useState(() => authService.getCurrentUser());
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    await authService.logout();
    router.push('/login');
  };

  // Determine title from route or dynamic route
  let pageTitle = routeTitles[pathname] || 'System Management';
  if (pathname.startsWith('/members/') && pathname !== '/members/new') {
    pageTitle = 'Member Profile Details';
  }

  return (
    <header className="app-header">
      <div className="d-flex align-items-center gap-3">
        <button
          className="btn btn-sm btn-light d-lg-none border"
          onClick={onToggleMobileSidebar}
          aria-label="Toggle navigation menu"
        >
          <i className="bi bi-list fs-5"></i>
        </button>

        <div>
          <h6 className="mb-0 fw-bold">{pageTitle}</h6>
          <small className="text-muted d-none d-md-inline-block">
            Dhan Rashi Co-operative Society
          </small>
        </div>
      </div>

      <div className="header-user-info position-relative">
        <div className="text-end d-none d-sm-block">
          <div className="fw-semibold text-dark" style={{ fontSize: '0.825rem' }}>
            {user?.name || 'Admin User'}
          </div>
          <span className="badge bg-primary text-white" style={{ fontSize: '0.65rem' }}>
            {user?.role || 'Society Administrator'}
          </span>
        </div>

        <button
          className="btn p-0 border-0 d-flex align-items-center"
          onClick={() => setShowDropdown(!showDropdown)}
          aria-expanded={showDropdown}
        >
          <div className="header-user-avatar">
            {user?.name ? getInitials(user.name) : 'AU'}
          </div>
          <i className="bi bi-chevron-down ms-1 text-muted" style={{ fontSize: '0.75rem' }}></i>
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <>
            <div
              className="position-fixed top-0 start-0 w-100 h-100"
              style={{ zIndex: 1040 }}
              onClick={() => setShowDropdown(false)}
            />
            <div
              className="dropdown-menu dropdown-menu-end show position-absolute shadow-sm"
              style={{ top: '100%', right: 0, marginTop: '0.5rem', zIndex: 1045 }}
            >
              <div className="dropdown-header">
                <strong>{user?.name || 'Admin User'}</strong>
                <div className="text-muted small">{user?.email || 'admin@dhanrashi-demo.local'}</div>
              </div>
              <div className="dropdown-divider"></div>
              <div className="px-3 py-1">
                <small className="text-muted d-block">Branch:</small>
                <small className="fw-semibold">{user?.branch || 'Head Office'}</small>
              </div>
              <div className="dropdown-divider"></div>
              <button
                className="dropdown-item text-danger d-flex align-items-center gap-2"
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right"></i> Logout Demo
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
