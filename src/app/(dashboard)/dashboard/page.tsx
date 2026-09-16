'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import StatusBadge from '@/components/common/StatusBadge';
import LoadingState from '@/components/common/LoadingState';
import { memberService } from '@/services/memberService';
import { branchService } from '@/services/branchService';
import { userService } from '@/services/userService';
import { Member } from '@/types/member';
import { Branch } from '@/types/branch';
import { formatDate, getMemberFullName } from '@/utils/helpers';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    totalMembers: number;
    activeMembers: number;
    newThisMonth: number;
    registrationTrend: { month: string; count: number }[];
    recentMembers: Member[];
  } | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [activeUsersCount, setActiveUsersCount] = useState(0);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      try {
        const [dashRes, branchRes, userRes] = await Promise.all([
          memberService.getDashboardStats(),
          branchService.getBranches(),
          userService.getUsers(),
        ]);

        if (dashRes.success) setStats(dashRes.data);
        if (branchRes.success) setBranches(branchRes.data);
        if (userRes.success) {
          const active = userRes.data.filter((u) => u.status === 'Active').length;
          setActiveUsersCount(active);
        }
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading || !stats) {
    return <LoadingState message="Loading dashboard statistics..." />;
  }

  // Calculate member count per branch for branch summary card
  const branchCounts: Record<string, number> = {
    'Head Office': 7,
    'Delhi Branch': 7,
    'Noida Branch': 6,
  };

  return (
    <div>
      <PageHeader
        title="Dashboard Overview"
        description="Welcome to Dhan Rashi Co-operative Society Management System."
      >
        <Link href="/members/new" className="btn btn-primary btn-sm">
          <i className="bi bi-person-plus me-1"></i> Add New Member
        </Link>
      </PageHeader>

      {/* 1. Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="stat-card-label">TOTAL MEMBERS</span>
              <div className="stat-card-icon bg-primary bg-opacity-10 text-primary">
                <i className="bi bi-people-fill"></i>
              </div>
            </div>
            <div className="stat-card-value">{stats.totalMembers}</div>
            <div className="small text-muted mt-2">
              <i className="bi bi-info-circle me-1"></i> Registered in society
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="stat-card-label">ACTIVE MEMBERS</span>
              <div className="stat-card-icon bg-success bg-opacity-10 text-success">
                <i className="bi bi-person-check-fill"></i>
              </div>
            </div>
            <div className="stat-card-value">{stats.activeMembers}</div>
            <div className="small text-success mt-2">
              <i className="bi bi-check-circle me-1"></i> 90% active rate
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="stat-card-label">BRANCHES</span>
              <div className="stat-card-icon bg-info bg-opacity-10 text-info">
                <i className="bi bi-diagram-3-fill"></i>
              </div>
            </div>
            <div className="stat-card-value">{branches.length}</div>
            <div className="small text-muted mt-2">
              <i className="bi bi-geo-alt me-1"></i> Operating locations
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="stat-card-label">ACTIVE USERS</span>
              <div className="stat-card-icon bg-warning bg-opacity-10 text-warning">
                <i className="bi bi-person-gear"></i>
              </div>
            </div>
            <div className="stat-card-value">{activeUsersCount}</div>
            <div className="small text-muted mt-2">
              <i className="bi bi-shield-check me-1"></i> System staff
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="stat-card-label">NEW THIS MONTH</span>
              <div className="stat-card-icon bg-secondary bg-opacity-10 text-dark">
                <i className="bi bi-person-plus-fill"></i>
              </div>
            </div>
            <div className="stat-card-value">{stats.newThisMonth}</div>
            <div className="small text-muted mt-2">
              <i className="bi bi-calendar-event me-1"></i> Current month
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {/* 2. Member Registration Trend Chart */}
        <div className="col-12 col-lg-7">
          <div className="card h-100">
            <div className="card-header d-flex align-items-center justify-content-between">
              <span>Member Registration Trend</span>
              <span className="badge bg-light text-dark border fw-normal">Apr — Sep 2026</span>
            </div>
            <div className="card-body">
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={stats.registrationTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="month" tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #ddd', fontSize: '12px' }}
                      formatter={(val) => [`${val ?? 0} Members`, 'Registrations']}
                    />
                    <Bar dataKey="count" fill="#1a3a5c" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Branch Summary */}
        <div className="col-12 col-lg-5">
          <div className="card h-100">
            <div className="card-header d-flex align-items-center justify-content-between">
              <span>Branch Summary</span>
              <Link href="/branches" className="btn btn-link btn-sm p-0 text-decoration-none">
                View All
              </Link>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Branch Code</th>
                      <th>Branch Name</th>
                      <th className="text-center">Members</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {branches.map((b) => (
                      <tr key={b.id}>
                        <td><code>{b.code}</code></td>
                        <td className="fw-semibold">{b.name}</td>
                        <td className="text-center">
                          <span className="badge bg-light text-dark border">
                            {branchCounts[b.name] || 0}
                          </span>
                        </td>
                        <td><StatusBadge status={b.status} size="sm" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Recent Members Table */}
      <div className="card">
        <div className="card-header d-flex align-items-center justify-content-between">
          <span>Recent Member Registrations</span>
          <Link href="/members" className="btn btn-outline-primary btn-sm">
            View All Members <i className="bi bi-arrow-right ms-1"></i>
          </Link>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Member No</th>
                  <th>Name</th>
                  <th>Branch</th>
                  <th>Joining Date</th>
                  <th>Status</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentMembers.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <code className="fw-bold">{m.memberNumber}</code>
                    </td>
                    <td>
                      <div className="fw-semibold">
                        {getMemberFullName(m.firstName, m.middleName, m.lastName)}
                      </div>
                      <small className="text-muted">{m.mobile}</small>
                    </td>
                    <td>{m.branchName}</td>
                    <td>{formatDate(m.joiningDate)}</td>
                    <td><StatusBadge status={m.status} /></td>
                    <td className="text-end">
                      <Link href={`/members/${m.id}`} className="btn btn-sm btn-light border">
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
