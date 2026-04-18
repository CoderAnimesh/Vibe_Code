import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield, Mail, Lock, Eye, EyeOff, AlertCircle,
  Sun, Moon, ArrowLeft, Sparkles, Users, Wrench,
} from 'lucide-react';
import { signInWithEmailAndPassword, signInWithPopup, auth, googleProvider } from '../firebase';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

/* ─── Helpers ────────────────────────────────────────────────────────────────── */
const isDark = () => !document.body.classList.contains('light-mode');

const useThemeMode = () => {
  const [dark, setDark] = useState(isDark);
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(isDark()));
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return dark;
};

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

/* ─── Floating Orb ───────────────────────────────────────────────────────────── */
const Orb = ({ style, color, dur = 8, delay = 0 }) => (
  <motion.div
    animate={{ scale: [1, 1.18, 1], opacity: [0.6, 1, 0.6] }}
    transition={{ duration: dur, repeat: Infinity, ease: 'easeInOut', delay }}
    style={{
      position: 'absolute', borderRadius: '50%', pointerEvents: 'none',
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      filter: 'blur(50px)', ...style,
    }}
  />
);

/* ─── Input Field ────────────────────────────────────────────────────────────── */
const InputField = ({ id, label, type, icon: Icon, placeholder, value, onChange, required, dark, rightSlot, color = '#6366f1' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: dark ? '#94a3b8' : '#475569', letterSpacing: 0.3 }}>
      {label}
    </label>
    <div style={{ position: 'relative' }}>
      <Icon size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: dark ? '#4b5563' : '#94a3b8', zIndex: 1 }} />
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        style={{
          width: '100%',
          padding: '13px 40px 13px 42px',
          background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
          border: `1.5px solid ${dark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.10)'}`,
          borderRadius: 12,
          color: dark ? '#f1f5f9' : '#0f172a',
          fontSize: '0.92rem',
          outline: 'none',
          transition: 'all 0.2s',
          fontFamily: 'Inter,sans-serif',
        }}
        onFocus={e => { e.target.style.borderColor = color; e.target.style.boxShadow = `0 0 0 3px ${color}22`; }}
        onBlur={e => { e.target.style.borderColor = dark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.10)'; e.target.style.boxShadow = 'none'; }}
      />
      {rightSlot && (
        <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
          {rightSlot}
        </div>
      )}
    </div>
  </div>
);

/* ─── Error Banner ───────────────────────────────────────────────────────────── */
const ErrorBanner = ({ msg }) => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    style={{
      display: 'flex', gap: 9, alignItems: 'center',
      padding: '11px 14px',
      background: 'rgba(239,68,68,0.1)',
      border: '1px solid rgba(239,68,68,0.3)',
      borderRadius: 11, fontSize: '0.84rem', color: '#fca5a5',
    }}
  >
    <AlertCircle size={15} style={{ flexShrink: 0 }} /> {msg}
  </motion.div>
);

