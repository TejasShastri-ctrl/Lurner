import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { fetchQueById, submitSolution, executeSql, fetchHistory } from "./api/api";
import { useAuth } from "./context/AuthContext";

/* ── Toast component ── */
function Toast({ toasts, dismiss }) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 18px',
          background: t.type === 'success' ? '#ecfdf5' : t.type === 'error' ? '#fef2f2' : '#f0f9ff',
          border: `1px solid ${t.type === 'success' ? '#a7f3d0' : t.type === 'error' ? '#fecaca' : '#bae6fd'}`,
          borderLeft: `4px solid ${t.type === 'success' ? '#10b981' : t.type === 'error' ? '#ef4444' : '#38bdf8'}`,
          borderRadius: 10,
          boxShadow: '0 4px 16px rgba(15,23,42,0.10)',
          minWidth: 280, maxWidth: 360,
          pointerEvents: 'all', cursor: 'pointer',
          animation: 'toastIn 0.3s ease forwards',
        }} onClick={() => dismiss(t.id)}>
          <span style={{ fontSize: '1.1rem' }}>
            {t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem',
              color: t.type === 'success' ? '#065f46' : t.type === 'error' ? '#991b1b' : '#0369a1' }}>
              {t.title}
            </div>
            {t.body && (
              <div style={{ fontSize: '0.78rem', marginTop: 2,
                color: t.type === 'success' ? '#047857' : t.type === 'error' ? '#b91c1c' : '#0284c7' }}>
                {t.body}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((type, title, body) => {
    const id = Date.now();
    setToasts(t => [...t, { id, type, title, body }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4500);
  }, []);
  const dismiss = useCallback(id => setToasts(t => t.filter(x => x.id !== id)), []);
  return { toasts, add, dismiss };
}

/* ── Main component ── */
export function SqlExecutionWindow() {
  const { id }                   = useParams();
  const navigate                 = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const { toasts, add, dismiss } = useToast();

  const [question, setQuestion]  = useState(null);
  const [query, setQuery]        = useState("select * from employees");
  const [results, setResults]    = useState([]);
  const [history, setHistory]    = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [executionTimeMs, setExecutionTimeMs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('result'); // 'result', 'expected', 'history'
  const [sessionId]              = useState(() => crypto.randomUUID?.() || Math.random().toString(36).substring(2, 15));

  const loadHistory = useCallback(async () => {
    if (id && token) {
      const data = await fetchHistory(id, token);
      setHistory(Array.isArray(data) ? data : []);
    }
  }, [id, token]);

  useEffect(() => {
    if (id && token) {
      setLoading(true);
      fetchQueById(id, token)
        .then(data => {
          setQuestion(data);
          setLoading(false);
          loadHistory();
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id, token, loadHistory]);

  const handleExecute = async () => {
    if (!isAuthenticated) { add('info', 'Sign in required', 'Please sign in to run queries.'); return navigate('/login'); }
    setExecuting(true); setErrorMessage(null); setResults([]);
    const start = performance.now();
    try {
      const data = await executeSql(query, id, token, sessionId);
      setExecutionTimeMs(Math.round(performance.now() - start));
      if (data.errorMessage) { 
        setErrorMessage(data.errorMessage); 
        add('error', 'Query Error', data.errorMessage.substring(0, 80)); 
      }
      else { 
        setResults(Array.isArray(data.results) ? data.results : []); 
        setActiveTab('result');
      }
      loadHistory();
    } catch { 
      setErrorMessage("Network error: Could not connect to the database engine."); 
      add('error', 'Network Error', 'Could not connect to the database engine.'); 
    }
    finally { setExecuting(false); }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) { add('info', 'Sign in required', 'Please sign in to submit.'); return navigate('/login'); }
    try {
      const data = await submitSolution(query, id, token, sessionId);
      if (data.isCorrect) add('success', 'Correct!', "You've solved this challenge. Great work!");
      else add('error', 'Not quite', "The output doesn't match the expected result.");
      loadHistory();
    } catch { add('error', 'Submit failed', 'Please try again.'); }
  };

  const restoreFromHistory = (code) => {
    setQuery(code);
    add('info', 'Code Restored', 'Past attempt has been loaded into the editor.');
  };

  if (loading || !question) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 36, height: 36, border: '3px solid var(--border)',
          borderTopColor: 'var(--accent)', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite', margin: '0 auto 14px' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Initialising sandbox…</p>
      </div>
    </div>
  );

  return (
    <>
      <Toast toasts={toasts} dismiss={dismiss} />

      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
        
        {/* Top toolbar */}
        <div style={{ height: 48, background: 'white', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => navigate('/')} style={{ background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 600 }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
              Back to Arena
            </button>
            <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{question.title}</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, 
              background: 'var(--bg-app)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>#{id}</span>
          </div>
          
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleExecute} disabled={executing} className="btn" style={{ background: 'var(--bg-app)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '6px 14px', fontSize: '0.82rem' }}>
              {executing ? 'Running...' : 'Run Query'}
            </button>
            <button onClick={handleSubmit} disabled={executing} className="btn btn-primary" style={{ padding: '6px 20px', fontSize: '0.82rem' }}>
              Submit Solution
            </button>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Left Panel: Brief */}
          <div style={{ maxWidth: '350px', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'white' }}>
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 12 }}>Description</h2>
              <div style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                {question.description}
              </div>
              
              {/* Schema Preview */}
              {question.schemaSample && (
                <div style={{ marginTop: 32 }}>
                  <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, overflow: "auto" }}>
                    Table Preview: <span style={{ color: 'var(--accent)', textTransform: 'none' }}>{question.dbTableName}</span>
                  </h3>
                  <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', background: 'var(--bg-app)', overflowX: 'auto' }}>
                    <DataGrid data={question.schemaSample} isMini />
                  </div>
                </div>
              )}

              <div style={{ marginTop: 32 }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                  Difficulty
                </h3>
                <span style={{ padding: '4px 12px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, 
                  background: 'var(--bg-app)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                  {question.difficulty}
                </span>
              </div>
            </div>
          </div>

          {/* Right Panel: Editor & Results */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>
            {/* Editor Area */}
            <div style={{ flex: 1, position: 'relative', borderBottom: '1px solid var(--border)' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, zIndex: 10, padding: 12 }}>
                 <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.8)', padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border)' }}>
                   SQL EDITOR
                 </span>
              </div>
              <Editor
                height="100%"
                defaultLanguage="sql"
                theme="vs-light"
                value={query}
                onChange={setQuery}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: 'var(--font-mono)',
                  scrollBeyondLastLine: false,
                  lineNumbers: 'on',
                  padding: { top: 16 }
                }}
              />
            </div>

            {/* Results Area (IDE Style Grid) */}
            <div style={{ height: '40%', display: 'flex', flexDirection: 'column', background: 'white' }}>
              {/* Grid Header / Tabs */}
              <div style={{ height: 36, background: '#f8fafc', borderBottom: '1px solid var(--border)', 
                display: 'flex', alignItems: 'center', padding: '0 12px', gap: 2 }}>
                <TabButton active={activeTab === 'result'} onClick={() => setActiveTab('result')}>
                  Output
                </TabButton>
                <TabButton active={activeTab === 'expected'} onClick={() => setActiveTab('expected')}>
                  Expected
                </TabButton>
                <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')}>
                  History {history.length > 0 && `(${history.length})`}
                </TabButton>
                <div style={{ flex: 1 }} />
                {results.length > 0 && activeTab === 'result' && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {results.length} rows returned
                  </span>
                )}
              </div>

              {/* Grid Body */}
              <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
                {activeTab === 'result' && <DataGrid data={results} error={errorMessage} />}
                {activeTab === 'expected' && <DataGrid data={question.expectedOutput} />}
                {activeTab === 'history' && (
                  <div style={{ padding: '16px' }}>
                    {history.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        You haven't made any attempts yet.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {history.map((h) => (
                          <div key={h.id} style={{ 
                            display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', 
                            background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 8,
                            transition: 'transform 0.1s'
                          }}>
                            <div style={{ 
                              width: 8, height: 8, borderRadius: '50%', 
                              background: h.status === 'SUCCESS' ? '#10b981' : h.status === 'FAIL' ? '#f59e0b' : '#ef4444' 
                            }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                  {h.status}
                                </span>
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                  {new Date(h.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginTop: 4, 
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '400px' }}>
                                {h.code}
                              </div>
                            </div>
                            <button 
                              onClick={() => restoreFromHistory(h.code)}
                              style={{ padding: '4px 12px', fontSize: '0.7rem', fontWeight: 700, background: 'white', border: '1px solid var(--border)', borderRadius: 4, cursor: 'pointer' }}
                              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                            >
                              Restore
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Grid Footer / Status Bar */}
              <div style={{ height: 24, background: 'var(--bg-sidebar)', color: 'rgba(255,255,255,0.5)',
                display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: '0.68rem', fontWeight: 500 }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  <span>READY</span>
                  {executing && <span>RUNNING...</span>}
                  {executionTimeMs > 0 && <span>TIME: {executionTimeMs}ms</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * IDE-Style Data Grid Component
 */
function DataGrid({ data, error, isMini = false }) {
  if (error) {
    return (
      <div style={{ padding: 20, color: '#dc2626', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', whiteSpace: 'pre-wrap' }}>
        <div style={{ fontWeight: 800, marginBottom: 8 }}>Execution Error:</div>
        {error}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
        color: 'var(--text-muted)', fontSize: '0.82rem', fontStyle: 'italic' }}>
        No results to display. Run a query to see output.
      </div>
    );
  }

  const headers = Object.keys(data[0]);
  const fontSize = isMini ? '0.7rem' : '0.82rem';
  const padding = isMini ? '4px 8px' : '6px 12px';

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize }}>
      <thead>
        <tr style={{ position: 'sticky', top: 0, zIndex: 5, background: '#f1f5f9' }}>
          <th style={gridThStyle({ width: isMini ? 30 : 40, borderRight: '1px solid var(--border)', padding })}>#</th>
          {headers.map(h => (
            <th key={h} style={gridThStyle({ padding })}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#fafbfc' }}>
            <td style={{ padding, textAlign: 'center', color: 'var(--text-muted)', background: '#f8fafc', borderRight: '1px solid var(--border)' }}>
              {i + 1}
            </td>
            {headers.map(h => (
              <td key={h} style={{ padding, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                {row[h] === null ? <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>NULL</span> : String(row[h])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TabButton({ active, children, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '4px 12px', borderRadius: '4px 4px 0 0', border: 'none', cursor: 'pointer',
      fontSize: '0.72rem', fontWeight: 700, transition: 'all 0.1s',
      background: active ? 'white' : 'transparent',
      color: active ? 'var(--accent)' : 'var(--text-muted)',
      boxShadow: active ? '0 -1px 0 var(--accent) inset' : 'none',
    }}>
      {children}
    </button>
  );
}

function gridThStyle(extra = {}) {
  return {
    padding: '8px 12px',
    textAlign: 'left',
    fontSize: '0.7rem',
    fontWeight: 800,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
    borderBottom: '1px solid var(--border)',
    whiteSpace: 'nowrap',
    ...extra
  };
}
