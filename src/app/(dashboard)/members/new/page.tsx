'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import { memberService } from '@/services/memberService';
import { branchService } from '@/services/branchService';
import { MemberFormData } from '@/types/member';
import { Branch } from '@/types/branch';
import { validateMemberForm, ValidationError } from '@/utils/validators';

export default function NewMemberPage() {
  const router = useRouter();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState<MemberFormData>(() => ({
    memberNumber: `DRCS-M-${Math.floor(1000 + Math.random() * 9000)}`,
    firstName: '',
    middleName: '',
    lastName: '',
    fatherHusbandName: '',
    dob: '1990-01-01',
    gender: 'Male',
    mobile: '',
    altMobile: '',
    email: '',
    pan: '',
    aadhaarLast4: '',
    kycType: 'Aadhaar + PAN',
    permanentAddress: {
      line1: '',
      line2: '',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '',
    },
    postalAddress: {
      line1: '',
      line2: '',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '',
    },
    sameAsPermanent: true,
    nomineeName: '',
    nomineeRelationship: 'Spouse',
    nomineeMobile: '',
    branchId: 'br-001',
    joiningDate: todayStr,
  }));

  useEffect(() => {
    async function loadBranches() {
      const res = await branchService.getBranches();
      if (res.success && res.data.length > 0) {
        setBranches(res.data);
        setFormData((prev) => ({ ...prev, branchId: res.data[0].id }));
      }
    }
    loadBranches();
  }, []);

  const getFieldError = (field: string) => {
    return errors.find((e) => e.field === field)?.message;
  };

  const handleSameAsPermanentToggle = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      sameAsPermanent: checked,
      postalAddress: checked ? { ...prev.permanentAddress } : prev.postalAddress,
    }));
  };

  const handlePermanentAddressChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updatedPermanent = { ...prev.permanentAddress, [field]: value };
      return {
        ...prev,
        permanentAddress: updatedPermanent,
        postalAddress: prev.sameAsPermanent ? { ...updatedPermanent } : prev.postalAddress,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateMemberForm(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSaving(true);
    setErrors([]);
    try {
      const res = await memberService.createMember(formData);
      if (res.success) {
        router.push(`/members/${res.data.id}`);
      } else {
        setErrors([{ field: 'submit', message: res.message || 'Failed to create member.' }]);
      }
    } catch {
      setErrors([{ field: 'submit', message: 'An unexpected error occurred.' }]);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Register New Member"
        description="Fill in member details to create a new society membership record."
      >
        <Link href="/members" className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-arrow-left me-1"></i> Back to Members
        </Link>
      </PageHeader>

      {getFieldError('submit') && (
        <div className="alert alert-danger mb-4" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i> {getFieldError('submit')}
        </div>
      )}

      {errors.length > 0 && !getFieldError('submit') && (
        <div className="alert alert-danger mb-4" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i> Please correct the highlighted errors before saving.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* 1. PERSONAL INFORMATION */}
        <div className="card mb-4">
          <div className="card-header bg-light">1. PERSONAL INFORMATION</div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold">
                  Member Number <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control form-control-sm ${getFieldError('memberNumber') ? 'is-invalid' : ''}`}
                  value={formData.memberNumber}
                  onChange={(e) => setFormData({ ...formData, memberNumber: e.target.value })}
                  required
                />
                {getFieldError('memberNumber') && (
                  <div className="invalid-feedback">{getFieldError('memberNumber')}</div>
                )}
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold">
                  First Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control form-control-sm ${getFieldError('firstName') ? 'is-invalid' : ''}`}
                  placeholder="e.g. Rahul"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
                {getFieldError('firstName') && (
                  <div className="invalid-feedback">{getFieldError('firstName')}</div>
                )}
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold">Middle Name</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="e.g. Kumar"
                  value={formData.middleName || ''}
                  onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold">Last Name</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="e.g. Sharma"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold">Father / Husband Name</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="e.g. Rajesh Sharma"
                  value={formData.fatherHusbandName}
                  onChange={(e) => setFormData({ ...formData, fatherHusbandName: e.target.value })}
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold">Date of Birth</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                />
              </div>

              <div className="col-12 col-md-3">
                <label className="form-label small fw-semibold">Gender</label>
                <select
                  className="form-select form-select-sm"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'Male' | 'Female' | 'Other' })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="col-12 col-md-3">
                <label className="form-label small fw-semibold">
                  Mobile Phone <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control form-control-sm ${getFieldError('mobile') ? 'is-invalid' : ''}`}
                  placeholder="10 digit mobile"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  required
                />
                {getFieldError('mobile') && (
                  <div className="invalid-feedback">{getFieldError('mobile')}</div>
                )}
              </div>

              <div className="col-12 col-md-3">
                <label className="form-label small fw-semibold">Alternate Mobile</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Optional"
                  value={formData.altMobile || ''}
                  onChange={(e) => setFormData({ ...formData, altMobile: e.target.value })}
                />
              </div>

              <div className="col-12 col-md-3">
                <label className="form-label small fw-semibold">Email Address</label>
                <input
                  type="email"
                  className={`form-control form-control-sm ${getFieldError('email') ? 'is-invalid' : ''}`}
                  placeholder="name@domain.com"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                {getFieldError('email') && (
                  <div className="invalid-feedback">{getFieldError('email')}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2. IDENTIFICATION & KYC */}
        <div className="card mb-4">
          <div className="card-header bg-light">2. IDENTIFICATION & KYC</div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold">PAN Number</label>
                <input
                  type="text"
                  className={`form-control form-control-sm text-uppercase ${getFieldError('pan') ? 'is-invalid' : ''}`}
                  placeholder="e.g. ABCDE1234F"
                  value={formData.pan || ''}
                  onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                />
                {getFieldError('pan') && (
                  <div className="invalid-feedback">{getFieldError('pan')}</div>
                )}
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold">Aadhaar (Last 4 Digits)</label>
                <input
                  type="text"
                  maxLength={4}
                  className={`form-control form-control-sm ${getFieldError('aadhaarLast4') ? 'is-invalid' : ''}`}
                  placeholder="e.g. 1234"
                  value={formData.aadhaarLast4 || ''}
                  onChange={(e) => setFormData({ ...formData, aadhaarLast4: e.target.value })}
                />
                <small className="form-text text-muted" style={{ fontSize: '0.7rem' }}>
                  Enter last 4 digits only (Never enter full Aadhaar)
                </small>
                {getFieldError('aadhaarLast4') && (
                  <div className="invalid-feedback">{getFieldError('aadhaarLast4')}</div>
                )}
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold">KYC Document Type</label>
                <select
                  className="form-select form-select-sm"
                  value={formData.kycType || 'Aadhaar + PAN'}
                  onChange={(e) => setFormData({ ...formData, kycType: e.target.value })}
                >
                  <option value="Aadhaar + PAN">Aadhaar + PAN</option>
                  <option value="Aadhaar Only">Aadhaar Only</option>
                  <option value="Voter ID">Voter ID</option>
                  <option value="Passport">Passport</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 3. ADDRESS INFORMATION */}
        <div className="card mb-4">
          <div className="card-header bg-light">3. ADDRESS INFORMATION</div>
          <div className="card-body">
            <h6 className="fw-bold small text-primary mb-3">Permanent Address</h6>
            <div className="row g-3 mb-4">
              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold">Address Line 1</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="House / Flat No, Building"
                  value={formData.permanentAddress.line1}
                  onChange={(e) => handlePermanentAddressChange('line1', e.target.value)}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold">Address Line 2</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Street, Area, Landmark"
                  value={formData.permanentAddress.line2 || ''}
                  onChange={(e) => handlePermanentAddressChange('line2', e.target.value)}
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold">City</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={formData.permanentAddress.city}
                  onChange={(e) => handlePermanentAddressChange('city', e.target.value)}
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold">State</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={formData.permanentAddress.state}
                  onChange={(e) => handlePermanentAddressChange('state', e.target.value)}
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold">Pincode</label>
                <input
                  type="text"
                  className={`form-control form-control-sm ${getFieldError('permanentAddress.pincode') ? 'is-invalid' : ''}`}
                  placeholder="6 digit pincode"
                  value={formData.permanentAddress.pincode}
                  onChange={(e) => handlePermanentAddressChange('pincode', e.target.value)}
                />
                {getFieldError('permanentAddress.pincode') && (
                  <div className="invalid-feedback">{getFieldError('permanentAddress.pincode')}</div>
                )}
              </div>
            </div>

            <div className="d-flex align-items-center justify-content-between mb-3 border-top pt-3">
              <h6 className="fw-bold small text-primary mb-0">Postal / Communication Address</h6>
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="sameAsPermanent"
                  checked={formData.sameAsPermanent}
                  onChange={(e) => handleSameAsPermanentToggle(e.target.checked)}
                />
                <label className="form-check-label small fw-semibold" htmlFor="sameAsPermanent">
                  Same as Permanent Address
                </label>
              </div>
            </div>

            {!formData.sameAsPermanent && (
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Address Line 1</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={formData.postalAddress.line1}
                    onChange={(e) => setFormData({
                      ...formData,
                      postalAddress: { ...formData.postalAddress, line1: e.target.value },
                    })}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Address Line 2</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={formData.postalAddress.line2 || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      postalAddress: { ...formData.postalAddress, line2: e.target.value },
                    })}
                  />
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold">City</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={formData.postalAddress.city}
                    onChange={(e) => setFormData({
                      ...formData,
                      postalAddress: { ...formData.postalAddress, city: e.target.value },
                    })}
                  />
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold">State</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={formData.postalAddress.state}
                    onChange={(e) => setFormData({
                      ...formData,
                      postalAddress: { ...formData.postalAddress, state: e.target.value },
                    })}
                  />
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold">Pincode</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={formData.postalAddress.pincode}
                    onChange={(e) => setFormData({
                      ...formData,
                      postalAddress: { ...formData.postalAddress, pincode: e.target.value },
                    })}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. NOMINEE INFORMATION */}
        <div className="card mb-4">
          <div className="card-header bg-light">4. NOMINEE DETAILS</div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold">Nominee Name</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Full name of nominee"
                  value={formData.nomineeName || ''}
                  onChange={(e) => setFormData({ ...formData, nomineeName: e.target.value })}
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold">Relationship</label>
                <select
                  className="form-select form-select-sm"
                  value={formData.nomineeRelationship || 'Spouse'}
                  onChange={(e) => setFormData({ ...formData, nomineeRelationship: e.target.value })}
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                </select>
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold">Nominee Mobile</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Nominee contact mobile"
                  value={formData.nomineeMobile || ''}
                  onChange={(e) => setFormData({ ...formData, nomineeMobile: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 5. MEMBERSHIP ASSIGNMENT */}
        <div className="card mb-4">
          <div className="card-header bg-light">5. MEMBERSHIP ASSIGNMENT</div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold">
                  Branch <span className="text-danger">*</span>
                </label>
                <select
                  className={`form-select form-select-sm ${getFieldError('branchId') ? 'is-invalid' : ''}`}
                  value={formData.branchId}
                  onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                  required
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
                {getFieldError('branchId') && (
                  <div className="invalid-feedback">{getFieldError('branchId')}</div>
                )}
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold">
                  Joining Date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className={`form-control form-control-sm ${getFieldError('joiningDate') ? 'is-invalid' : ''}`}
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                  required
                />
                {getFieldError('joiningDate') && (
                  <div className="invalid-feedback">{getFieldError('joiningDate')}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form Action Buttons */}
        <div className="d-flex justify-content-end gap-2 mb-5">
          <Link href="/members" className="btn btn-secondary btn-sm">
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary btn-sm px-4" disabled={saving}>
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Saving Member...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg me-1"></i> Save Member
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
