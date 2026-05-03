'use client';

import { logoutAction } from "@/app/actions/auth";
import { useEffect } from "react";

export default function LogoutPage() {
  useEffect(() => {
    // Automatically trigger logout when page loads
    const timer = setTimeout(() => {
      logoutAction();
    }, 1500); // Small delay for visual effect

    return () => clearTimeout(timer);
  }, []);

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
        padding: '3rem',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            background: 'rgba(239, 68, 68, 0.1)', 
            borderRadius: '16px', 
            margin: '0 auto 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            boxShadow: '0 0 20px rgba(239, 68, 68, 0.1)'
          }}>
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="var(--error)">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontWeight: 700 }}>Logging Out</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Securing your session and redirecting...</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
          <div className="pulse-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)' }}></div>
          <div className="pulse-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)', animationDelay: '0.2s' }}></div>
          <div className="pulse-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)', animationDelay: '0.4s' }}></div>
        </div>

        <style jsx>{`
          .pulse-dot {
            animation: pulse 1.5s infinite ease-in-out;
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.5); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}
