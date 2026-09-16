'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: string;
  isFuture?: boolean;
}

const activeNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'bi-speedometer2' },
  { label: 'Society', href: '/society', icon: 'bi-building' },
  { label: 'Branches', href: '/branches', icon: 'bi-diagram-3' },
  { label: 'Users & Roles', href: '/users', icon: 'bi-people' },
  { label: 'Members', href: '/members', icon: 'bi-person-vcard' },
  { label: 'Settings', href: '/settings', icon: 'bi-gear' },
];

const futureNavItems: NavItem[] = [
  { label: 'Shares', href: '#', icon: 'bi-pie-chart', isFuture: true },
  { label: 'Loans', href: '#', icon: 'bi-bank', isFuture: true },
  { label: 'Deposits', href: '#', icon: 'bi-piggy-bank', isFuture: true },
  { label: 'Collections', href: '#', icon: 'bi-wallet2', isFuture: true },
  { label: 'ECS', href: '#', icon: 'bi-credit-card-2-front', isFuture: true },
  { label: 'Accounting', href: '#', icon: 'bi-journal-bookmark', isFuture: true },
  { label: 'Demand Register', href: '#', icon: 'bi-card-checklist', isFuture: true },
  { label: 'Recovery', href: '#', icon: 'bi-arrow-counterclockwise', isFuture: true },
  { label: 'Reports', href: '#', icon: 'bi-file-earmark-bar-graph', isFuture: true },
  { label: 'Communication', href: '#', icon: 'bi-chat-left-text', isFuture: true },
];

export default function Sidebar({ isOpenMobile, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  const isItemActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div className="sidebar-overlay d-lg-none" onClick={onCloseMobile} />
      )}

      <aside className={`sidebar ${isOpenMobile ? 'show' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <i className="bi bi-bank2"></i>
          </div>
          <div className="sidebar-brand-text">
            <div>DHAN RASHI</div>
            <small>Co-operative Society ERP</small>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">Main Modules</div>
          {activeNavItems.map((item) => {
            const active = isItemActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`sidebar-nav-item ${active ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <i className={`bi ${item.icon}`}></i>
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="sidebar-nav-label">Future Modules</div>
          {futureNavItems.map((item) => (
            <div
              key={item.label}
              className="sidebar-nav-item disabled d-flex align-items-center justify-content-between"
              title="Available in future phase"
            >
              <div className="d-flex align-items-center">
                <i className={`bi ${item.icon}`}></i>
                <span>{item.label}</span>
              </div>
              <span className="sidebar-coming-soon">Soon</span>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
