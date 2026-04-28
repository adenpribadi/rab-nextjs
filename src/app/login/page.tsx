'use client';

import { loginAction } from "@/app/actions/auth";
import { useState } from "react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await loginAction(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'radial-gradient(circle at top right, #1c212a, #0a0c10)',
      padding: '1.5rem'
    }}>
      <div className="glass-card" style={{ 
        width: '100%', 
        maxWidth: '400px', 
        padding: '2.5rem',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            background: 'var(--accent-primary)', 
            borderRadius: '16px', 
            margin: '0 auto 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)'
          }}>
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="white">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontWeight: 700 }}>RAB ERP</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Please sign in to access the system</p>
        </div>

        <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}>
          <div>
            <label className="input-label">Username</label>
            <input 
              name="username" 
              type="text" 
              className="input-field" 
              required 
              placeholder="Enter your username"
              autoFocus
            />
          </div>
          <div>
            <label className="input-label">Password</label>
            <input 
              name="password" 
              type="password" 
              className="input-field" 
              required 
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              color: 'var(--error)', 
              padding: '0.75rem', 
              borderRadius: '6px', 
              fontSize: '0.85rem',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            style={{ 
              padding: '0.75rem', 
              marginTop: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
            {!loading && (
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            )}
          </button>
        </form>

        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Contact IT Support if you lost your credentials
        </div>
      </div>
    </div>
  );
}
