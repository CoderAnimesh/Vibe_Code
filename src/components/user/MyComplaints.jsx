import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronUp, ChevronDown, AlertCircle } from 'lucide-react';
import api from '../../api';
import { useTranslation } from 'react-i18next';

function ComplaintStepper({ status }) {
  const { t } = useTranslation();
  const PHASES = [
    { key: 'pending', label: t('dashboard.submitted', 'Submitted'), icon: '📋', desc: t('dashboard.submittedDesc', 'Your complaint has been received.') },
    { key: 'assigned', label: t('dashboard.assigned', 'Worker Assigned'), icon: '👷', desc: t('dashboard.assignedDesc', 'A worker has been assigned to resolve your issue.') },
    { key: 'reverification', label: t('dashboard.reverification', 'Re-verification'), icon: '🔍', desc: t('dashboard.reverificationDesc', 'Admin is verifying the resolution.') },
    { key: 'resolved', label: t('dashboard.resolved', 'Resolved'), icon: '✅', desc: t('dashboard.resolvedDesc', 'Your complaint has been resolved!') },
  ];
  
  const phaseIndex = (st) => PHASES.findIndex(p => p.key === st);
  const currentIdx = phaseIndex(status);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, marginTop: 16, overflowX: 'auto', paddingBottom: 4 }}>
      {PHASES.map((phase, idx) => {
        const isDone = idx < currentIdx;
        const isActive = idx === currentIdx;
        return (
          <div key={phase.key} style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', position: 'relative', minWidth: 70 }}>
            {/* Line before */}
            {idx > 0 && (
              <div style={{
                position: 'absolute', left: 0, top: 15, width: '50%', height: 2,
                background: idx <= currentIdx ? 'var(--green)' : 'var(--border)',
              }} />
            )}
            {/* Line after */}
            {idx < PHASES.length - 1 && (
              <div style={{
                position: 'absolute', right: 0, top: 15, width: '50%', height: 2,
                background: idx < currentIdx ? 'var(--green)' : 'var(--border)',
              }} />
            )}

            <div style={{
              width: 32, height: 32, borderRadius: '50%', zIndex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.85rem',
              background: isDone ? 'var(--green)' : isActive ? 'var(--primary)' : 'var(--bg-secondary)',
              border: `2px solid ${isDone ? 'var(--green)' : isActive ? 'var(--primary)' : 'var(--border)'}`,
              boxShadow: isActive ? '0 0 15px rgba(99,102,241,0.4)' : 'none',
              transition: 'all 0.3s',
              animation: isActive ? 'stepPulse 2s infinite' : 'none',
            }}>
              {isDone ? '✓' : phase.icon}
            </div>
            <div style={{
              fontSize: '0.65rem', textAlign: 'center', marginTop: 6, fontWeight: isActive ? 700 : 500,
              color: isDone ? 'var(--green)' : isActive ? 'var(--primary-light)' : 'var(--text-muted)',
              maxWidth: 70, lineHeight: 1.3,
            }}>
              {phase.label}
            </div>
          </div>
        );
      })}
      <style>{`
        @keyframes stepPulse { 0%, 100% { box-shadow: 0 0 10px rgba(99,102,241,0.4); } 50% { box-shadow: 0 0 20px rgba(99,102,241,0.7); } }
      `}</style>
    </div>
  );
}

