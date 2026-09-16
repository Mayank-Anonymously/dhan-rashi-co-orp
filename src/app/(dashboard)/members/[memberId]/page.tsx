'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/common/StatusBadge';
import LoadingState from '@/components/common/LoadingState';
import EmptyState from '@/components/common/EmptyState';
import { memberService } from '@/services/memberService';
import { Member, MemberHistory } from '@/types/member';
import { formatDate, getMemberFullName, getInitials } from '@/utils/helpers';

export default function MemberProfilePage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = use(params);
  const [member, setMember] = useState<Member | null>(null);
  const [history, setHistory] = useState<MemberHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'personal' | 'kyc' | 'addresses' | 'nominee' | 'history'>('overview');

  useEffect(() => {
    async function loadMemberDetails() {
      setLoading(true);
      const [memRes, histRes] = await Promise.all([
        memberService.getMember(memberId),
        memberService.getMemberHistory(memberId),
      ]);
      if (memRes.success && memRes.data) setMember(memRes.data);
      if (histRes.success) setHistory(histRes.data);
      setLoading(false);
    }
    loadMemberDetails();
  }, [memberId]);

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
          <button className="btn btn-primary">
            <i className="bi bi-pencil me-1"></i> Edit Profile
          </button>
        </div>
      </div>

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

          {/* Future Modules Placeholders */}
          <div className="card">
            <div className="card-header bg-light">Financial Accounts & Portfolio</div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <div className="future-placeholder">
                    <i className="bi bi-pie-chart d-block"></i>
                    <h6 className="fw-bold mb-1">Share Capital</h6>
                    <small className="text-muted">Available in future phase</small>
                  </div>
                </div>
                <div className="col-12 col-md-4">
                  <div className="future-placeholder">
                    <i className="bi bi-bank d-block"></i>
                    <h6 className="fw-bold mb-1">Loan Accounts</h6>
                    <small className="text-muted">Available in future phase</small>
                  </div>
                </div>
                <div className="col-12 col-md-4">
                  <div className="future-placeholder">
                    <i className="bi bi-piggy-bank d-block"></i>
                    <h6 className="fw-bold mb-1">Deposits (FD / RD / Savings)</h6>
                    <small className="text-muted">Available in future phase</small>
                  </div>
                </div>
              </div>
            </div>
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
    </div>
  );
}
