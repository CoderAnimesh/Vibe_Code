import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { useAuth } from '../../context/AuthContext';
import UserSidebar from '../../components/user/UserSidebar';
import UserOverview from '../../components/user/UserOverview';
import RaiseComplaint from '../../components/user/RaiseComplaint';
import MyComplaints from '../../components/user/MyComplaints';
import Notifications from '../../components/user/Notifications';
import UserProfile from '../../components/user/UserProfile';
import { getAvatarUrl } from '../../utils/avatar';



export default function UserDashboard() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const tabTitles = {
    overview: t('admin.overview', 'Overview'),
    raise: t('dashboard.raise', 'Raise Complaint'),
    complaints: t('dashboard.myComplaints', 'My Complaints'),
    notifications: t('nav.notifications', 'Notifications'),
    profile: t('nav.profile', 'Profile'),
  };

  const firstName = currentUser?.displayName?.split(' ')[0] || t('common.user', 'User');

  const renderContent = () => {
    const props = { key: activeTab };
    switch (activeTab) {
      case 'overview': return <UserOverview {...props} onNavigate={setActiveTab} />;
      case 'raise': return <RaiseComplaint {...props} onSuccess={() => setActiveTab('complaints')} />;
      case 'complaints': return <MyComplaints {...props} />;
      case 'notifications': return <Notifications {...props} onUnreadChange={setUnreadCount} />;
      case 'profile': return <UserProfile {...props} />;
      default: return null;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <UserSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadCount={unreadCount}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content */}
      <div style={{ marginLeft: 'var(--sidebar-width)', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Top bar */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 32px',
          background: 'rgba(7,8,15,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="mobile-menu-btn"
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'none', padding: 4 }}
            >
              <Menu size={22} />
            </button>
            <div>
              {activeTab === 'overview' && (
                <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 400, fontSize: '0.9rem', color: '#94a3b8', marginBottom: 1 }}>
                  👋 {t('dashboard.welcome', 'Welcome back')}, <span style={{ fontWeight: 700, color: '#818cf8' }}>{firstName}</span>!
                </div>
              )}
              <h1 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.2rem' }}>
                {tabTitles[activeTab]}
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <LanguageSwitcher />
            
            <button
              onClick={() => setActiveTab('notifications')}
              style={{ position: 'relative', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8', transition: 'all 0.2s' }}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', color: 'white', fontSize: '0.65rem', fontWeight: 700, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <img
              src={getAvatarUrl(currentUser, 64)}
              alt="avatar"
              style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid rgba(99,102,241,0.4)', cursor: 'pointer', background: '#1e1b4b', objectFit: 'cover' }}
              onClick={() => setActiveTab('profile')}
            />
          </div>
        </div>

        {/* Page Content */}
        <div style={{ flex: 1, padding: '32px', maxWidth: 1200, width: '100%' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
