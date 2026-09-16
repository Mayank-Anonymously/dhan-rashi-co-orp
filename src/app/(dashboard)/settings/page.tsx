'use client';

import React, { useState } from 'react';
import PageHeader from '@/components/common/PageHeader';

export default function SettingsPage() {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [density, setDensity] = useState<'compact' | 'comfortable'>('compact');
  const [savedAlert, setSavedAlert] = useState(false);

  const handleSaveDisplay = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 3000);
  };

  return (
    <div>
      <PageHeader
        title="Settings & System Information"
        description="View system details and configure user display preferences."
      />

      {savedAlert && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="bi bi-check-circle me-2"></i> Display preferences saved locally.
          <button type="button" className="btn-close" onClick={() => setSavedAlert(false)}></button>
        </div>
      )}

      {/* 1. SYSTEM INFORMATION */}
      <div className="card mb-4">
        <div className="card-header bg-light">SYSTEM INFORMATION</div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-sm-6 col-md-4">
              <div className="detail-label">Application Name</div>
              <div className="detail-value fw-bold">Dhan Rashi Cooperative Management System</div>
            </div>
            <div className="col-12 col-sm-6 col-md-4">
              <div className="detail-label">Software Version</div>
              <div className="detail-value"><code>1.0.0 (Phase 1 Frontend)</code></div>
            </div>
            <div className="col-12 col-sm-6 col-md-4">
              <div className="detail-label">Environment</div>
              <div className="detail-value"><span className="badge bg-warning text-dark">Development / Demo</span></div>
            </div>
            <div className="col-12 col-sm-6 col-md-4">
              <div className="detail-label">Client</div>
              <div className="detail-value">Dhan Rashi Co-operative Society</div>
            </div>
            <div className="col-12 col-sm-6 col-md-4">
              <div className="detail-label">Development Company</div>
              <div className="detail-value">Makrosys Solutions</div>
            </div>
            <div className="col-12 col-sm-6 col-md-4">
              <div className="detail-label">Architecture</div>
              <div className="detail-value">Next.js App Router + TypeScript + Bootstrap 5</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. APPLICATION SETTINGS */}
      <div className="card mb-4">
        <div className="card-header bg-light">APPLICATION CONFIGURATION</div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <div className="detail-label">Mock Service Layer</div>
              <div className="detail-value text-success">
                <i className="bi bi-check-circle me-1"></i> Active (In-Memory + LocalStorage)
              </div>
              <small className="text-muted d-block mt-1">
                Services ready to be swapped with Node.js REST API calls in Phase 2.
              </small>
            </div>
            <div className="col-12 col-md-6">
              <div className="detail-label">Backend Status</div>
              <div className="detail-value text-secondary">
                <i className="bi bi-dash-circle me-1"></i> Not Connected (Phase 1 Frontend Only)
              </div>
              <small className="text-muted d-block mt-1">
                Node.js + PostgreSQL backend will be integrated in Phase 2.
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* 3. DISPLAY SETTINGS */}
      <form onSubmit={handleSaveDisplay} className="card">
        <div className="card-header bg-light">DISPLAY & PREFERENCES</div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold">Theme Mode</label>
              <select
                className="form-select form-select-sm"
                value={themeMode}
                onChange={(e) => setThemeMode(e.target.value as 'light' | 'dark')}
              >
                <option value="light">Light Professional (Default Navy)</option>
                <option value="dark" disabled>Dark Theme (Coming Soon)</option>
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold">Table Display Density</label>
              <select
                className="form-select form-select-sm"
                value={density}
                onChange={(e) => setDensity(e.target.value as 'compact' | 'comfortable')}
              >
                <option value="compact">Compact ERP View (Recommended)</option>
                <option value="comfortable">Comfortable Spacing</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-end">
            <button type="submit" className="btn btn-primary btn-sm">
              <i className="bi bi-check-lg me-1"></i> Save Preferences
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
