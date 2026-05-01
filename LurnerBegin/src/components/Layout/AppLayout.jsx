import { NavLink, Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import FriendsSidebar from "../Social/FriendsSidebar";
import {DatabaseZap, BarChart3, Trophy, Settings} from 'lucide-react';

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
  const FRIENDS_W = 300;

  const navLinkStyle = ({ isActive }) => ({
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 14px', borderRadius: 10, textDecoration: 'none',
    fontSize: '0.875rem', fontWeight: 500, marginBottom: 4,
    color: isActive ? 'white' : 'rgba(199,210,254,0.6)',
    background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
    borderLeft: isActive ? '3px solid #818cf8' : '3px solid transparent',
    transition: 'all 0.15s',
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-app)' }}>

      {/* ── Left Sidebar ── */}
      <aside style={{
        width: SIDEBAR_W, background: '#0f172a', // Sleek dark sidebar
        height: '100vh', position: 'fixed', top: 0, left: 0,
        display: 'flex', flexDirection: 'column', zIndex: 50,
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Brand */}
        <div style={{ height: 64, padding: '0 20px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <LurnerMark />
          </Link>
        </div>

        {/* Nav section */}
        <nav style={{ flex: 1, padding: '24px 12px', overflowY: 'auto' }}>
          <div style={{ padding: '0 14px 12px', fontSize: '0.65rem', fontWeight: 700,
            color: 'rgba(199,210,254,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Menu
          </div>

          <NavLink to="/" end style={navLinkStyle}>
            <DatabaseZap size={18} /> 
            Questions
          </NavLink>

          <NavLink to="/insights" style={navLinkStyle}>
            <BarChart3 size={18} /> 
            Insights
          </NavLink>

          <NavLink to="/contests" style={{...navLinkStyle({isActive:false}), opacity: 0.5, cursor: 'not-allowed'}} onClick={e => e.preventDefault()}>
            <Trophy size={18} /> 
            Contests
            <span style={{ fontSize: '0.6rem', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', marginLeft: 'auto' }}>Soon</span>
          </NavLink>
        </nav>

        {/* User Profile Footer */}
        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '10px',
                background: 'linear-gradient(135deg, #818cf8, #6366f1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.9rem', fontWeight: 700, color: 'white', flexShrink: 0,
              }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(199,210,254,0.4)' }}>Member</div>
              </div>
              <button onClick={logout} style={{ background: 'none', border: 'none', color: 'rgba(199,210,254,0.4)', cursor: 'pointer' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Sign In</Link>
          )}
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div style={{
        flex: 1,
        marginLeft: SIDEBAR_W,
        marginRight: isAuthenticated ? (sidebarOpen ? FRIENDS_W : 48) : 0,
        display: 'flex', flexDirection: 'column', minHeight: '100vh',
        transition: 'margin-right 0.25s ease',
      }}>
        <main style={{ flex: 1, padding: '0px' }}>
          {children}
        </main>
      </div>

      {/* ── Friends Sidebar ── */}
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
