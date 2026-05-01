import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { fetchFollowing } from '../../api/api';

/**
 * FriendsSidebar — Retractable right panel.
 * When collapsed, shows a slim 48px rail with a toggle button.
 */
export default function FriendsSidebar({ open, onToggle, width = 260 }) {
  const { user, token } = useAuth();
  const { onlineFriends } = useSocket();
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && token) {
      fetchFollowing(user.id, token)
        .then(data => { setFollowing(Array.isArray(data) ? data : []); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [user, token]);

  if (!user) return null;

  const online  = following.filter(f => onlineFriends.includes(f.id));
  const offline = following.filter(f => !onlineFriends.includes(f.id));

  return (
    <aside style={{
      width: open ? width : 48,
      background: 'var(--bg-content)',
      borderLeft: '1px solid var(--border)',
      height: 'calc(100vh - 60px)',
      position: 'fixed', right: 0, top: 0,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      transition: 'width 0.25s ease',
      zIndex: 60,
    }}>

      {/* Toggle button — always visible */}
      <button
        onClick={onToggle}
        title={open ? 'Collapse sidebar' : 'Expand sidebar'}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: open ? 'flex-end' : 'center',
          width: '100%', padding: open ? '12px 14px' : '12px 0',
          background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)',
          cursor: 'pointer', color: 'var(--text-muted)',
          transition: 'all 0.15s', flexShrink: 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-app)'; e.currentTarget.style.color = 'var(--accent)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
      >
        {open ? (
          /* Collapse arrow → right */
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        ) : (
          /* Expand arrow ← left + people icon stacked */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            {online.length > 0 && (
              <div style={{ width: 7, height: 7, borderRadius: '50%',
                background: 'var(--success)', boxShadow: '0 0 5px var(--success)' }} />
            )}
          </div>
        )}
      </button>

      {/* Expanded content */}
      {open && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 0' }}>

          {/* Section label */}
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
            Social Hub
          </div>

          {/* Online section */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Online
              </span>
              <div style={{ width: 7, height: 7, borderRadius: '50%',
                background: 'var(--success)', boxShadow: '0 0 6px var(--success)' }} />
            </div>

            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} style={{ height: 32, marginBottom: 8,
                  background: 'var(--bg-app)', borderRadius: 8 }} />
              ))
            ) : online.length === 0 ? (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No friends online
              </p>
            ) : (
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {online.map(friend => (
                  <FriendItem key={friend.id} friend={friend} online={true} />
                ))}
              </ul>
            )}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--border)', margin: '4px 0 16px' }} />

          {/* Offline section */}
          {!loading && offline.length > 0 && (
            <div style={{ opacity: 0.55 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)',
                marginBottom: 10 }}>
                Offline
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {offline.map(friend => (
                  <FriendItem key={friend.id} friend={friend} online={false} />
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      {open && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center',
            fontSize: '0.78rem' }}>
            Invite Friends
          </button>
        </div>
      )}
    </aside>
  );
}

function FriendItem({ friend, online }) {
  return (
    <li style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: online ? 'var(--accent-light)' : 'var(--bg-app)',
          border: `1.5px solid ${online ? 'var(--accent)' : 'var(--border)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.75rem', fontWeight: 700,
          color: online ? 'var(--accent-dark)' : 'var(--text-muted)',
          textTransform: 'uppercase',
        }}>
          {friend.name[0]}
        </div>
        {online && (
          <div style={{
            position: 'absolute', bottom: -1, right: -1,
            width: 9, height: 9, borderRadius: '50%',
            background: 'var(--success)', border: '1.5px solid var(--bg-content)',
          }} />
        )}
      </div>
      <div>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {friend.name}
        </div>
        {online && (
          <div style={{ fontSize: '0.68rem', color: 'var(--success)', fontWeight: 500 }}>
            Active now
          </div>
        )}
      </div>
    </li>
  );
}
