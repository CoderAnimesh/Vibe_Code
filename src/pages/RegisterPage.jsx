import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield, CheckCircle, ArrowLeft, MapPin, Bell, Eye, Zap, Lock, Star,
} from 'lucide-react';
import { signInWithPopup, auth, googleProvider } from '../firebase';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

/* ─── Theme hook ─────────────────────────────────────────────────────────────── */
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

/* ─── Google Icon ────────────────────────────────────────────────────────────── */
const GoogleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

/* ─── Floating Orb ───────────────────────────────────────────────────────────── */
const Orb = ({ style, color, dur = 8, delay = 0 }) => (
  <motion.div
    animate={{ scale: [1, 1.18, 1], opacity: [0.5, 1, 0.5] }}
    transition={{ duration: dur, repeat: Infinity, ease: 'easeInOut', delay }}
    style={{
      position: 'absolute', borderRadius: '50%', pointerEvents: 'none',
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      filter: 'blur(55px)', ...style,
    }}
  />
);

/* ─── Perk Row ───────────────────────────────────────────────────────────────── */
const PerkRow = ({ icon: Icon, text, color, delay, dark }) => (
  <motion.div
    initial={{ opacity: 0, x: -18 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.5 }}
    style={{ display: 'flex', alignItems: 'center', gap: 14 }}
  >
    <div style={{
      width: 38, height: 38, borderRadius: 11, flexShrink: 0,
      background: `${color}20`, border: `1.5px solid ${color}40`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon size={17} color={color} />
    </div>
    <span style={{ fontSize: '0.88rem', color: dark ? '#cbd5e1' : '#334155', lineHeight: 1.5, fontWeight: 500 }}>
      {text}
    </span>
  </motion.div>
);

/* ─── Main ───────────────────────────────────────────────────────────────────── */
export default function RegisterPage() {
  const { t } = useTranslation();
  const dark = useThemeMode();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleRegister = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success(t('auth.accountCreated', 'Account created! Welcome to SAMADHAN 🎉'));
      navigate('/dashboard');
    } catch (err) {
      toast.error(t('auth.errRegFail', 'Registration failed. Please try again.'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const perks = [
    { icon: MapPin, text: t('landing.feat1Desc', 'Raise complaints with live GPS location'), color: '#6366f1' },
    { icon: Eye, text: t('landing.feat2Desc', 'Track your complaint status in real-time'), color: '#22d3ee' },
    { icon: Bell, text: t('landing.feat4Desc', 'Get notified instantly at every stage'), color: '#f59e0b' },
    { icon: Lock, text: t('auth.secureGoogle', 'Secure login — powered by Google'), color: '#10b981' },
    { icon: Zap, text: t('landing.zeroPaperwork', 'Zero paperwork, fully digital process'), color: '#f97316' },
    { icon: Star, text: t('landing.satisfactionRate', '98% satisfaction rate from citizens'), color: '#a855f7' },
  ];

  const pageBg = dark
    ? 'linear-gradient(145deg, #07080f 0%, #0d0f1e 60%, #07080f 100%)'
    : 'linear-gradient(145deg, #f0f4ff 0%, #eef2ff 60%, #f0f9ff 100%)';

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'stretch',
      background: pageBg, overflow: 'hidden', position: 'relative',
      transition: 'background 0.4s',
    }}>
      {/* Background orbs */}
      <Orb style={{ top: '5%', left: '-5%', width: 500, height: 500 }} color={dark ? 'rgba(99,102,241,0.14)' : 'rgba(99,102,241,0.08)'} dur={10} />
      <Orb style={{ bottom: '5%', right: '-5%', width: 450, height: 450 }} color={dark ? 'rgba(34,211,238,0.09)' : 'rgba(34,211,238,0.06)'} dur={12} delay={2} />
      <Orb style={{ top: '40%', left: '40%', width: 350, height: 350 }} color={dark ? 'rgba(168,85,247,0.07)' : 'rgba(168,85,247,0.05)'} dur={8} delay={1} />

      {/* Back button and Language Switcher */}
      <div style={{ position: 'fixed', top: 20, left: 20, zIndex: 10, display: 'flex', gap: 12, alignItems: 'center' }}>
        <Link to="/">
          <motion.div
          whileHover={{ x: -3, scale: 1.05 }} whileTap={{ scale: 0.95 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 16px', borderRadius: 12,
            background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
            border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            color: dark ? '#94a3b8' : '#475569',
            fontSize: '0.82rem', fontWeight: 600, backdropFilter: 'blur(12px)',
          }}
        >
          <ArrowLeft size={15} /> {t('nav.back', 'Back')}
          </motion.div>
        </Link>
        <LanguageSwitcher />
      </div>

      {/* ── Left Panel ──────────────────────────────────────────────────── */}
      <motion.div
        className="register-left"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: 'clamp(40px, 6vw, 72px)',
          background: dark
            ? 'linear-gradient(145deg, rgba(99,102,241,0.12) 0%, rgba(7,8,15,0.7) 60%)'
            : 'linear-gradient(145deg, rgba(99,102,241,0.07) 0%, rgba(255,255,255,0.4) 60%)',
          borderRight: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'}`,
          position: 'relative', overflow: 'hidden',
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* Decorative circle */}
        <div style={{ position: 'absolute', top: -120, left: -120, width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.16) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48, width: 'fit-content' }}>
          <motion.div whileHover={{ scale: 1.05 }} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 50, height: 50, borderRadius: 15,
              background: 'linear-gradient(135deg, #6366f1, #22d3ee)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 28px rgba(99,102,241,0.45)',
            }}>
              <Shield size={26} color="white" />
            </div>
            <div>
              <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.3rem', color: dark ? '#f1f5f9' : '#0f172a', letterSpacing: '-0.5px' }}>{t('app.title', 'SAMADHAN')}</div>
              <div style={{ fontSize: '0.6rem', color: dark ? 'rgba(148,163,184,0.8)' : 'rgba(71,85,105,0.8)', letterSpacing: 1.5, textTransform: 'uppercase' }}>{t('app.subtitle', 'Smart Admin System')}</div>
            </div>
          </motion.div>
        </Link>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 900, fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', lineHeight: 1.15, marginBottom: 14, color: dark ? '#f1f5f9' : '#0f172a' }}
        >
          {t('landing.registerHeroTitle1', 'Make Your Voice')}<br />
          <span style={{ background: 'linear-gradient(135deg, #818cf8, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {t('landing.registerHeroTitle2', 'Heard & Resolved')}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          style={{ color: dark ? '#94a3b8' : '#475569', fontSize: '0.95rem', marginBottom: 40, lineHeight: 1.75, maxWidth: 420 }}
        >
          Join thousands of citizens who are actively participating in making their city better through SAMADHAN.
        </motion.p>

        {/* Perks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {perks.map((perk, i) => (
            <PerkRow key={perk.text} {...perk} dark={dark} delay={0.3 + i * 0.08} />
          ))}
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
          style={{ display: 'flex', gap: 28, marginTop: 48, flexWrap: 'wrap' }}
        >
          {[{ val: '10K+', label: t('landing.stats1Label', 'Resolved') }, { val: '98%', label: t('landing.stats2Label', 'Satisfaction') }, { val: '50+', label: t('landing.stats4Label', 'Workers') }].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 900, fontSize: '1.5rem', background: 'linear-gradient(135deg,#818cf8,#22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{s.val}</div>
              <div style={{ fontSize: '0.72rem', color: dark ? '#475569' : '#94a3b8', fontWeight: 500, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* ── Right Panel ─────────────────────────────────────────────────── */}
      <motion.div
        className="register-right"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: 'clamp(340px, 38%, 480px)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: 'clamp(40px, 5vw, 64px) clamp(28px, 5vw, 56px)',
          background: dark ? 'rgba(13,15,30,0.85)' : 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Top accent bar */}
        <div style={{ height: 4, background: 'linear-gradient(90deg, #6366f1, #22d3ee, #f59e0b)', borderRadius: 4, marginBottom: 40 }} />

        <div>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '2rem', marginBottom: 8, color: dark ? '#f1f5f9' : '#0f172a' }}>
            {t('auth.registerTitle', 'Create Account')} 🚀
          </h2>
          <p style={{ color: dark ? '#64748b' : '#94a3b8', fontSize: '0.88rem', marginBottom: 36, lineHeight: 1.65 }}>
            {t('auth.registerSub', 'Register instantly with Google. No passwords to remember. One click and you\'re in.')}
          </p>

          {/* Google Button */}
          <motion.button
            id="register-google-btn"
            onClick={handleGoogleRegister}
            disabled={loading}
            whileHover={{ scale: 1.02, boxShadow: '0 10px 36px rgba(0,0,0,0.18)' }}
            whileTap={{ scale: 0.98 }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              width: '100%', padding: '15px 24px',
              background: 'white', color: '#1f1f1f',
              borderRadius: 14, border: '1.5px solid rgba(0,0,0,0.08)',
              fontWeight: 700, fontSize: '0.96rem',
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
              marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            }}
          >
            <GoogleIcon />
            {loading ? t('auth.creatingAccount', 'Creating account…') : t('auth.continueGoogle', 'Continue with Google')}
          </motion.button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' }} />
            <span style={{ color: dark ? '#334155' : '#94a3b8', fontSize: '0.76rem', fontWeight: 500 }}>{t('auth.oneClickReg', 'One-click registration')}</span>
            <div style={{ flex: 1, height: 1, background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' }} />
          </div>

          {/* Security note */}
          <div style={{
            padding: '14px 16px', borderRadius: 14,
            background: dark ? 'rgba(99,102,241,0.09)' : 'rgba(99,102,241,0.07)',
            border: `1px solid rgba(99,102,241,0.22)`,
            fontSize: '0.82rem', color: dark ? '#a5b4fc' : '#4f46e5',
            lineHeight: 1.65, marginBottom: 28,
          }}>
            🔒 {t('auth.regSecurityNote', 'We use Google OAuth for maximum security. Your data is safely stored.')}
          </div>

          {/* What you can do */}
          <div style={{
            padding: '14px 16px', borderRadius: 14,
            background: dark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.06)',
            border: `1px solid rgba(16,185,129,0.2)`,
            fontSize: '0.82rem', color: dark ? '#6ee7b7' : '#047857',
            lineHeight: 1.7, marginBottom: 32,
          }}>
            {t('auth.afterRegHint', '✅ After registering you\'ll be able to:')}<br />
            &nbsp;&nbsp;• {t('auth.regStep1', 'Raise geo-tagged complaints')}<br />
            &nbsp;&nbsp;• {t('auth.regStep2', 'Track status in real-time')}<br />
            &nbsp;&nbsp;• {t('auth.regStep3', 'Receive resolution notifications')}
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.84rem', color: dark ? '#475569' : '#94a3b8' }}>
            {t('auth.hasAccount', 'Already have an account? Sign in')}{' '}
            <Link to="/login" style={{ color: '#818cf8', fontWeight: 700 }}>{t('auth.here', 'here')}</Link>
          </p>
        </div>
      </motion.div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .register-left {
            display: none !important;
          }
          .register-right {
            width: 100% !important;
            padding: 32px 24px !important;
            justify-content: flex-start !important;
            padding-top: 80px !important;
          }
        }
        @media (max-width: 1024px) {
          .register-left {
            flex: 0 0 50% !important;
          }
        }
      `}</style>
    </div>
  );
}
