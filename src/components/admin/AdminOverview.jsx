import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, Users, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../api';
import { useTranslation } from 'react-i18next';

export default function AdminOverview({ onNavigate }) {
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/complaints'),
      api.get('/workers'),
    ]).then(([cr, wr]) => {
      setComplaints(cr.data.complaints || []);
      setWorkers(wr.data.workers || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const counts = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    assigned: complaints.filter(c => c.status === 'assigned').length,
    reverification: complaints.filter(c => c.status === 'reverification').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  };

  const stats = [
    { label: t('dashboard.total', 'Total Complaints'), value: counts.total, icon: FileText, color: '#6366f1', bg: 'blue' },
    { label: t('admin.pendingReview', 'Pending Review'), value: counts.pending, icon: Clock, color: '#f59e0b', bg: 'amber' },
    { label: t('admin.activeWorkers', 'Active Workers'), value: workers.filter(w => w.isAvailable).length, icon: Users, color: '#22d3ee', bg: 'blue' },
    { label: t('dashboard.resolved', 'Resolved'), value: counts.resolved, icon: CheckCircle, color: '#10b981', bg: 'green' },
  ];

  const recent = complaints.slice(0, 5);
  const statusColors = { pending: '#f59e0b', assigned: '#6366f1', reverification: '#f97316', resolved: '#10b981' };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div className="page-enter">
      <div className="stats-grid" style={{ marginBottom: 32 }}>
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`stat-card ${stat.bg}`}
          >
            <div className="stat-icon"><stat.icon size={24} color={stat.color} /></div>
            <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Pending Alert */}
      {counts.pending > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => onNavigate('complaints')}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px 24px', borderRadius: 14, marginBottom: 28, cursor: 'pointer',
            background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertCircle size={22} color="#f59e0b" />
            <div>
              <div style={{ fontWeight: 700, color: '#f59e0b' }}>{counts.pending} {t('admin.complaintsAwaiting', 'complaints awaiting review')}</div>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{t('admin.reviewPrompt', 'Click to review and assign workers')}</div>
            </div>
          </div>
          <span style={{ color: '#f59e0b' }}>{t('admin.reviewAction', 'Review →')}</span>
        </motion.div>
      )}

      {/* Recent complaints table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="section-title">{t('dashboard.recent', 'Recent Complaints')}</h3>
            <button onClick={() => onNavigate('complaints')} style={{ color: '#f59e0b', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.83rem', fontWeight: 600 }}>
              {t('nav.viewAll', 'View All')} →
            </button>
          </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>{t('complaint.category', 'Category')}</th>
                <th>{t('complaint.area', 'Area')}</th>
                <th>{t('admin.table.citizen', 'Citizen')}</th>
                <th>{t('admin.table.status', 'Status')}</th>
                <th>{t('admin.table.date', 'Date')}</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600, color: '#e2e8f0' }}>{t(`complaint.cats.${c.category}`, c.category)}</td>
                  <td>{c.area || 'N/A'}</td>
                  <td>{c.userName}</td>
                  <td>
                    <span style={{ background: `${statusColors[c.status]}20`, color: statusColors[c.status], border: `1px solid ${statusColors[c.status]}40`, padding: '3px 10px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700 }}>
                      {t(`dashboard.${c.status}`, c.status?.toUpperCase())}
                    </span>
                  </td>
                  <td>{new Date(c.createdAt).toLocaleDateString(t('app.locale', 'en-IN'))}</td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: '#475569' }}>{t('dashboard.noComplaints', 'No complaints yet.')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
