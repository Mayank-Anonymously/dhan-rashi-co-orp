'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@dhanrashi-demo.local');
  const [password, setPassword] = useState('Demo@12345');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await authService.login(email, password);
      if (res.success) {
        router.push('/dashboard');
      } else {
        setError(res.message || 'Invalid email or password.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card bg-white p-4">
        <div className="login-brand">
          <div className="login-brand-icon">
            <i className="bi bi-bank2"></i>
          </div>
          <h4 className="fw-bold text-dark mb-1">Dhan Rashi Co-operative</h4>
          <p className="text-muted small">Society Management Software</p>
        </div>

        {/* Demo Warning Alert */}
        <div className="alert alert-info py-2 px-3 mb-4 small" role="alert">
          <i className="bi bi-info-circle me-2"></i>
          <strong>Phase 1 Demo Access Only</strong>
          <div className="mt-1 text-muted" style={{ fontSize: '0.75rem' }}>
            This frontend is running with dummy data. Real authentication will be connected in Phase 2.
          </div>
        </div>

        {error && (
          <div className="alert alert-danger py-2 px-3 mb-3 small" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-muted small fw-semibold">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-light text-muted">
                <i className="bi bi-envelope"></i>
              </span>
              <input
                type="email"
                className="form-control"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label text-muted small fw-semibold">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-light text-muted">
                <i className="bi bi-lock"></i>
              </span>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2 fw-semibold"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Authenticating...
              </>
            ) : (
              'Sign In to ERP'
            )}
          </button>
        </form>

        {/* Preset credentials box */}
        <div className="mt-4 p-3 bg-light rounded border">
          <div className="fw-bold small text-secondary mb-1">Demo Credentials:</div>
          <div className="d-flex justify-content-between align-items-center mb-1">
            <span className="text-muted small">Email:</span>
            <code className="user-select-all small">admin@dhanrashi-demo.local</code>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted small">Password:</span>
            <code className="user-select-all small">Demo@12345</code>
          </div>
        </div>

        <div className="text-center mt-4">
          <small className="text-muted" style={{ fontSize: '0.7rem' }}>
            Developed for Dhan Rashi Co-operative Society by Makrosys Solutions
          </small>
        </div>
      </div>
    </div>
  );
}
