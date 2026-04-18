import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, MapPin, FileText, Bell, User, LogOut, Shield, ChevronRight, Menu, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAvatarUrl } from '../../utils/avatar';
import { signOut, auth } from '../../firebase';
import api from '../../api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function UserSidebar({ activeTab, setActiveTab, unreadCount = 0, mobileOpen, setMobileOpen }) {
  const { t } = useTranslation();
  const { currentUser, dbUser } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { id: 'overview', icon: LayoutDashboard, label: t('admin.overview', 'Overview') },
    { id: 'raise', icon: MapPin, label: t('dashboard.raise', 'Raise Complaint') },
    { id: 'complaints', icon: FileText, label: t('dashboard.myComplaints', 'My Complaints') },
    { id: 'notifications', icon: Bell, label: t('nav.notifications', 'Notifications') },
    { id: 'profile', icon: User, label: t('nav.profile', 'Profile') },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
      navigate('/');
    } catch {
      toast.error('Logout failed');
    }
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #22d3ee)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={20} color="white" />
          </div>
          <div>
            <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '0.95rem' }}>SAMADHAN</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: 1 }}>CITIZEN PORTAL</div>
          </div>
        </Link>
      </div>

      {/* User card */}
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: 'var(--bg-card)', borderRadius: 12 }}>
          <img
            src={getAvatarUrl(currentUser, 48)}
            alt="avatar"
            style={{ width: 38, height: 38, borderRadius: '50%', border: '2px solid rgba(99,102,241,0.4)', background: '#1e1b4b', objectFit: 'cover' }}
          />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentUser?.displayName || 'User'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentUser?.email}
            </div>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => { setActiveTab(item.id); setMobileOpen?.(false); }}
            whileHover={{ x: 3 }}
            whileTap={{ scale: 0.98 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: activeTab === item.id ? 'rgba(99,102,241,0.12)' : 'transparent',
              color: activeTab === item.id ? '#818cf8' : '#94a3b8',
              fontWeight: activeTab === item.id ? 600 : 500,
              fontSize: '0.88rem', textAlign: 'left',
              borderLeft: activeTab === item.id ? '3px solid #6366f1' : '3px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            <item.icon size={18} />
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.id === 'notifications' && unreadCount > 0 && (
              <span style={{ background: '#6366f1', color: 'white', fontSize: '0.68rem', fontWeight: 700, padding: '2px 7px', borderRadius: 999 }}>
                {unreadCount}
              </span>
            )}
            {activeTab === item.id && <ChevronRight size={14} style={{ opacity: 0.6 }} />}
          </motion.button>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
        <motion.button
          onClick={handleLogout}
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.97 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, width: '100%',
            padding: '11px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'rgba(239,68,68,0.08)', color: '#f87171',
            fontWeight: 500, fontSize: '0.88rem', transition: 'all 0.2s',
          }}
        >
          <LogOut size={17} /> {t('nav.logout', 'Logout')}
        </motion.button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div style={{ width: 'var(--sidebar-width)', minHeight: '100vh', background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', position: 'fixed', left: 0, top: 0, zIndex: 100 }} className="sidebar-desktop">
        <SidebarContent />
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 149, backdropFilter: 'blur(4px)' }}
        />
      )}

      {/* Mobile Sidebar */}
      <motion.div
        initial={false}
        animate={{ x: mobileOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 'var(--sidebar-width)', background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', zIndex: 150 }}
      >
        <SidebarContent />
      </motion.div>
    </>
  );
}
