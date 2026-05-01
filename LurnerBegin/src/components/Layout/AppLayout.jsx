import { NavLink, Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import FriendsSidebar from "../Social/FriendsSidebar";
import {BookOpen, BookCheck, DatabaseZap} from 'lucide-react';

const ArenaIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);

const LurnerMark = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <div style={{
      width: 32, height: 32, borderRadius: 8,
      background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(99,102,241,0.4)', flexShrink: 0,
    }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    </div>
    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'white',
      letterSpacing: '-0.02em', fontFamily: 'var(--font-sans)' }}>
      Lurner
    </span>
  </div>
);

export default function AppLayout({ children }) {
  const { user, logout, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const SIDEBAR_W = 210;
  const FRIENDS_W = 260;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-app)' }}>

      {/* ── Left Sidebar ── */}
      <aside style={{
        width: SIDEBAR_W, background: 'var(--bg-sidebar)',
        height: '100vh', position: 'fixed', top: 0, left: 0,
        display: 'flex', flexDirection: 'column', zIndex: 50,
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Brand */}
        <div style={{ height: 60, padding: '0 20px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <LurnerMark />
          </Link>
        </div>

        {/* Nav section label */}
        <div style={{ padding: '20px 20px 8px', fontSize: '0.65rem', fontWeight: 700,
          color: 'rgba(199,210,254,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          Navigate
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0 12px', overflowY: 'auto' }}>
          <NavLink to="/" end style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 8, textDecoration: 'none',
            fontSize: '0.875rem', fontWeight: 500, marginBottom: 2,
            color: isActive ? 'white' : 'var(--text-on-sidebar)',
            background: isActive ? 'var(--bg-sidebar-active)' : 'transparent',
            borderLeft: isActive ? '3px solid #818cf8' : '3px solid transparent',
            transition: 'all 0.15s',
          })}>
            {/* <span style={{ opacity: 0.8 }}><ArenaIcon /></span> */}
            <DatabaseZap size={16} color="currentColor" /> 
            Questions
          </NavLink>
        </nav>

        {/* Sidebar footer: user info or auth links */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'linear-gradient(135deg, #818cf8, #6366f1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 700, color: 'white', flexShrink: 0,
              }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'white',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(199,210,254,0.5)', fontWeight: 500 }}>Active</div>
              </div>
              <button onClick={logout} title="Log out" style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'rgba(199,210,254,0.4)', padding: 4, borderRadius: 4,
                display: 'flex', alignItems: 'center', transition: 'color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(199,210,254,0.4)'}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link to="/register" className="btn btn-primary" style={{
                width: '100%', justifyContent: 'center',
                fontSize: '0.8rem', padding: '9px 16px',
              }}>
                Get Started
              </Link>
              <Link to="/login" style={{
                textAlign: 'center', fontSize: '0.78rem',
                color: 'var(--text-on-sidebar)', textDecoration: 'none',
                padding: '4px 0', transition: 'color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'white'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-on-sidebar)'}
              >
                Sign in
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main column ── */}
      <div style={{
        flex: 1,
        marginLeft: SIDEBAR_W,
        marginRight: isAuthenticated ? (sidebarOpen ? FRIENDS_W : 48) : 0,
        display: 'flex', flexDirection: 'column', minHeight: '100vh',
        transition: 'margin-right 0.25s ease',
      }}>
        {/* Header */}
        <header style={{
          height: 60, background: 'var(--bg-header)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px', position: 'sticky', top: 0, zIndex: 40,
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Lurner
          </span>

          {!isAuthenticated && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link to="/login" style={{ fontSize: '0.875rem', fontWeight: 500,
                color: 'var(--text-secondary)', textDecoration: 'none',
                transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '7px 16px', fontSize: '0.82rem' }}>
                Create Account
              </Link>
            </div>
          )}
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '1px 3px' }} className="fade-up">
          {children}
        </main>
      </div>

      {/* ── Friends sidebar (retractable) ── */}
      {isAuthenticated && (
        <FriendsSidebar
          open={sidebarOpen}
          onToggle={() => setSidebarOpen(o => !o)}
          width={FRIENDS_W}
        />
      )}
    </div>
  );
}
