import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../api/api';

export default function Insights() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [skills, setSkills] = useState([]);
  const [errors, setErrors] = useState([]);
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      Promise.all([
        api.fetchUserStats(token),
        api.fetchActivityHeatmap(token),
        api.fetchSkillMastery(token),
        api.fetchErrorDistribution(token),
        api.fetchPerformanceTelemetry(token)
      ]).then(([s, h, sk, e, t]) => {
        setStats(s);
        setHeatmap(h);
        setSkills(sk);
        setErrors(e);
        setTelemetry(t);
        setLoading(false);
      }).catch(err => {
        console.error("Failed to load insights:", err);
        setLoading(false);
      });
    }
  }, [token]);

  if (loading) {
    return (
      <div style={{ padding: '40px', color: 'var(--text-muted)' }}>
        Analyzing your SQL performance...
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 40px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header */}
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Personal Insights
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Detailed breakdown of your SQL mastery and submission habits.
        </p>
      </header>

      {/* Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', 
        marginBottom: '40px' 
      }}>
        <StatCard title="Total Solved" value={stats?.totalSolved || 0} icon="🏆" color="#10b981" />
        <StatCard title="Accuracy" value={`${stats?.accuracy || 0}%`} icon="🎯" color="#3b82f6" />
        <StatCard title="Avg Latency" value={`${telemetry?.averageExecutionTimeMs || 0}ms`} icon="⚡" color="#f59e0b" />
        <StatCard title="Total Runs" value={stats?.totalSubmissions || 0} icon="🔄" color="#8b5cf6" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', marginBottom: '40px' }}>
        
        {/* Skill Mastery */}
        <section style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '16px', 
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>Topic Mastery Breakdown</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {skills.map(skill => (
              <div key={skill.topic}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                  <span style={{ fontWeight: 600 }}>{skill.topic}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{skill.solvedQuestions}/{skill.totalQuestions} Solved</span>
                </div>
                <div style={{ height: '8px', background: 'var(--bg-app)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${skill.masteryPercentage}%`, 
                    background: 'var(--accent)', 
                    transition: 'width 1s ease-out' 
                  }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Common Errors */}
        <section style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '16px', 
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>Frequent Pitfalls</h2>
          {errors.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {errors.map(err => (
                <div key={err.errorType} style={{ 
                  padding: '12px', 
                  background: '#fff1f2', 
                  borderRadius: '8px', 
                  border: '1px solid #fecdd3',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#be123c' }}>{err.errorType}</span>
                  <span style={{ fontSize: '0.75rem', background: '#fb7185', color: 'white', padding: '2px 8px', borderRadius: '12px' }}>{err.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
              No errors recorded yet! Clean slate.
            </div>
          )}
        </section>

      </div>

      {/* Activity Heatmap Simulated */}
      <section style={{ 
        background: 'white', 
        padding: '24px', 
        borderRadius: '16px', 
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '40px'
      }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>Activity Heatmap (Last 30 Days)</h2>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {Array.from({ length: 30 }).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (29 - i));
            const dateStr = date.toISOString().split('T')[0];
            const activity = heatmap.find(h => h.date === dateStr);
            const count = activity ? activity.count : 0;
            
            let color = '#f1f5f9';
            if (count > 0) color = '#bbf7d0';
            if (count > 2) color = '#4ade80';
            if (count > 5) color = '#16a34a';

            return (
              <div 
                key={i} 
                title={`${dateStr}: ${count} activities`}
                style={{ 
                  width: '20px', 
                  height: '20px', 
                  background: color, 
                  borderRadius: '4px',
                  border: '1px solid rgba(0,0,0,0.05)'
                }} 
              />
            );
          })}
        </div>
      </section>

    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div style={{ 
      background: 'white', 
      padding: '20px', 
      borderRadius: '16px', 
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    }}>
      <div style={{ 
        width: '48px', 
        height: '48px', 
        borderRadius: '12px', 
        background: `${color}15`, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontSize: '1.5rem'
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{title}</div>
        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{value}</div>
      </div>
    </div>
  );
}
