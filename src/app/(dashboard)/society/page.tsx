'use client';

import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/common/PageHeader';
import LoadingState from '@/components/common/LoadingState';
import { societyService } from '@/services/societyService';
import { Society } from '@/types/society';

export default function SocietyPage() {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [society, setSociety] = useState<Society | null>(null);
  const [formData, setFormData] = useState<Society | null>(null);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  useEffect(() => {
    async function loadSociety() {
      setLoading(true);
      const res = await societyService.getSociety();
      if (res.success) {
        setSociety(res.data);
        setFormData(res.data);
      }
      setLoading(false);
    }
    loadSociety();
  }, []);

  if (loading || !society || !formData) {
    return <LoadingState message="Loading society settings..." />;
  }

  const handleChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addrField = field.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addrField]: value,
        },
      });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setAlertMsg(null);
    try {
      const res = await societyService.updateSociety(formData);
      if (res.success) {
        setSociety(res.data);
        setIsEditing(false);
        setAlertMsg({ type: 'success', text: 'Society configuration updated successfully.' });
      } else {
        setAlertMsg({ type: 'danger', text: res.message || 'Failed to update settings.' });
      }
    } catch {
      setAlertMsg({ type: 'danger', text: 'An unexpected error occurred.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(society);
    setIsEditing(false);
    setAlertMsg(null);
  };

  return (
    <div>
      <PageHeader
        title="Society Configuration"
        description="Manage master society settings, address, financial year, and operational hours."
      >
        {!isEditing ? (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setIsEditing(true)}
          >
            <i className="bi bi-pencil me-1"></i> Edit Configuration
          </button>
        ) : (
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-success btn-sm"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-1"></i> Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </PageHeader>

      {alertMsg && (
        <div className={`alert alert-${alertMsg.type} alert-dismissible fade show`} role="alert">
          {alertMsg.text}
          <button type="button" className="btn-close" onClick={() => setAlertMsg(null)}></button>
        </div>
      )}

      <form onSubmit={handleSave}>
        {/* 1. General Information */}
        <div className="card mb-4">
          <div className="card-header bg-light">GENERAL INFORMATION</div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label detail-label">Society Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                  />
                ) : (
                  <div className="detail-value fs-6 fw-bold">{society.name}</div>
                )}
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label detail-label">Registration Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="form-control"
                    value={formData.registrationNumber}
                    onChange={(e) => handleChange('registrationNumber', e.target.value)}
                    required
                  />
                ) : (
                  <div className="detail-value"><code>{society.registrationNumber}</code></div>
                )}
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label detail-label">Registration Date</label>
                {isEditing ? (
                  <input
                    type="date"
                    className="form-control"
                    value={formData.registrationDate}
                    onChange={(e) => handleChange('registrationDate', e.target.value)}
                  />
                ) : (
                  <div className="detail-value">{society.registrationDate}</div>
                )}
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label detail-label">PAN</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="form-control"
                    value={formData.pan}
                    onChange={(e) => handleChange('pan', e.target.value)}
                  />
                ) : (
                  <div className="detail-value"><code>{society.pan}</code></div>
                )}
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label detail-label">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                ) : (
                  <div className="detail-value">{society.email}</div>
                )}
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label detail-label">Phone</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="form-control"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                ) : (
                  <div className="detail-value">{society.phone}</div>
                )}
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label detail-label">Website</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="form-control"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                  />
                ) : (
                  <div className="detail-value">{society.website}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Address Information */}
        <div className="card mb-4">
          <div className="card-header bg-light">REGISTERED ADDRESS</div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label detail-label">Address Line 1</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="form-control"
                    value={formData.address.line1}
                    onChange={(e) => handleChange('address.line1', e.target.value)}
                  />
                ) : (
                  <div className="detail-value">{society.address.line1}</div>
                )}
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label detail-label">Address Line 2</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="form-control"
                    value={formData.address.line2 || ''}
                    onChange={(e) => handleChange('address.line2', e.target.value)}
                  />
                ) : (
                  <div className="detail-value">{society.address.line2 || '—'}</div>
                )}
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label detail-label">City</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="form-control"
                    value={formData.address.city}
                    onChange={(e) => handleChange('address.city', e.target.value)}
                  />
                ) : (
                  <div className="detail-value">{society.address.city}</div>
                )}
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label detail-label">State</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="form-control"
                    value={formData.address.state}
                    onChange={(e) => handleChange('address.state', e.target.value)}
                  />
                ) : (
                  <div className="detail-value">{society.address.state}</div>
                )}
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label detail-label">Pincode</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="form-control"
                    value={formData.address.pincode}
                    onChange={(e) => handleChange('address.pincode', e.target.value)}
                  />
                ) : (
                  <div className="detail-value">{society.address.pincode}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Office & Financial Settings */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-6">
            <div className="card h-100">
              <div className="card-header bg-light">OFFICE INFORMATION</div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-6">
                    <label className="form-label detail-label">Opening Time</label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="form-control"
                        value={formData.openingTime}
                        onChange={(e) => handleChange('openingTime', e.target.value)}
                      />
                    ) : (
                      <div className="detail-value">{society.openingTime}</div>
                    )}
                  </div>
                  <div className="col-6">
                    <label className="form-label detail-label">Closing Time</label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="form-control"
                        value={formData.closingTime}
                        onChange={(e) => handleChange('closingTime', e.target.value)}
                      />
                    ) : (
                      <div className="detail-value">{society.closingTime}</div>
                    )}
                  </div>
                  <div className="col-12">
                    <label className="form-label detail-label">Weekly Off</label>
                    {isEditing ? (
                      <select
                        className="form-select"
                        value={formData.weeklyOff}
                        onChange={(e) => handleChange('weeklyOff', e.target.value)}
                      >
                        <option value="Sunday">Sunday</option>
                        <option value="Saturday & Sunday">Saturday & Sunday</option>
                      </select>
                    ) : (
                      <div className="detail-value">{society.weeklyOff}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="card h-100">
              <div className="card-header bg-light">FINANCIAL & SYSTEM SETTINGS</div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-6">
                    <label className="form-label detail-label">Financial Year Start</label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="form-control"
                        value={formData.financialYearStart}
                        onChange={(e) => handleChange('financialYearStart', e.target.value)}
                      />
                    ) : (
                      <div className="detail-value">{society.financialYearStart}</div>
                    )}
                  </div>
                  <div className="col-6">
                    <label className="form-label detail-label">Financial Year End</label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="form-control"
                        value={formData.financialYearEnd}
                        onChange={(e) => handleChange('financialYearEnd', e.target.value)}
                      />
                    ) : (
                      <div className="detail-value">{society.financialYearEnd}</div>
                    )}
                  </div>
                  <div className="col-6">
                    <label className="form-label detail-label">Currency</label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="form-control"
                        value={formData.currency}
                        onChange={(e) => handleChange('currency', e.target.value)}
                      />
                    ) : (
                      <div className="detail-value">{society.currency} (₹)</div>
                    )}
                  </div>
                  <div className="col-6">
                    <label className="form-label detail-label">Timezone</label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="form-control"
                        value={formData.timezone}
                        onChange={(e) => handleChange('timezone', e.target.value)}
                      />
                    ) : (
                      <div className="detail-value">{society.timezone}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
