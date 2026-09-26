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

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'bi-speedometer2' },
  { label: 'Society', href: '/society', icon: 'bi-building' },
  { label: 'Branches', href: '/branches', icon: 'bi-diagram-3' },
  { label: 'Users & Roles', href: '/users', icon: 'bi-people' },
  { label: 'Members', href: '/members', icon: 'bi-person-vcard' },
];

const financialProductsNavItems: NavItem[] = [
  { label: 'Share Accounts', href: '/shares', icon: 'bi-pie-chart' },
  { label: 'Deposit Accounts (FD/RD)', href: '/deposits', icon: 'bi-piggy-bank' },
  { label: 'Daily Collections', href: '/collections', icon: 'bi-wallet2' },
  { label: 'Loan Accounts', href: '/loans', icon: 'bi-bank' },
  { label: 'Loan Applications', href: '/loans/applications', icon: 'bi-file-earmark-text' },
  { label: 'Loan Products', href: '/loans/products', icon: 'bi-box-seam' },
  { label: 'Interest Rates', href: '/loans/rates', icon: 'bi-percent' },
];

const accountingNavItems: NavItem[] = [
  { label: 'Chart of Accounts', href: '/accounting/chart-of-accounts', icon: 'bi-folder2-open' },
  { label: 'General Ledger', href: '/accounting/ledger', icon: 'bi-journal-text' },
  { label: 'Trial Balance', href: '/accounting/trial-balance', icon: 'bi-calculator' },
  { label: 'Balance Sheet', href: '/accounting/balance-sheet', icon: 'bi-file-earmark-spreadsheet' },
];

const bankingNavItems: NavItem[] = [
  { label: 'Cash & Bank Accounts', href: '/banking/accounts', icon: 'bi-bank2' },
  { label: 'Import Statement CSV', href: '/banking/import', icon: 'bi-cloud-arrow-up' },
  { label: 'Bank Reconciliation', href: '/banking/reconciliation', icon: 'bi-arrow-repeat' },
  { label: 'Data Migration (ZIP)', href: '/migration', icon: 'bi-cloud-upload' },
  { label: 'Audit Trail Logs', href: '/audit', icon: 'bi-clock-history' },
  { label: 'Settings', href: '/settings', icon: 'bi-gear' },
];

const futureNavItems: NavItem[] = [
  { label: 'ECS Processing', href: '#', icon: 'bi-credit-card-2-front', isFuture: true },
  { label: 'Recovery Workflow', href: '#', icon: 'bi-arrow-counterclockwise', isFuture: true },
];

export default function Sidebar({ isOpenMobile, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  const isItemActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    if (href === '/loans') return pathname === '/loans';
    if (href === '/deposits') return pathname.startsWith('/deposits');
    if (href === '/collections') return pathname.startsWith('/collections');
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
            <small>Co-operative ERP (Phase 1+2+3)</small>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">Core Operations</div>
          {mainNavItems.map((item) => {
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

          <div className="sidebar-nav-label">Financial & Deposits</div>
          {financialProductsNavItems.map((item) => {
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

          <div className="sidebar-nav-label">Accounting & Ledger</div>
          {accountingNavItems.map((item) => {
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

          <div className="sidebar-nav-label">Banking & Reconciliation</div>
          {bankingNavItems.map((item) => {
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

          <div className="sidebar-nav-label">Future Roadmap</div>
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