function ComplaintCard({ complaint }) {
  const { t } = useTranslation();
  const PHASES = [
    { key: 'pending', label: t('dashboard.submitted', 'Submitted'), desc: t('dashboard.submittedDesc', 'Your complaint has been received.') },
    { key: 'assigned', label: t('dashboard.assigned', 'Worker Assigned'), desc: t('dashboard.assignedDesc', 'A worker has been assigned to resolve your issue.') },
    { key: 'reverification', label: t('dashboard.reverification', 'Re-verification'), desc: t('dashboard.reverificationDesc', 'Admin is verifying the resolution.') },
    { key: 'resolved', label: t('dashboard.resolved', 'Resolved'), desc: t('dashboard.resolvedDesc', 'Your complaint has been resolved!') },
  ];
  const [expanded, setExpanded] = useState(false);
  const currentPhase = PHASES.find(p => p.key === complaint.status);
  const statusColors = { pending: '#f59e0b', assigned: '#6366f1', reverification: '#f97316', resolved: '#10b981' };

  return (
    <motion.div
      layout
      className="complaint-card"
      style={{ cursor: 'default' }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }} onClick={() => setExpanded(!expanded)}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{t(`complaint.cats.${complaint.category}`, complaint.category)}</span>
            <span style={{
              background: `${statusColors[complaint.status] || '#6366f1'}20`,
              color: statusColors[complaint.status] || '#6366f1',
              border: `1px solid ${statusColors[complaint.status] || '#6366f1'}40`,
              padding: '2px 10px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700,
            }}>
              {t(`dashboard.${complaint.status}`, complaint.status?.toUpperCase())}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#94a3b8', fontSize: '0.8rem' }}>
            <MapPin size={12} /> {complaint.area || complaint.address?.slice(0, 40) || 'N/A'}
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4, marginLeft: 8 }}
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Compact Stepper always visible */}
      <ComplaintStepper status={complaint.status} />

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              {currentPhase && (
                <div style={{ padding: '10px 14px', background: `${statusColors[complaint.status]}15`, border: `1px solid ${statusColors[complaint.status]}30`, borderRadius: 10, marginBottom: 14, fontSize: '0.83rem', color: statusColors[complaint.status] }}>
                  ℹ️ {currentPhase.desc}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.83rem' }}>
                <div>
                  <div style={{ color: '#64748b', marginBottom: 3 }}>{t('complaint.description', 'Description')}</div>
                  <div style={{ color: '#e2e8f0' }}>{complaint.description}</div>
                </div>
                <div>
                  <div style={{ color: '#64748b', marginBottom: 3 }}>{t('admin.table.date', 'Submitted On')}</div>
                  <div style={{ color: '#e2e8f0' }}>{new Date(complaint.createdAt).toLocaleDateString(t('app.locale', 'en-IN'), { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
                {complaint.workerName && (
                  <div>
                    <div style={{ color: '#64748b', marginBottom: 3 }}>{t('admin.assign', 'Assigned Worker')}</div>
                    <div style={{ color: '#818cf8', fontWeight: 600 }}>👷 {complaint.workerName}</div>
                  </div>
                )}
                {complaint.resolvedAt && (
                  <div>
                    <div style={{ color: '#64748b', marginBottom: 3 }}>{t('dashboard.resolvedOn', 'Resolved On')}</div>
                    <div style={{ color: '#10b981' }}>✅ {new Date(complaint.resolvedAt).toLocaleDateString(t('app.locale', 'en-IN'))}</div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/complaints/my')
      .then(r => setComplaints(r.data.complaints || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? complaints : complaints.filter(c => c.status === filter);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div className="page-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.4rem' }}>{t('dashboard.myComplaints', 'My Complaints')}</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.83rem', marginTop: 2 }}>{complaints.length} {t('dashboard.total', 'total complaints')}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'pending', 'assigned', 'reverification', 'resolved'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
                background: filter === f ? 'var(--primary)' : 'var(--bg-card)',
                color: filter === f ? 'white' : 'var(--text-secondary)',
                transition: 'all 0.2s',
              }}
            >
              {t(`dashboard.${f}`, f)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <AlertCircle size={48} />
          <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700 }}>{t('dashboard.noMatch', 'No matching complaints')}</h3>
          <p style={{ fontSize: '0.85rem' }}>
            {t('dashboard.noComplaints', 'You haven\'t raised any complaints yet.')}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(complaint => (
            <ComplaintCard key={complaint.id} complaint={complaint} />
          ))}
        </div>
      )}
    </div>
  );
}