/* ─── Main Component ─────────────────────────────────────────────────────────── */
export default function LoginPage() {
  const { t } = useTranslation();
  const dark = useThemeMode();
  const [tab, setTab] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const resetForm = (newTab) => { setTab(newTab); setError(''); setEmail(''); setPassword(''); setShowPass(false); };

  const handleGoogleLogin = async () => {
    setLoading(true); setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success(t('auth.loginSuccess', 'Welcome back! 🎉'));
      navigate('/dashboard');
    } catch {
      setError(t('auth.errGoogleFail', 'Google sign-in failed. Please try again.'));
      toast.error(t('auth.errSignInFail', 'Sign-in failed'));
    } finally { setLoading(false); }
  };

  const handleEmailLogin = async (e, role) => {
    e.preventDefault(); setLoading(true); setError('');
    const errorMap = {
      'auth/wrong-password': t('auth.errWrongPass', 'Incorrect password.'),
      'auth/user-not-found': t('auth.errNoUser', 'No account found with this email.'),
      'auth/invalid-email': t('auth.errInvalidEmail', 'Invalid email address.'),
      'auth/too-many-requests': t('auth.errTooManyRequests', 'Too many attempts. Try again later.'),
      'auth/invalid-credential': t('auth.errInvalidCreds', 'Invalid credentials. Check your email and password.'),
    };
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success(role === 'admin' ? t('auth.welcomeAdmin', 'Welcome, Admin! 🛡️') : t('auth.welcomeWorker', 'Worker login successful! 👷'));
      navigate(role === 'admin' ? '/admin' : '/worker');
    } catch (err) {
      setError(errorMap[err.code] || t('auth.errLoginFail', 'Login failed. Check your credentials.'));
    } finally { setLoading(false); }
  };

  const tabs = [
    { id: 'user', label: t('nav.user', 'Citizen'), icon: Users, color: '#6366f1', accent: 'rgba(99,102,241,0.15)' },
    { id: 'worker', label: t('nav.worker', 'Worker'), icon: Wrench, color: '#10b981', accent: 'rgba(16,185,129,0.15)' },
    { id: 'admin', label: t('nav.admin', 'Admin'), icon: Shield, color: '#f59e0b', accent: 'rgba(245,158,11,0.15)' },
  ];
  const activeTab = tabs.find(t => t.id === tab);
  const accentColor = activeTab?.color || '#6366f1';

  const bg = dark
    ? 'linear-gradient(145deg, #07080f 0%, #0d0f1e 60%, #07080f 100%)'
    : 'linear-gradient(145deg, #f0f4ff 0%, #e8f0fe 60%, #f0f9ff 100%)';

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: bg, padding: '24px 16px', position: 'relative', overflow: 'hidden',
      transition: 'background 0.4s',
    }}>
      {/* Background orbs */}
      <Orb style={{ top: '8%', left: '5%', width: 500, height: 500 }} color={dark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.07)'} dur={9} />
      <Orb style={{ bottom: '8%', right: '5%', width: 420, height: 420 }} color={dark ? 'rgba(34,211,238,0.09)' : 'rgba(34,211,238,0.06)'} dur={11} delay={2} />
      <Orb style={{ top: '50%', left: '50%', width: 300, height: 300, transform: 'translate(-50%,-50%)' }} color={dark ? `${accentColor}14` : `${accentColor}0a`} dur={7} delay={1} />

      {/* Grid bg */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `linear-gradient(${dark ? 'rgba(99,102,241,0.03)' : 'rgba(99,102,241,0.05)'} 1px, transparent 1px), linear-gradient(90deg, ${dark ? 'rgba(99,102,241,0.03)' : 'rgba(99,102,241,0.05)'} 1px, transparent 1px)`,
        backgroundSize: '50px 50px',
      }} />

      {/* Back button and Language Switcher */}
      <div style={{ position: 'fixed', top: 20, left: 20, zIndex: 10, display: 'flex', gap: 12, alignItems: 'center' }}>
        <Link to="/">
          <motion.div
            whileHover={{ x: -3, scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 16px', borderRadius: 12,
            background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
            border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            color: dark ? '#94a3b8' : '#475569',
            fontSize: '0.82rem', fontWeight: 600,
            backdropFilter: 'blur(12px)',
          }}
        >
          <ArrowLeft size={15} /> {t('nav.back', 'Back')}
          </motion.div>
        </Link>
        <LanguageSwitcher />
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: '100%', maxWidth: 480, position: 'relative',
          background: dark ? 'rgba(13,15,30,0.92)' : 'rgba(255,255,255,0.92)',
          border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
          borderRadius: 28, overflow: 'hidden',
          boxShadow: dark ? '0 30px 90px rgba(0,0,0,0.55)' : '0 30px 90px rgba(0,0,0,0.12)',
          backdropFilter: 'blur(24px)',
        }}
      >
        {/* Top accent line */}
        <div style={{
          height: 3,
          background: `linear-gradient(90deg, ${accentColor}, ${accentColor === '#6366f1' ? '#22d3ee' : accentColor === '#10b981' ? '#34d399' : '#fbbf24'})`,
          transition: 'background 0.3s',
        }} />

        <div style={{ padding: '36px 36px 40px' }}>
          {/* Logo + Title */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <Link to="/">
              <motion.div
                whileHover={{ scale: 1.05 }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 24 }}
              >
                <div style={{
                  width: 46, height: 46, borderRadius: 14,
                  background: 'linear-gradient(135deg, #6366f1, #22d3ee)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 24px rgba(99,102,241,0.45)',
                }}>
                  <Shield size={24} color="white" />
                </div>
                <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.25rem', color: dark ? '#f1f5f9' : '#0f172a' }}>SAMADHAN</span>
              </motion.div>
            </Link>
            <h1 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.65rem', color: dark ? '#f1f5f9' : '#0f172a', marginBottom: 6 }}>
              {t('auth.welcomeBack', 'Welcome Back 👋')}
            </h1>
            <p style={{ color: dark ? '#64748b' : '#94a3b8', fontSize: '0.88rem' }}>
              {t('auth.signInSub', 'Sign in to continue to your account')}
            </p>
          </div>

          {/* Role Tabs */}
          <div style={{
            display: 'flex', gap: 6, marginBottom: 28,
            background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
            borderRadius: 14, padding: 5,
            border: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          }}>
            {tabs.map((t) => {
              const active = tab === t.id;
              return (
                <motion.button
                  key={t.id}
                  onClick={() => resetForm(t.id)}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    flex: 1, padding: '10px 8px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    fontWeight: 700, fontSize: '0.8rem', transition: 'all 0.25s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    background: active ? `linear-gradient(135deg, ${t.color}, ${t.color}cc)` : 'transparent',
                    color: active ? 'white' : (dark ? '#64748b' : '#94a3b8'),
                    boxShadow: active ? `0 4px 14px ${t.color}40` : 'none',
                  }}
                >
                  <t.icon size={14} />
                  {t.label}
                </motion.button>
              );
            })}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
            >
              {tab === 'user' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Citizen info box */}
                  <div style={{
                    fontSize: '0.84rem', color: dark ? '#a5b4fc' : '#4f46e5',
                    lineHeight: 1.6, textAlign: 'center',
                  }}>
                    <Sparkles size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-top' }} />
                    {t('auth.citizenLoginHint', 'Citizens and residents sign in instantly using Google — no password needed.')}
                  </div>

                  {error && <ErrorBanner msg={error} />}

                  <motion.button
                    id="user-google-login"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.18)' }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                      padding: '14px', background: 'white', color: '#1f1f1f',
                      borderRadius: 14, border: '1.5px solid rgba(0,0,0,0.08)',
                      fontWeight: 700, fontSize: '0.94rem', cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.7 : 1,
                      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                    }}
                  >
                    <GoogleIcon /> {loading ? t('auth.signingIn', 'Signing in…') : t('auth.continueGoogle', 'Continue with Google')}
                  </motion.button>

                  <div style={{ textAlign: 'center', fontSize: '0.83rem', color: dark ? '#475569' : '#94a3b8', marginTop: 4 }}>
                    {t('auth.noAccount', "Don't have an account?")}{' '}
                    <Link to="/register" style={{ color: '#818cf8', fontWeight: 700 }}>{t('auth.registerHere', 'Register here')}</Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={(e) => handleEmailLogin(e, tab)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{
                    padding: '12px 16px', borderRadius: 12,
                    background: dark ? `${accentColor}12` : `${accentColor}0a`,
                    border: `1px solid ${accentColor}30`,
                    fontSize: '0.82rem', color: dark ? '#cbd5e1' : '#475569',
                    textAlign: 'center',
                  }}>
                    {tab === 'admin'
                      ? t('auth.adminLoginHint', '🛡️ Admin portal — for administrative staff only.')
                      : t('auth.workerLoginHint', '👷 Worker portal — view and resolve your assigned complaints.')}
                  </div>

                  {error && <ErrorBanner msg={error} />}

                  <InputField
                    id={`${tab}-email`}
                    label={t('auth.email', 'Email Address')}
                    type="email"
                    icon={Mail}
                    placeholder={tab === 'admin' ? 'admin@samadhan.gov.in' : 'worker@samadhan.com'}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    dark={dark}
                    color={accentColor}
                  />

                  <InputField
                    id={`${tab}-password`}
                    label={t('auth.password', 'Password')}
                    type={showPass ? 'text' : 'password'}
                    icon={Lock}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    dark={dark}
                    color={accentColor}
                    rightSlot={
                      <button
                        type="button"
                        onClick={() => setShowPass(p => !p)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: dark ? '#64748b' : '#94a3b8', display: 'flex', padding: 2 }}
                      >
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    }
                  />

                  <motion.button
                    id={`${tab}-login-btn`}
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      padding: '14px', borderRadius: 14, border: 'none',
                      background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                      color: 'white', fontWeight: 700, fontSize: '0.95rem',
                      cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                      boxShadow: `0 6px 24px ${accentColor}35`,
                      marginTop: 4,
                    }}
                  >
                    {loading ? t('auth.signingIn', 'Signing in…') : t('auth.loginBtn', 'Sign In')}
                  </motion.button>
                </form>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer strip */}
        <div style={{
          padding: '14px 36px',
          borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          background: dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: dark ? '#334155' : '#94a3b8',
        }}>
          🔒 {t('auth.footerSecure', 'Secured by Google OAuth')} · {t('app.title', 'SAMADHAN')} © 2026
        </div>
      </motion.div>

      <style>{`
        @media (max-width: 520px) {
          .login-card-inner { padding: 24px 20px 28px !important; }
        }
      `}</style>
    </div>
  );
}
