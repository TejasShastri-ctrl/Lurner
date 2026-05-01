import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllQuestions } from '../api/api.js';
import { useAuth } from '../context/AuthContext';

const DIFFICULTY_META = {
  EASY:   { label: 'Easy',   color: '#16a34a', bg: '#dcfce7', border: '#bbf7d0' },
  MEDIUM: { label: 'Medium', color: '#d97706', bg: '#fef3c7', border: '#fde68a' },
  HARD:   { label: 'Hard',   color: '#dc2626', bg: '#fee2e2', border: '#fecaca' },
};

function DiffBadge({ difficulty }) {
  const m = DIFFICULTY_META[difficulty] || DIFFICULTY_META.EASY;
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 99,
      fontSize: '0.72rem',
      fontWeight: 700,
      background: m.bg,
      color: m.color,
      border: `1px solid ${m.border}`,
    }}>
      {m.label}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {[60, 260, 90, 80].map((w, i) => (
        <td key={i} style={{ padding: '14px 20px' }}>
          <div style={{
            height: 14, width: w, borderRadius: 6,
            background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
            backgroundSize: '400px 100%',
            animation: 'shimmer 1.4s ease infinite',
          }} />
        </td>
      ))}
    </tr>
  );
}

export default function Home() {
  const { token } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('ALL'); // Difficulty: ALL, EASY, MEDIUM, HARD
  const [statusFilter, setStatusFilter] = useState('ALL'); // Status: ALL, SOLVED, UNSOLVED
  const [search, setSearch]       = useState('');
  const [hoveredId, setHoveredId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      fetchAllQuestions(token)
        .then(data => { 
          setQuestions(Array.isArray(data) ? data : []); 
          setLoading(false); 
        })
        .catch(() => {
          setQuestions([]);
          setLoading(false);
        });
    }
  }, [token]);

  const difficulties = ['ALL', 'EASY', 'MEDIUM', 'HARD'];
  const statuses = ['ALL', 'SOLVED', 'UNSOLVED'];

  const safeQuestions = Array.isArray(questions) ? questions : [];

  const filtered = safeQuestions.filter(q => {
    const matchDiff = filter === 'ALL' || q.difficulty === filter;
    const matchSearch = q.title.toLowerCase().includes(search.toLowerCase());
    
    const progress = q.progress && q.progress[0];
    const isSolved = progress?.isCompleted;
    
    let matchStatus = true;
    if (statusFilter === 'SOLVED') matchStatus = isSolved;
    if (statusFilter === 'UNSOLVED') matchStatus = !isSolved;

    return matchDiff && matchSearch && matchStatus;
  });

  const counts = {
    ALL:    safeQuestions.length,
    EASY:   safeQuestions.filter(q => q.difficulty === 'EASY').length,
    MEDIUM: safeQuestions.filter(q => q.difficulty === 'MEDIUM').length,
    HARD:   safeQuestions.filter(q => q.difficulty === 'HARD').length,
    SOLVED: safeQuestions.filter(q => q.progress && q.progress[0]?.isCompleted).length,
    UNSOLVED: safeQuestions.filter(q => !q.progress || !q.progress[0]?.isCompleted).length,
  };

  return (
    <div style={{ paddingLeft:20, paddingTop: 5, maxWidth: 900 }}>

      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)',
          letterSpacing: '-0.02em', marginBottom: 4 }}>
          Problem Set
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
          Solve SQL challenges to sharpen your skills and climb the leaderboard.
        </p>
      </div>

      {/* Toolbar: filter tabs + search */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>

        {/* Filters Container */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {/* Difficulty tabs */}
          <div style={{ display: 'flex', gap: 4, background: 'var(--bg-app)',
            border: '1px solid var(--border)', borderRadius: 10, padding: 4 }}>
            {difficulties.map(d => {
              const active = filter === d;
              const meta = DIFFICULTY_META[d];
              return (
                <button key={d} onClick={() => setFilter(d)} style={{
                  padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer',
                  fontSize: '0.78rem', fontWeight: 600,
                  background: active ? 'white' : 'transparent',
                  color: active
                    ? (meta ? meta.color : 'var(--text-primary)')
                    : 'var(--text-muted)',
                  boxShadow: active ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.15s',
                }}>
                  {d === 'ALL' ? 'All' : DIFFICULTY_META[d].label}
                  <span style={{ marginLeft: 5, opacity: 0.65, fontWeight: 500 }}>
                    {counts[d]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Status tabs */}
          <div style={{ display: 'flex', gap: 4, background: 'var(--bg-app)',
            border: '1px solid var(--border)', borderRadius: 10, padding: 4 }}>
            {statuses.map(s => {
              const active = statusFilter === s;
              return (
                <button key={s} onClick={() => setStatusFilter(s)} style={{
                  padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer',
                  fontSize: '0.78rem', fontWeight: 600,
                  background: active ? 'white' : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--text-muted)',
                  boxShadow: active ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.15s',
                }}>
                  {s === 'ALL' ? 'Everything' : s.charAt(0) + s.slice(1).toLowerCase()}
                  <span style={{ marginLeft: 5, opacity: 0.65, fontWeight: 500 }}>
                    {counts[s]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', pointerEvents: 'none' }}
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search problems…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              paddingLeft: 32, paddingRight: 14, paddingTop: 8, paddingBottom: 8,
              border: '1px solid var(--border)', borderRadius: 8, outline: 'none',
              fontSize: '0.82rem', color: 'var(--text-primary)',
              background: 'white', width: 200,
              transition: 'border-color 0.15s, box-shadow 0.15s',
              fontFamily: 'var(--font-sans)',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: 'white', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)', overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
              <th style={thStyle({ width: 40 })}>Status</th>
              <th style={thStyle({ width: 60 })}>#</th>
              <th style={thStyle({ textAlign: 'left' })}>Title</th>
              <th style={thStyle({ width: 110 })}>Difficulty</th>
              <th style={thStyle({ width: 90 })}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '48px 20px', textAlign: 'center',
                  color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {search ? `No problems match "${search}"` : 'No problems available yet.'}
                </td>
              </tr>
            ) : (
              filtered.map((q, idx) => {
                const isHovered = hoveredId === q.id;
                const progress = q.progress && q.progress[0];
                const isSolved = progress?.isCompleted;
                const isAttempted = progress?.attempts > 0;

                return (
                  <tr
                    key={q.id}
                    onClick={() => navigate(`/editor/${q.id}`)}
                    onMouseEnter={() => setHoveredId(q.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      borderBottom: idx < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                      background: isHovered ? '#f5f7ff' : (idx % 2 === 0 ? 'white' : '#fafbfc'),
                      cursor: 'pointer',
                      transition: 'background 0.12s',
                    }}
                  >
                    {/* Status */}
                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      {isSolved ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      ) : isAttempted ? (
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b', margin: '0 auto', boxShadow: '0 0 4px #f59e0b' }} />
                      ) : null}
                    </td>

                    {/* Index */}
                    <td style={{ padding: '14px 20px', textAlign: 'center',
                      fontFamily: 'var(--font-mono)', fontSize: '0.78rem',
                      color: 'var(--text-muted)', fontWeight: 500 }}>
                      {String(idx + 1).padStart(2, '0')}
                    </td>

                    {/* Title */}
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        fontWeight: 600, color: isHovered ? 'var(--accent)' : 'var(--text-primary)',
                        transition: 'color 0.12s',
                      }}>
                        {q.title}
                      </span>
                      {q.description && (
                        <p style={{ marginTop: 2, fontSize: '0.76rem', color: 'var(--text-muted)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          maxWidth: 420 }}>
                          {q.description}
                        </p>
                      )}
                    </td>

                    {/* Difficulty */}
                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      <DiffBadge difficulty={q.difficulty} />
                    </td>

                    {/* Action */}
                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      <span style={{
                        fontSize: '0.75rem', fontWeight: 600,
                        color: isHovered ? 'var(--accent)' : 'var(--text-muted)',
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        transition: 'color 0.12s, transform 0.12s',
                        transform: isHovered ? 'translateX(2px)' : 'none',
                      }}>
                        Solve
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2.5">
                          <line x1="5" y1="12" x2="19" y2="12"/>
                          <polyline points="12 5 19 12 12 19"/>
                        </svg>
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Table footer */}
        {!loading && filtered.length > 0 && (
          <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border)',
            background: '#f8fafc', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Showing {filtered.length} of {safeQuestions.length} problem{safeQuestions.length !== 1 ? 's' : ''}
            </span>
            <div style={{ display: 'flex', gap: 16 }}>
              {['EASY', 'MEDIUM', 'HARD'].map(d => (
                <span key={d} style={{ fontSize: '0.72rem', fontWeight: 600,
                  color: DIFFICULTY_META[d].color }}>
                  {counts[d]} {DIFFICULTY_META[d].label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function thStyle(extra = {}) {
  return {
    padding: '11px 20px',
    fontSize: '0.68rem', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.09em',
    color: 'var(--text-muted)', textAlign: 'center',
    whiteSpace: 'nowrap',
    ...extra,
  };
}
