'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/common/StatusBadge';
import LoadingState from '@/components/common/LoadingState';
import EmptyState from '@/components/common/EmptyState';
import { memberService } from '@/services/memberService';
import { branchService } from '@/services/branchService';
import { shareService } from '@/services/shareService';
import { loanService } from '@/services/loanService';
import { Member, MemberFormData, MemberHistory } from '@/types/member';
import { Branch } from '@/types/branch';
import { formatDate, getMemberFullName, getInitials } from '@/utils/helpers';
import { validateMemberForm, ValidationError } from '@/utils/validators';

export default function MemberProfilePage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = use(params);
  const [member, setMember] = useState<Member | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [history, setHistory] = useState<MemberHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'shares' | 'loans' | 'personal' | 'kyc' | 'addresses' | 'nominee' | 'history'>('overview');

  // Edit Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<ValidationError[]>([]);
  const [formData, setFormData] = useState<MemberFormData | null>(null);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  const [shareAccounts, setShareAccounts] = useState<any[]>([]);
  const [loanAccounts, setLoanAccounts] = useState<any[]>([]);

  const refreshData = React.useCallback(async () => {
    const [memRes, histRes, branchRes, shareRes, loanRes] = await Promise.all([
      memberService.getMember(memberId),
      memberService.getMemberHistory(memberId),
      branchService.getBranches(),
      shareService.getShareAccounts({ memberId }),
      loanService.getLoanAccounts({ memberId }),
    ]);
    if (memRes.success && memRes.data) setMember(memRes.data);
    if (histRes.success) setHistory(histRes.data);
    if (branchRes.success) setBranches(branchRes.data);
    if (shareRes.success) setShareAccounts(shareRes.data);
    if (loanRes.success) setLoanAccounts(loanRes.data);
  }, [memberId]);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      setLoading(true);
      const [memRes, histRes, branchRes, shareRes, loanRes] = await Promise.all([
        memberService.getMember(memberId),
        memberService.getMemberHistory(memberId),
        branchService.getBranches(),
        shareService.getShareAccounts({ memberId }),
        loanService.getLoanAccounts({ memberId }),
      ]);
      if (isMounted) {
        if (memRes.success && memRes.data) setMember(memRes.data);
        if (histRes.success) setHistory(histRes.data);
        if (branchRes.success) setBranches(branchRes.data);
        if (shareRes.success) setShareAccounts(shareRes.data);
        if (loanRes.success) setLoanAccounts(loanRes.data);
        setLoading(false);
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, [memberId]);

  const handleOpenEditModal = () => {
    if (!member) return;
    setFormData({
      memberNumber: member.memberNumber,
      firstName: member.firstName,
      middleName: member.middleName || '',
      lastName: member.lastName || '',
      fatherHusbandName: member.fatherHusbandName || '',
      dob: member.dob,
      gender: member.gender,
      mobile: member.mobile,
      altMobile: member.altMobile || '',
      email: member.email || '',
      pan: member.pan || '',
      aadhaarLast4: member.aadhaarLast4 || '',
      kycType: member.kycType || 'Aadhaar + PAN',
      permanentAddress: { ...member.permanentAddress },
      postalAddress: { ...member.postalAddress },
      sameAsPermanent: member.sameAsPermanent,
      nomineeName: member.nomineeName || '',
      nomineeRelationship: member.nomineeRelationship || 'Spouse',
      nomineeMobile: member.nomineeMobile || '',
      branchId: member.branchId,
      joiningDate: member.joiningDate,
    });
    setFormErrors([]);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !member) return;

    const errors = validateMemberForm(formData);
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    setSaving(true);
    setFormErrors([]);
    try {
      const res = await memberService.updateMember(member.id, formData);
      if (res.success && res.data) {
        setMember(res.data);
        setShowEditModal(false);
        setAlertMsg({ type: 'success', text: 'Member profile updated successfully.' });
        await refreshData();
      } else {
        setFormErrors([{ field: 'submit', message: res.message || 'Failed to update member.' }]);
      }
    } catch {
      setFormErrors([{ field: 'submit', message: 'An unexpected error occurred while saving.' }]);
    } finally {
      setSaving(false);
    }
  };

  const getFieldError = (field: string) => {
    return formErrors.find((e) => e.field === field)?.message;
  };

  if (loading) return <LoadingState message="Loading member profile details..." />;

  if (!member) {
    return (
      <EmptyState icon="bi-person-x" title="Member Not Found" message="The requested member record could not be found.">
        <Link href="/members" className="btn btn-primary btn-sm mt-2">
          Back to Member Directory
        </Link>
      </EmptyState>
    );
  }

  const fullName = getMemberFullName(member.firstName, member.middleName, member.lastName);

  return (
    <div>
      {/* Top Navigation */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <Link href="/members" className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-arrow-left me-1"></i> Back to Members
        </Link>

        <div className="btn-group btn-group-sm">
          <button className="btn btn-primary" onClick={handleOpenEditModal}>
            <i className="bi bi-pencil me-1"></i> Edit Profile
          </button>
        </div>
      </div>

      {alertMsg && (
        <div className={`alert alert-${alertMsg.type} alert-dismissible fade show`} role="alert">
          {alertMsg.text}
          <button type="button" className="btn-close" onClick={() => setAlertMsg(null)}></button>
        </div>
      )}

      {/* Member Header Card */}
      <div className="profile-header d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div className="d-flex align-items-center gap-3">
          <div className="profile-avatar">{getInitials(fullName)}</div>
          <div>
            <h4 className="fw-bold mb-1">{fullName}</h4>
            <div className="d-flex flex-wrap align-items-center gap-2">
              <code>{member.memberNumber}</code>
              <span className="text-muted">•</span>
              <span className="text-muted">{member.branchName}</span>
              <span className="text-muted">•</span>
              <StatusBadge status={member.status} />
            </div>
          </div>
        </div>

        <div className="d-flex flex-wrap gap-4 text-end">
          <div>
            <div className="detail-label">Mobile</div>
            <div className="fw-semibold">{member.mobile}</div>
          </div>
          <div>
            <div className="detail-label">Joined On</div>
            <div className="fw-semibold">{formatDate(member.joiningDate)}</div>
          </div>
          <div>
            <div className="detail-label">KYC Status</div>
            <div>
              <StatusBadge status={member.kycStatus} />
            </div>
          </div>
        </div>
      </div>

      {/* Profile Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="bi bi-grid me-1"></i> Overview
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'shares' ? 'active' : ''}`}
            onClick={() => setActiveTab('shares')}
          >
            <i className="bi bi-pie-chart me-1"></i> Shares ({shareAccounts.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'loans' ? 'active' : ''}`}
            onClick={() => setActiveTab('loans')}
          >
            <i className="bi bi-cash-coin me-1"></i> Loans ({loanAccounts.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            <i className="bi bi-person me-1"></i> Personal Info
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'kyc' ? 'active' : ''}`}
            onClick={() => setActiveTab('kyc')}
          >
            <i className="bi bi-card-checklist me-1"></i> KYC
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'addresses' ? 'active' : ''}`}
            onClick={() => setActiveTab('addresses')}
          >
            <i className="bi bi-geo-alt me-1"></i> Addresses
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'nominee' ? 'active' : ''}`}
            onClick={() => setActiveTab('nominee')}
          >
            <i className="bi bi-person-heart me-1"></i> Nominee
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <i className="bi bi-clock-history me-1"></i> Audit History
          </button>
        </li>
      </ul>

      {/* TAB CONTENT */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div>
          <div className="card mb-4">
            <div className="card-header bg-light">Member Summary</div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-12 col-sm-6 col-md-3">
                  <div className="detail-label">Member Number</div>
                  <div className="detail-value"><code>{member.memberNumber}</code></div>
                </div>
                <div className="col-12 col-sm-6 col-md-3">
                  <div className="detail-label">Full Name</div>
                  <div className="detail-value">{fullName}</div>
                </div>
                <div className="col-12 col-sm-6 col-md-3">
                  <div className="detail-label">Father / Husband Name</div>
                  <div className="detail-value">{member.fatherHusbandName || '—'}</div>
                </div>
                <div className="col-12 col-sm-6 col-md-3">
                  <div className="detail-label">Mobile</div>
                  <div className="detail-value">{member.mobile}</div>
                </div>
                <div className="col-12 col-sm-6 col-md-3">
                  <div className="detail-label">Email</div>
                  <div className="detail-value">{member.email || '—'}</div>
                </div>
                <div className="col-12 col-sm-6 col-md-3">
                  <div className="detail-label">Assigned Branch</div>
                  <div className="detail-value">{member.branchName}</div>
                </div>
                <div className="col-12 col-sm-6 col-md-3">
                  <div className="detail-label">Joining Date</div>
                  <div className="detail-value">{formatDate(member.joiningDate)}</div>
                </div>
                <div className="col-12 col-sm-6 col-md-3">
                  <div className="detail-label">Status</div>
                  <div><StatusBadge status={member.status} /></div>
                </div>
              </div>
            </div>
          </div>

          {/* Phase 2 Financial Accounts & Portfolio */}
          <div className="card">
            <div className="card-header bg-light">Financial Accounts & Active Portfolio</div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <div className="card h-100 border-start border-4 border-primary">
                    <div className="card-body">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <i className="bi bi-pie-chart text-primary fs-3"></i>
                        <span className="badge bg-primary-subtle text-primary">{shareAccounts.length} Account(s)</span>
                      </div>
                      <h6 className="fw-bold mb-1">Share Capital</h6>
                      <div className="fs-5 fw-bold text-dark">
                        ₹{shareAccounts.reduce((acc, s) => acc + (s.totalValue || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      <small className="text-muted d-block mt-1">
                        Total Shares: {shareAccounts.reduce((acc, s) => acc + (s.numberOfShares || 0), 0)}
                      </small>
                      <button className="btn btn-link btn-sm p-0 text-decoration-none mt-2" onClick={() => setActiveTab('shares')}>
                        View Share Details <i className="bi bi-arrow-right"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-md-4">
                  <div className="card h-100 border-start border-4 border-success">
                    <div className="card-body">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <i className="bi bi-cash-coin text-success fs-3"></i>
                        <span className="badge bg-success-subtle text-success">{loanAccounts.length} Loan(s)</span>
                      </div>
                      <h6 className="fw-bold mb-1">Loan Accounts</h6>
                      <div className="fs-5 fw-bold text-dark">
                        ₹{loanAccounts.reduce((acc, l) => acc + (l.outstandingPrincipal || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      <small className="text-muted d-block mt-1">Outstanding Balance</small>
                      <button className="btn btn-link btn-sm p-0 text-decoration-none mt-2" onClick={() => setActiveTab('loans')}>
                        View Active Loans <i className="bi bi-arrow-right"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-md-4">
                  <div className="future-placeholder h-100">
                    <i className="bi bi-piggy-bank d-block text-muted fs-3"></i>
                    <h6 className="fw-bold mb-1 text-muted">Deposits (FD / RD / Savings)</h6>
                    <small className="text-muted">Phase 3 Feature</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SHARES TAB */}
      {activeTab === 'shares' && (
        <div className="card">
          <div className="card-header bg-light d-flex align-items-center justify-content-between py-3">
            <h6 className="card-title mb-0 fw-bold text-dark">
              <i className="bi bi-pie-chart me-2 text-primary"></i> Member Share Accounts & Certificates
            </h6>
            <Link href="/shares" className="btn btn-sm btn-outline-primary">
              <i className="bi bi-plus-circle me-1"></i> Issue Shares
            </Link>
          </div>
          <div className="card-body p-0">
            {shareAccounts.length === 0 ? (
              <EmptyState icon="bi-pie-chart" title="No Share Accounts" message="This member has not been allotted any society shares yet." />
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Account No</th>
                      <th>Share Certificate</th>
                      <th>Shares Issued</th>
                      <th>Face Value</th>
                      <th>Total Value</th>
                      <th>Issue Date</th>
                      <th>Status</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shareAccounts.map((s) => (
                      <tr key={s.id}>
                        <td><code>{s.accountNumber}</code></td>
                        <td className="fw-semibold text-primary">{s.certificateNumber}</td>
                        <td className="fw-bold">{s.numberOfShares}</td>
                        <td>₹{s.faceValue}</td>
                        <td className="fw-bold text-success">₹{s.totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td>{formatDate(s.issueDate)}</td>
                        <td><StatusBadge status={s.status} /></td>
                        <td className="text-end">
                          <Link href={`/shares/${s.id}`} className="btn btn-sm btn-outline-secondary">
                            View Certificate
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LOANS TAB */}
      {activeTab === 'loans' && (
        <div className="card">
          <div className="card-header bg-light d-flex align-items-center justify-content-between py-3">
            <h6 className="card-title mb-0 fw-bold text-dark">
              <i className="bi bi-cash-coin me-2 text-primary"></i> Member Loan Accounts & Borrowings
            </h6>
            <Link href="/loans/applications" className="btn btn-sm btn-outline-primary">
              <i className="bi bi-plus-circle me-1"></i> Apply for Loan
            </Link>
          </div>
          <div className="card-body p-0">
            {loanAccounts.length === 0 ? (
              <EmptyState icon="bi-cash" title="No Loan Accounts" message="This member has no active or past loan accounts." />
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Loan Number</th>
                      <th>Product</th>
                      <th>Principal</th>
                      <th>Interest</th>
                      <th>Monthly EMI</th>
                      <th>Outstanding Bal</th>
                      <th>Status</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loanAccounts.map((l) => (
                      <tr key={l.id}>
                        <td><code>{l.loanNumber}</code></td>
                        <td><span className="badge bg-light text-dark border">{l.productName}</span></td>
                        <td className="fw-bold">₹{l.principalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td>{l.interestRate}% ({l.interestType})</td>
                        <td className="text-success fw-bold">₹{l.emiAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td className="fw-bold text-danger">₹{l.outstandingPrincipal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td><StatusBadge status={l.status} /></td>
                        <td className="text-end">
                          <Link href={`/loans/${l.id}`} className="btn btn-sm btn-outline-primary">
                            View Account
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. PERSONAL INFORMATION TAB */}
      {activeTab === 'personal' && (
        <div className="card">
          <div className="card-header bg-light">Personal Details</div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-12 col-sm-6 col-md-4">
                <div className="detail-label">First Name</div>
                <div className="detail-value">{member.firstName}</div>
              </div>
              <div className="col-12 col-sm-6 col-md-4">
                <div className="detail-label">Middle Name</div>
                <div className="detail-value">{member.middleName || '—'}</div>
              </div>
              <div className="col-12 col-sm-6 col-md-4">
                <div className="detail-label">Last Name</div>
                <div className="detail-value">{member.lastName || '—'}</div>
              </div>
              <div className="col-12 col-sm-6 col-md-4">
                <div className="detail-label">Father / Husband Name</div>
                <div className="detail-value">{member.fatherHusbandName || '—'}</div>
              </div>
              <div className="col-12 col-sm-6 col-md-4">
                <div className="detail-label">Date of Birth</div>
                <div className="detail-value">{formatDate(member.dob)}</div>
              </div>
              <div className="col-12 col-sm-6 col-md-4">
                <div className="detail-label">Gender</div>
                <div className="detail-value">{member.gender}</div>
              </div>
              <div className="col-12 col-sm-6 col-md-4">
                <div className="detail-label">Mobile Phone</div>
                <div className="detail-value">{member.mobile}</div>
              </div>
              <div className="col-12 col-sm-6 col-md-4">
                <div className="detail-label">Alternate Mobile</div>
                <div className="detail-value">{member.altMobile || '—'}</div>
              </div>
              <div className="col-12 col-sm-6 col-md-4">
                <div className="detail-label">Email Address</div>
                <div className="detail-value">{member.email || '—'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. KYC TAB */}
      {activeTab === 'kyc' && (
        <div className="card">
          <div className="card-header bg-light">KYC Verification & Identity</div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-12 col-sm-6 col-md-4">
                <div className="detail-label">KYC Document Type</div>
                <div className="detail-value">{member.kycType || 'Aadhaar + PAN'}</div>
              </div>
              <div className="col-12 col-sm-6 col-md-4">
                <div className="detail-label">PAN Number</div>
                <div className="detail-value"><code>{member.pan || '—'}</code></div>
              </div>
              <div className="col-12 col-sm-6 col-md-4">
                <div className="detail-label">Aadhaar (Last 4 Digits)</div>
                <div className="detail-value">
                  {member.aadhaarLast4 ? <code>XXXX-XXXX-{member.aadhaarLast4}</code> : '—'}
                </div>
              </div>
              <div className="col-12 col-sm-6 col-md-4">
                <div className="detail-label">KYC Verification Status</div>
                <div><StatusBadge status={member.kycStatus} /></div>
              </div>
              <div className="col-12 col-sm-6 col-md-4">
                <div className="detail-label">Verified On</div>
                <div className="detail-value">{formatDate(member.kycVerifiedOn || '')}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. ADDRESSES TAB */}
      {activeTab === 'addresses' && (
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <div className="card h-100">
              <div className="card-header bg-light">Permanent Address</div>
              <div className="card-body">
                <div className="mb-2">{member.permanentAddress.line1}</div>
                {member.permanentAddress.line2 && <div className="mb-2">{member.permanentAddress.line2}</div>}
                <div>
                  {member.permanentAddress.city}, {member.permanentAddress.state} — {member.permanentAddress.pincode}
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="card h-100">
              <div className="card-header bg-light d-flex align-items-center justify-content-between">
                <span>Postal / Communication Address</span>
                {member.sameAsPermanent && (
                  <span className="badge bg-light text-muted border fw-normal">Same as permanent</span>
                )}
              </div>
              <div className="card-body">
                <div className="mb-2">{member.postalAddress.line1}</div>
                {member.postalAddress.line2 && <div className="mb-2">{member.postalAddress.line2}</div>}
                <div>
                  {member.postalAddress.city}, {member.postalAddress.state} — {member.postalAddress.pincode}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. NOMINEE TAB */}
      {activeTab === 'nominee' && (
        <div className="card">
          <div className="card-header bg-light">Nominee Details</div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-12 col-sm-6 col-md-4">
                <div className="detail-label">Nominee Name</div>
                <div className="detail-value">{member.nomineeName || '—'}</div>
              </div>
              <div className="col-12 col-sm-6 col-md-4">
                <div className="detail-label">Relationship</div>
                <div className="detail-value">{member.nomineeRelationship || '—'}</div>
              </div>
              <div className="col-12 col-sm-6 col-md-4">
                <div className="detail-label">Nominee Mobile</div>
                <div className="detail-value">{member.nomineeMobile || '—'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="card">
          <div className="card-header bg-light">Activity & Audit Timeline</div>
          <div className="card-body">
            {history.length === 0 ? (
              <p className="text-muted mb-0">No history events recorded yet.</p>
            ) : (
              <div className="py-2">
                {history.map((h) => (
                  <div key={h.id} className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-date">{formatDate(h.date)}</div>
                    <div className="timeline-title">{h.action}</div>
                    <div className="timeline-description">
                      {h.description} <small className="text-muted">by {h.performedBy}</small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && formData && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
          <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1055 }}>
            <div className="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered">
              <div className="modal-content">
                <form onSubmit={handleSaveEdit}>
                  <div className="modal-header">
                    <h5 className="modal-title">Edit Member Profile — {member.memberNumber}</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowEditModal(false)}
                      disabled={saving}
                    ></button>
                  </div>
                  <div className="modal-body">
                    {getFieldError('submit') && (
                      <div className="alert alert-danger py-2 px-3 mb-3 small" role="alert">
                        {getFieldError('submit')}
                      </div>
                    )}

                    <div className="row g-3">
                      <div className="col-12 col-md-4">
                        <label className="form-label small fw-semibold">First Name *</label>
                        <input
                          type="text"
                          className={`form-control form-control-sm ${getFieldError('firstName') ? 'is-invalid' : ''}`}
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-12 col-md-4">
                        <label className="form-label small fw-semibold">Middle Name</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={formData.middleName || ''}
                          onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                        />
                      </div>
                      <div className="col-12 col-md-4">
                        <label className="form-label small fw-semibold">Last Name</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        />
                      </div>

                      <div className="col-12 col-md-4">
                        <label className="form-label small fw-semibold">Father / Husband Name</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={formData.fatherHusbandName}
                          onChange={(e) => setFormData({ ...formData, fatherHusbandName: e.target.value })}
                        />
                      </div>
                      <div className="col-12 col-md-4">
                        <label className="form-label small fw-semibold">Mobile Phone *</label>
                        <input
                          type="text"
                          className={`form-control form-control-sm ${getFieldError('mobile') ? 'is-invalid' : ''}`}
                          value={formData.mobile}
                          onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-12 col-md-4">
                        <label className="form-label small fw-semibold">Email Address</label>
                        <input
                          type="email"
                          className={`form-control form-control-sm ${getFieldError('email') ? 'is-invalid' : ''}`}
                          value={formData.email || ''}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>

                      <div className="col-12 col-md-4">
                        <label className="form-label small fw-semibold">PAN Number</label>
                        <input
                          type="text"
                          className="form-control form-control-sm text-uppercase"
                          value={formData.pan || ''}
                          onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                        />
                      </div>
                      <div className="col-12 col-md-4">
                        <label className="form-label small fw-semibold">Aadhaar (Last 4 Digits)</label>
                        <input
                          type="text"
                          maxLength={4}
                          className="form-control form-control-sm"
                          value={formData.aadhaarLast4 || ''}
                          onChange={(e) => setFormData({ ...formData, aadhaarLast4: e.target.value })}
                        />
                      </div>
                      <div className="col-12 col-md-4">
                        <label className="form-label small fw-semibold">Assigned Branch *</label>
                        <select
                          className="form-select form-select-sm"
                          value={formData.branchId}
                          onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                        >
                          {branches.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="form-label small fw-semibold">Permanent Address Line 1</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={formData.permanentAddress.line1}
                          onChange={(e) => setFormData({
                            ...formData,
                            permanentAddress: { ...formData.permanentAddress, line1: e.target.value },
                          })}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label small fw-semibold">Permanent Address Line 2</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={formData.permanentAddress.line2 || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            permanentAddress: { ...formData.permanentAddress, line2: e.target.value },
                          })}
                        />
                      </div>

                      <div className="col-12 col-md-4">
                        <label className="form-label small fw-semibold">City</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={formData.permanentAddress.city}
                          onChange={(e) => setFormData({
                            ...formData,
                            permanentAddress: { ...formData.permanentAddress, city: e.target.value },
                          })}
                        />
                      </div>
                      <div className="col-12 col-md-4">
                        <label className="form-label small fw-semibold">State</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={formData.permanentAddress.state}
                          onChange={(e) => setFormData({
                            ...formData,
                            permanentAddress: { ...formData.permanentAddress, state: e.target.value },
                          })}
                        />
                      </div>
                      <div className="col-12 col-md-4">
                        <label className="form-label small fw-semibold">Pincode</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={formData.permanentAddress.pincode}
                          onChange={(e) => setFormData({
                            ...formData,
                            permanentAddress: { ...formData.permanentAddress, pincode: e.target.value },
                          })}
                        />
                      </div>

                      <div className="col-12 col-md-4">
                        <label className="form-label small fw-semibold">Nominee Name</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={formData.nomineeName || ''}
                          onChange={(e) => setFormData({ ...formData, nomineeName: e.target.value })}
                        />
                      </div>
                      <div className="col-12 col-md-4">
                        <label className="form-label small fw-semibold">Nominee Relationship</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={formData.nomineeRelationship || ''}
                          onChange={(e) => setFormData({ ...formData, nomineeRelationship: e.target.value })}
                        />
                      </div>
                      <div className="col-12 col-md-4">
                        <label className="form-label small fw-semibold">Nominee Mobile</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={formData.nomineeMobile || ''}
                          onChange={(e) => setFormData({ ...formData, nomineeMobile: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setShowEditModal(false)}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                      {saving ? 'Saving...' : 'Save Member Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
