import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);
  const [loading, setLoading]   = useState(false);

  const { register } = useAuth();
  const navigate     = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await register(username, email, password);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - var(--header-h))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ height: 5, borderRadius: '99px 99px 0 0',
          background: 'linear-gradient(90deg, #4f46e5, #818cf8)' }} />
        <div style={{
          background: 'var(--bg-content)',
          borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
          border: '1px solid var(--border)', borderTop: 'none',
          boxShadow: 'var(--shadow-lg)', padding: '36px 36px 32px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
          </div>

          <header style={{ textAlign: 'center', marginBottom: 28 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)',
              letterSpacing: '-0.02em', marginBottom: 6 }}>
              Join Lurner
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Start your journey to SQL mastery today.
            </p>
          </header>

          {error && (
            <div style={{ marginBottom: 20, padding: '12px 16px',
              background: 'var(--danger-bg)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 'var(--radius-sm)', color: 'var(--danger)',
              fontSize: '0.85rem', fontWeight: 500 }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ marginBottom: 20, padding: '12px 16px',
              background: '#d1fae5', border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: 'var(--radius-sm)', color: '#059669',
              fontSize: '0.85rem', fontWeight: 500 }}>
              Account created! Redirecting to login…
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label className="input-label">Username</label>
              <input id="reg-username" type="text" required className="input"
                placeholder="johndoe" value={username}
                onChange={e => setUsername(e.target.value)} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="input-label">Email address</label>
              <input id="reg-email" type="email" required className="input"
                placeholder="name@example.com" value={email}
                onChange={e => setEmail(e.target.value)} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label className="input-label">Password</label>
              <input id="reg-password" type="password" required className="input"
                placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)} />
            </div>
            <button id="reg-submit" type="submit" disabled={loading || success}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px 20px', fontSize: '0.9rem' }}>
              {loading ? <><div className="spinner" /> Creating account…</> : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.85rem',
            color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
