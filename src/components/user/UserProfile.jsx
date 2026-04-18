import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Shield, Calendar } from 'lucide-react';
import { getAvatarUrl } from '../../utils/avatar';
import { useTranslation } from 'react-i18next';
export default function UserProfile() {
  const { t } = useTranslation();
  const { currentUser, dbUser } = useAuth();

  const infoItems = [
    { icon: User, label: t('auth.name', 'Full Name'), value: currentUser?.displayName || 'N/A' },
    { icon: Mail, label: t('auth.email', 'Email Address'), value: currentUser?.email || 'N/A' },
    { icon: Shield, label: t('auth.role', 'Account Role'), value: dbUser?.role === 'admin' ? t('nav.admin', 'Administrator') : t('nav.user', 'Citizen') },
    { icon: Calendar, label: t('auth.memberSince', 'Member Since'), value: dbUser?.createdAt ? new Date(dbUser.createdAt).toLocaleDateString(t('app.locale', 'en-IN'), { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A' },
  ];

  return (
    <div className="page-enter">
      <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.4rem', marginBottom: 24 }}>{t('nav.profile', 'Profile')}</h2>

      {/* Profile Card */}
      <div style={{ maxWidth: 520 }}>
        <div style={{
          padding: '32px', borderRadius: 20, border: '1px solid var(--border)',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(34,211,238,0.04))',
          textAlign: 'center', marginBottom: 24,
        }}>
          <img
            src={getAvatarUrl(currentUser, 128)}
            alt="avatar"
            style={{ width: 80, height: 80, borderRadius: '50%', border: '3px solid rgba(99,102,241,0.5)', marginBottom: 16, boxShadow: '0 0 25px rgba(99,102,241,0.25)', background: '#1e1b4b', objectFit: 'cover' }}
          />
          <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.3rem', marginBottom: 4 }}>
            {currentUser?.displayName || 'User'}
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{currentUser?.email}</p>
          <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 999, fontSize: '0.78rem', color: '#818cf8', fontWeight: 600 }}>
            <Shield size={13} /> {dbUser?.role === 'admin' ? t('nav.admin', 'Administrator') : t('nav.verifiedUser', 'Verified Citizen')}
          </div>
        </div>

        {/* Info Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {infoItems.map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <item.icon size={18} color="#6366f1" />
              </div>
              <div>
                <div style={{ fontSize: '0.73rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.label}</div>
                <div style={{ fontSize: '0.9rem', color: '#e2e8f0', fontWeight: 500, marginTop: 2 }}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20, padding: '14px 18px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, fontSize: '0.82rem', color: '#6ee7b7', lineHeight: 1.6 }}>
          🔒 {t('auth.managedMsg', 'Your profile is managed by Google. To update your name or photo, update your Google Account.')}
        </div>
      </div>
    </div>
  );
}
