import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, Bell, Settings, LogOut, Shield, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { signOut, auth } from '../../firebase';
import toast from 'react-hot-toast';
import { getAvatarUrl } from '../../utils/avatar';
import { useTranslation } from 'react-i18next';

export default function AdminSidebar({ activeTab, setActiveTab }) {
  const { t } = useTranslation();
  const { currentUser, dbUser } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { id: 'overview', icon: LayoutDashboard, label: t('admin.overview', 'Overview') },
    { id: 'complaints', icon: FileText, label: t('admin.complaints', 'All Complaints') },
    { id: 'workers', icon: Users, label: t('admin.workers', 'Manage Workers') },
    { id: 'notifications', icon: Bell, label: t('nav.notifications', 'Activity Feed') },
    { id: 'settings', icon: Settings, label: t('nav.settings', 'Settings') },
  ];

  const handleLogout = async () => {
    await signOut(auth);
    toast.success('Logged out');
    navigate('/');
  };

  return (
    <div style={{ width: 'var(--sidebar-width)', minHeight: '100vh', background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', position: 'fixed', left: 0, top: 0, zIndex: 100 }}>
      {/* Logo */}
      <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #f59e0b, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={20} color="white" />
          </div>
          <div>
            <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '0.95rem' }}>SAMADHAN</div>
            <div style={{ fontSize: '0.6rem', color: '#f59e0b', letterSpacing: 1, fontWeight: 600 }}>ADMIN PANEL</div>
          </div>
        </Link>
      </div>

      {/* Admin Card */}
      <div style={{ padding: '14px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 12 }}>
          <img
            src={getAvatarUrl(currentUser, 64)}
            alt="Admin Avatar"
            style={{ width: 36, height: 36, borderRadius: '50%', background: '#1e1b4b', objectFit: 'cover' }}
          />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#f59e0b' }}>Administrator</div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser?.email}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map(item => (
          <motion.button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            whileHover={{ x: 3 }}
            whileTap={{ scale: 0.98 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: activeTab === item.id ? 'rgba(245,158,11,0.1)' : 'transparent',
              color: activeTab === item.id ? '#f59e0b' : '#94a3b8',
              fontWeight: activeTab === item.id ? 600 : 500,
              fontSize: '0.88rem', textAlign: 'left',
              borderLeft: activeTab === item.id ? '3px solid #f59e0b' : '3px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            <item.icon size={18} />
            <span style={{ flex: 1 }}>{item.label}</span>
            {activeTab === item.id && <ChevronRight size={14} style={{ opacity: 0.6 }} />}
          </motion.button>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
        <motion.button onClick={handleLogout} whileHover={{ x: 3 }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'rgba(239,68,68,0.08)', color: '#f87171', fontWeight: 500, fontSize: '0.88rem' }}>
          <LogOut size={17} /> {t('nav.logout', 'Logout')}
        </motion.button>
      </div>
    </div>
  );
}
