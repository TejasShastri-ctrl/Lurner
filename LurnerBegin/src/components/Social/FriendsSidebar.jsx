import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { fetchFriends, fetchPendingInvites, acceptInvite, declineInvite, sendInvite } from '../../api/api';

export default function FriendsSidebar({ open, onToggle, width = 300 }) {
  const { user, token } = useAuth();
  const { onlineFriends, socket } = useSocket();
  
  const [friends, setFriends] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [showInviteInput, setShowInviteInput] = useState(false);

  const loadData = useCallback(async () => {
    if (!user || !token) return;
    try {
      const [friendsData, pendingData] = await Promise.all([
        fetchFriends(token),
        fetchPendingInvites(token)
      ]);
      setFriends(Array.isArray(friendsData) ? friendsData : []);
      setPendingInvites(Array.isArray(pendingData) ? pendingData : []);
    } catch (e) {
      console.error("Failed to load social data:", e);
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Listen for real-time invite signals
  useEffect(() => {
    if (socket) {
      const handleNewInvite = () => {
        loadData(); // Re-fetch when signaled
      };
      socket.on("notification:new_invite", handleNewInvite);
      return () => socket.off("notification:new_invite", handleNewInvite);
    }
  }, [socket, loadData]);

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteCodeInput.trim()) return;
    
    setSendingInvite(true);
    try {
      const res = await sendInvite(inviteCodeInput.trim(), token);
      if (res.error) {
        alert(res.error);
      } else {
        alert("Invite sent!");
        setInviteCodeInput('');
        setShowInviteInput(false);
      }
    } catch (e) {
      alert("Failed to send invite");
    } finally {
      setSendingInvite(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await acceptInvite(id, token);
      loadData();
    } catch (e) {
      alert("Failed to accept invite");
    }
  };

  const handleDecline = async (id) => {
    try {
      await declineInvite(id, token);
      loadData();
    } catch (e) {
      alert("Failed to decline invite");
    }
  };

  if (!user) return null;

  const online  = friends.filter(f => onlineFriends.includes(f.id));
  const offline = friends.filter(f => !onlineFriends.includes(f.id));

  return (
    <aside style={{
      width: open ? width : 48,
      background: 'var(--bg-content)',
      borderLeft: '1px solid var(--border)',
      height: '100vh',
      position: 'fixed', right: 0, top: 0,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      transition: 'width 0.25s ease',
      zIndex: 100,
      boxShadow: open ? '-10px 0 30px rgba(0,0,0,0.2)' : 'none'
    }}>
      {/* Toggle button */}
      <button
        onClick={onToggle}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: open ? 'flex-end' : 'center',
          width: '100%', padding: '16px',
          background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)',
          cursor: 'pointer', color: 'var(--text-muted)',
          transition: 'all 0.15s', flexShrink: 0,
        }}
      >
        {open ? '→' : '👤'}
      </button>

      {open && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          
          {/* User's Own Code */}
          <div style={{ 
            background: 'var(--bg-app)', 
            padding: '12px', 
            borderRadius: '12px', 
            marginBottom: '24px',
            border: '1px dashed var(--border)'
          }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Your Friend Code
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <code style={{ fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 700 }}>
                {user.friendCode || 'LURN-????'}
              </code>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(user.friendCode);
                  alert("Code copied!");
                }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.7rem' }}
              >
                Copy
              </button>
            </div>
          </div>

          {/* Pending Invites */}
          {pendingInvites.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '12px' }}>
                Pending Invites ({pendingInvites.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {pendingInvites.map(invite => (
                  <div key={invite.id} style={{ 
                    background: 'var(--accent-light)', 
                    padding: '10px', 
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-dark)' }}>
                      {invite.sender.name} sent an invite
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => handleAccept(invite.id)}
                        style={{ flex: 1, padding: '4px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => handleDecline(invite.id)}
                        style={{ flex: 1, padding: '4px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Friends List */}
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>
            Friends
          </div>

          <div style={{ marginBottom: '20px' }}>
            {loading ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Loading friends...</div>
            ) : friends.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                No friends yet. Share your code to connect!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {online.map(friend => (
                  <FriendListItem key={friend.id} friend={friend} online={true} />
                ))}
                {offline.map(friend => (
                  <FriendListItem key={friend.id} friend={friend} online={false} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Invite Action */}
      {open && (
        <div style={{ padding: '20px', borderTop: '1px solid var(--border)' }}>
          {showInviteInput ? (
            <form onSubmit={handleSendInvite}>
              <input 
                type="text" 
                placeholder="Enter Friend Code..." 
                value={inviteCodeInput}
                onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                autoFocus
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  borderRadius: '8px', 
                  border: '1px solid var(--border)', 
                  background: 'var(--bg-app)', 
                  color: 'var(--text-primary)',
                  marginBottom: '8px',
                  fontSize: '0.8rem'
                }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  type="submit" 
                  disabled={sendingInvite}
                  style={{ flex: 2, padding: '8px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                >
                  {sendingInvite ? 'Sending...' : 'Send'}
                </button>
                <button 
                  type="button"
                  onClick={() => setShowInviteInput(false)}
                  style={{ flex: 1, padding: '8px', background: 'var(--bg-app)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button 
              onClick={() => setShowInviteInput(true)}
              style={{ 
                width: '100%', 
                padding: '12px', 
                borderRadius: '8px', 
                border: '1px solid var(--accent)', 
                background: 'transparent', 
                color: 'var(--accent)', 
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              + Add Friend by Code
            </button>
          )}
        </div>
      )}
    </aside>
  );
}

function FriendListItem({ friend, online }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ position: 'relative' }}>
        <div style={{ 
          width: '36px', height: '36px', borderRadius: '50%', 
          background: online ? 'var(--accent)' : 'var(--bg-app)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: online ? 'white' : 'var(--text-muted)',
          fontWeight: 700, fontSize: '0.9rem',
          border: '2px solid var(--border)'
        }}>
          {friend.name[0]}
        </div>
        {online && (
          <div style={{ 
            position: 'absolute', bottom: '0', right: '0', 
            width: '10px', height: '10px', borderRadius: '50%', 
            background: 'var(--success)', border: '2px solid var(--bg-content)' 
          }} />
        )}
      </div>
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{friend.name}</div>
        <div style={{ fontSize: '0.7rem', color: online ? 'var(--success)' : 'var(--text-muted)' }}>
          {online ? 'Online' : 'Offline'}
        </div>
      </div>
    </div>
  );
}
