import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCheck } from 'lucide-react';
import api from '../../api';
import { useTranslation } from 'react-i18next';

export default function Notifications({ onUnreadChange }) {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications')
      .then(r => {
        const notifs = r.data.notifications || [];
        setNotifications(notifs);
        onUnreadChange?.(notifs.filter(n => !n.isRead).length);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      onUnreadChange?.(0);
    } catch { }
  };

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      const newUnread = notifications.filter(n => !n.isRead && n.id !== id).length;
      onUnreadChange?.(newUnread);
    } catch { }
  };

  const typeColors = { success: '#10b981', warning: '#f59e0b', info: '#6366f1' };
  const typeIcons = { success: '🎉', warning: '⚠️', info: 'ℹ️' };
  const unread = notifications.filter(n => !n.isRead).length;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div className="page-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bell size={22} color="#6366f1" /> {t('nav.notifications', 'Notifications')}
            {unread > 0 && (
              <span style={{ background: '#6366f1', color: 'white', fontSize: '0.72rem', fontWeight: 700, padding: '2px 9px', borderRadius: 999 }}>
                {unread} {t('dashboard.new', 'new')}
              </span>
            )}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.83rem', marginTop: 2 }}>{notifications.length} {t('dashboard.totalNotifs', 'total notifications')}</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCheck size={14} /> {t('nav.markAllRead', 'Mark all read')}
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <Bell size={48} />
          <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700 }}>{t('dashboard.noNotifs', 'No Notifications')}</h3>
          <p style={{ fontSize: '0.85rem' }}>{t('dashboard.noNotifsSub', 'You\'ll be notified when your complaint status changes.')}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notifications.map((notif, i) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => !notif.isRead && markRead(notif.id)}
              style={{
                padding: '16px', borderRadius: 12, cursor: notif.isRead ? 'default' : 'pointer',
                background: notif.isRead ? 'var(--bg-card)' : 'rgba(99,102,241,0.06)',
                border: '1px solid',
                borderColor: notif.isRead ? 'var(--border)' : `${typeColors[notif.type] || typeColors.info}30`,
                borderLeft: `3px solid ${typeColors[notif.type] || typeColors.info}`,
                transition: 'all 0.2s',
                opacity: notif.isRead ? 0.72 : 1,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ display: 'flex', gap: 12, flex: 1 }}>
                  <span style={{ fontSize: '1.2rem', flexShrink: 0, marginTop: 1 }}>
                    {typeIcons[notif.type] || 'ℹ️'}
                  </span>
                  <div>
                    <p style={{ fontSize: '0.88rem', color: notif.isRead ? '#94a3b8' : '#e2e8f0', lineHeight: 1.5 }}>
                      {notif.message}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#475569', marginTop: 5 }}>
                      {new Date(notif.createdAt).toLocaleString(t('app.locale', 'en-IN'), { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                {!notif.isRead && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: typeColors[notif.type] || '#6366f1', flexShrink: 0, marginTop: 5, animation: 'pulse 2s infinite' }} />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
    </div>
  );
}
