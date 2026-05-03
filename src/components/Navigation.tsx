"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { logoutAction } from "@/app/actions/auth";
import { useSession } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [pendingCount, setPendingCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch pending approval count for admins
  useEffect(() => {
    if (!isAdmin) return;
    async function fetchPending() {
      try {
        const res = await fetch('/api/pending-count');
        if (res.ok) {
          const data = await res.json();
          setPendingCount(data.count);
        }
      } catch {}
    }
    fetchPending();
    const interval = setInterval(fetchPending, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [isAdmin]);

  return (
    <aside className="erp-sidebar">
      <div className="sidebar-logo">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(59, 130, 246, 0.3)'
          }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>RAB Pro</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>ERP System</div>
          </div>
        </Link>
      </div>

      <div className="sidebar-nav" style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' }}>
        <div className="nav-heading" style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0.5rem 0.5rem 0.25rem', marginBottom: '0.25rem' }}>
          Navigation
        </div>

        <Link href="/" className={`sidebar-link ${pathname === '/' ? 'active' : ''}`}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          Dashboard
        </Link>

        <Link href="/projects" className={`sidebar-link ${pathname && pathname.startsWith('/projects') ? 'active' : ''}`}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          Projects
        </Link>

        <Link href="/progress" className={`sidebar-link ${pathname && pathname.startsWith('/progress') ? 'active' : ''}`}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Progress
        </Link>

        <Link href="/timeline" className={`sidebar-link ${pathname && pathname.startsWith('/timeline') ? 'active' : ''}`}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Timeline
        </Link>

        <Link href="/inventory" className={`sidebar-link ${pathname && pathname.startsWith('/inventory') ? 'active' : ''}`}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          Inventory
        </Link>

        {mounted && isAdmin && (
          <Link href="/approvals" className={`sidebar-link ${pathname && pathname.startsWith('/approvals') ? 'active' : ''}`} style={{ position: 'relative' }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Approvals
            {pendingCount > 0 && (
              <span style={{
                position: 'absolute', right: '0.5rem',
                background: '#ef4444', color: 'white',
                fontSize: '0.6rem', fontWeight: 700,
                padding: '0.05rem 0.35rem', borderRadius: '99px',
                minWidth: '16px', textAlign: 'center'
              }}>
                {pendingCount}
              </span>
            )}
          </Link>
        )}

        <Link href="/clients" className={`sidebar-link ${pathname && pathname.startsWith('/clients') ? 'active' : ''}`}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Clients
        </Link>

        <Link href="/suppliers" className={`sidebar-link ${pathname && pathname.startsWith('/suppliers') ? 'active' : ''}`}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Suppliers
        </Link>

        <Link href="/categories" className={`sidebar-link ${pathname && pathname.startsWith('/categories') ? 'active' : ''}`}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Categories
        </Link>

        <Link href="/materials" className={`sidebar-link ${pathname && pathname.startsWith('/materials') ? 'active' : ''}`}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          Materials
        </Link>

        <Link href="/settings" className={`sidebar-link ${pathname && pathname.startsWith('/settings') ? 'active' : ''}`}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </Link>
      </div>

      <div className="sidebar-footer" style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></div>
          System Online
        </div>
        <button
          onClick={() => router.push('/logout')}
          className="sidebar-link"
          style={{
            width: '100%',
            padding: '0.6rem 0.8rem',
            background: 'rgba(239, 68, 68, 0.05)',
            color: 'var(--error)',
            border: '1px solid rgba(239, 68, 68, 0.1)',
            borderRadius: '8px',
            marginTop: '0.5rem',
            justifyContent: 'flex-start'
          }}
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
}

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [search, setSearch] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const user = session?.user as any;
  const displayName = user?.name || user?.username || "Admin User";
  const displayRole = user?.role || "Estimator";
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && search.trim()) {
      router.push(`/projects?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <header className="topbar-header">
      <div className="mobile-logo" style={{ display: 'none', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
        </div>
        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>RAB Pro</span>
      </div>

      <div className="topbar-search" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.3rem 0.75rem', flex: '0 1 220px' }}>
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-muted)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          id="topbar-search"
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearch}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.8rem', width: '150px', outline: 'none' }}
          suppressHydrationWarning
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <ThemeToggle />
        
        <div 
          onClick={() => setShowUserModal(true)}
          className="topbar-user" 
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.75rem', 
            paddingLeft: '1rem', borderLeft: '1px solid var(--border-color)', 
            visibility: mounted ? 'visible' : 'hidden', cursor: 'pointer' 
          }}
        >
          <div style={{ textAlign: 'right' }} className="desktop-only-text">
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{mounted ? displayName : '...'}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{mounted ? displayRole : '...'}</div>
          </div>
          <div style={{ 
            width: '36px', height: '36px', borderRadius: '10px', 
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontWeight: 'bold', color: 'white', fontSize: '0.9rem',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)'
          }}>
            {mounted ? initials : ''}
          </div>
        </div>
      </div>

      {/* User Info & Quick Links Modal */}
      {showUserModal && (
        <div 
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setShowUserModal(false)}
          style={{ 
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', 
            backdropFilter: 'blur(8px)', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', zIndex: 2000,
            padding: '1rem'
          }}
        >
          <div 
            className="glass-card animate-in" 
            style={{ 
              width: '100%', maxWidth: '400px', borderRadius: '20px', 
              padding: '2rem', background: 'var(--bg-secondary)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              border: '1px solid var(--border-highlight)'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ 
                width: '72px', height: '72px', borderRadius: '20px', 
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                fontSize: '1.8rem', fontWeight: 'bold', color: 'white', 
                margin: '0 auto 1rem', boxShadow: 'var(--shadow-lg)' 
              }}>
                {initials}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>{displayName}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{displayRole}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', marginTop: '0.5rem', fontWeight: 500 }}>{session?.user?.email}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Link href="/clients" onClick={() => setShowUserModal(false)} className="profile-menu-item">
                <span style={{ fontSize: '1.2rem' }}>👥</span>
                <span>Clients</span>
              </Link>
              <Link href="/categories" onClick={() => setShowUserModal(false)} className="profile-menu-item">
                <span style={{ fontSize: '1.2rem' }}>📁</span>
                <span>Categories</span>
              </Link>
              <Link href="/materials" onClick={() => setShowUserModal(false)} className="profile-menu-item">
                <span style={{ fontSize: '1.2rem' }}>📦</span>
                <span>Materials</span>
              </Link>
              <Link href="/settings" onClick={() => setShowUserModal(false)} className="profile-menu-item">
                <span style={{ fontSize: '1.2rem' }}>⚙️</span>
                <span>Settings</span>
              </Link>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={() => setShowUserModal(false)}
                style={{ flex: 1, padding: '0.85rem', borderRadius: '12px', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontWeight: 600, border: '1px solid var(--border-color)' }}
              >
                Close
              </button>
              <button 
                onClick={() => router.push('/logout')}
                style={{ flex: 1, padding: '0.85rem', borderRadius: '12px', background: 'var(--error)', color: 'white', fontWeight: 600, boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)' }}
              >
                Sign Out
              </button>
            </div>
          </div>
          <style jsx>{`
            .profile-menu-item {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 0.5rem;
              padding: 1rem;
              background: var(--bg-tertiary);
              border-radius: 16px;
              text-decoration: none;
              transition: all 0.2s ease;
              border: 1px solid var(--border-color);
            }
            .profile-menu-item:hover {
              background: var(--bg-primary);
              border-color: var(--accent-primary);
              transform: translateY(-2px);
            }
            .profile-menu-item span:last-child {
              font-size: 0.75rem;
              font-weight: 600;
              color: var(--text-primary);
            }
            .animate-in {
              animation: modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            }
            @keyframes modalIn {
              from { opacity: 0; transform: scale(0.95) translateY(10px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
          `}</style>
        </div>
      )}
    </header>
  );
}
