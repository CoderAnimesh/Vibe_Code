import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Shield, MapPin, Users, Bell, CheckCircle, ArrowRight, Zap, Eye, Clock,
  Sun, Moon, Menu, X, Star, TrendingUp, Award, Cpu
} from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

/* ─── Theme Context ──────────────────────────────────────────────────────────── */
const useTheme = () => {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('samadhan-theme') !== 'light'; } catch { return true; }
  });

  useEffect(() => {
    document.body.classList.toggle('light-mode', !dark);
  }, [dark]);

  const toggle = () => setDark(d => {
    const next = !d;
    try { localStorage.setItem('samadhan-theme', next ? 'dark' : 'light'); } catch {}
    return next;
  });
  return { dark, toggle };
};

/* ─── Particles ──────────────────────────────────────────────────────────────── */
const Particles = ({ dark }) => {
  const particles = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    dur: Math.random() * 6 + 4,
    delay: Math.random() * 4,
  }));
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {particles.map(p => (
        <motion.div
          key={p.id}
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
          style={{
            position: 'absolute', left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size, borderRadius: '50%',
            background: dark
              ? ['#6366f1', '#22d3ee', '#f59e0b', '#10b981', '#f97316', '#a855f7'][p.id % 6]
              : ['#6366f1', '#0891b2', '#d97706', '#059669', '#ea580c', '#9333ea'][p.id % 6],
            filter: 'blur(0.5px)',
          }}
        />
      ))}
    </div>
  );
};

/* ─── Animated Counter ───────────────────────────────────────────────────────── */
const Counter = ({ target, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting && !started) setStarted(true); }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [started]);
  useEffect(() => {
    if (!started) return;
    const num = parseInt(target);
    let cur = 0;
    const step = Math.ceil(num / 50);
    const timer = setInterval(() => {
      cur = Math.min(cur + step, num);
      setCount(cur);
      if (cur >= num) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [started, target]);
  return <span ref={ref}>{count}{suffix}</span>;
};

const Navbar = ({ dark, toggleTheme }) => {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { key: 'home', label: t('nav.home', 'Home') },
    { key: 'features', label: t('nav.features', 'Features') },
    { key: 'how-it-works', label: t('nav.howItWorks', 'How it Works') },
    { key: 'contact', label: t('nav.contact', 'Contact') }
  ];

  const navBg = dark
    ? scrolled ? 'rgba(7,8,15,0.95)' : 'transparent'
    : scrolled ? 'rgba(255,255,255,0.95)' : 'transparent';

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999,
          padding: scrolled ? '10px 40px' : '18px 40px',
          background: navBg,
          backdropFilter: scrolled ? 'blur(24px)' : 'none',
          borderBottom: scrolled ? `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}` : 'none',
          transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: scrolled ? (dark ? '0 4px 30px rgba(0,0,0,0.3)' : '0 4px 30px rgba(0,0,0,0.1)') : 'none',
        }}
      >
        {/* Logo */}
        <motion.div whileHover={{ scale: 1.03 }} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <div style={{
            width: 42, height: 42, borderRadius: 13,
            background: 'linear-gradient(135deg, #6366f1, #22d3ee)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 24px rgba(99,102,241,0.5)',
          }}>
            <Shield size={22} color="white" />
          </div>
          <div>
            <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.5px', color: dark ? '#f1f5f9' : '#0f172a' }}>
              {t('app.title', 'SĀMĀDHĀN')}
            </div>
            <div style={{ fontSize: '0.58rem', color: dark ? 'rgba(148,163,184,0.8)' : 'rgba(71,85,105,0.8)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
              {t('app.subtitle', 'Smart Admin System')}
            </div>
          </div>
        </motion.div>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
          {navLinks.map((link) => (
            <motion.a
              key={link.key}
              href={`#${link.key}`}
              whileHover={{ color: '#6366f1' }}
              style={{ padding: '8px 14px', fontSize: '0.88rem', color: dark ? 'rgba(241,245,249,0.75)' : 'rgba(15,23,42,0.7)', fontWeight: 500, transition: 'color 0.2s', borderRadius: 8 }}
            >
              {link.label}
            </motion.a>
          ))}

          <LanguageSwitcher />

          {/* Theme Toggle */}
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.93 }}
            id="theme-toggle-btn"
            style={{
              width: 40, height: 40, borderRadius: 12, border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`,
              background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', marginLeft: 8, transition: 'all 0.2s',
              color: dark ? '#f59e0b' : '#6366f1',
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div key={dark ? 'moon' : 'sun'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                {dark ? <Sun size={17} /> : <Moon size={17} />}
              </motion.div>
            </AnimatePresence>
          </motion.button>

          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 8px 30px rgba(99,102,241,0.45)' }}
              whileTap={{ scale: 0.97 }}
              style={{
                marginLeft: 8, padding: '10px 22px',
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: 'white', border: 'none', borderRadius: 10,
                fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
              }}
            >
              {t('nav.login', 'Login')}
            </motion.button>
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <div style={{ display: 'none' }} className="mobile-menu-btn">
          <LanguageSwitcher />
          <motion.button
            onClick={() => setMenuOpen(o => !o)}
            whileTap={{ scale: 0.9 }}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: dark ? '#f1f5f9' : '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <motion.button
              onClick={toggleTheme}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: dark ? '#f59e0b' : '#6366f1', marginRight: 4 }}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </motion.button>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </motion.button>
        </div>
      </motion.nav>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            style={{
              position: 'fixed', top: 68, left: 12, right: 12, zIndex: 998,
              background: dark ? 'rgba(13,15,30,0.97)' : 'rgba(255,255,255,0.97)',
              borderRadius: 18, padding: '16px 0',
              border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
              backdropFilter: 'blur(24px)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            {navLinks.map(link => (
              <a
                key={link.key}
                href={`#${link.key}`}
                onClick={() => setMenuOpen(false)}
                style={{ display: 'block', padding: '12px 24px', fontSize: '0.95rem', color: dark ? '#e2e8f0' : '#1e293b', fontWeight: 500 }}
              >
                {link.label}
              </a>
            ))}
            <div style={{ padding: '12px 24px', borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, marginTop: 8 }}>
              <Link to="/login" onClick={() => setMenuOpen(false)}>
                <button style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}>
                  {t('nav.login', 'Login')}
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </>
  );
};

/* ─── Hero Section ───────────────────────────────────────────────────────────── */
const HeroSection = ({ dark }) => {
  const { t } = useTranslation();
  const features = [
    { icon: MapPin, label: t('landing.feat1', 'Live Location Tracking'), color: '#6366f1' },
    { icon: Zap, label: t('landing.feat2', 'Instant Assignments'), color: '#f59e0b' },
    { icon: Bell, label: t('landing.feat3', 'Real-time Alerts'), color: '#10b981' },
  ];

  const orbs = [
    { top: '5%', left: '3%', w: 700, h: 700, color: dark ? 'rgba(99,102,241,0.14)' : 'rgba(99,102,241,0.08)', dur: 8 },
    { top: 'auto', bottom: '5%', right: '3%', w: 550, h: 550, color: dark ? 'rgba(34,211,238,0.1)' : 'rgba(34,211,238,0.07)', dur: 10 },
    { top: '40%', left: '50%', w: 400, h: 400, color: dark ? 'rgba(168,85,247,0.08)' : 'rgba(168,85,247,0.05)', dur: 12 },
  ];

  return (
    <section id="home" style={{
      minHeight: '100vh', position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '120px 24px 90px',
      background: dark
        ? 'linear-gradient(160deg, #07080f 0%, #0d0f1e 50%, #070d14 100%)'
        : 'linear-gradient(160deg, #f0f4ff 0%, #e8f0fe 50%, #f0f9ff 100%)',
    }}>
      {/* Orbs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {orbs.map((o, i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.15, 1], rotate: [0, i % 2 === 0 ? 4 : -4, 0] }}
            transition={{ duration: o.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 1.5 }}
            style={{
              position: 'absolute', top: o.top, bottom: o.bottom, left: o.left, right: o.right,
              width: o.w, height: o.h, borderRadius: '50%',
              background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`,
              filter: 'blur(50px)',
            }}
          />
        ))}
        {/* Grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(${dark ? 'rgba(99,102,241,0.045)' : 'rgba(99,102,241,0.07)'} 1px, transparent 1px), linear-gradient(90deg, ${dark ? 'rgba(99,102,241,0.045)' : 'rgba(99,102,241,0.07)'} 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />
        <Particles dark={dark} />
      </div>

      <div style={{ position: 'relative', maxWidth: 900, margin: '0 auto', width: '100%' }}>
        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 18px', borderRadius: 999, background: dark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.35)', fontSize: '0.8rem', color: '#818cf8', fontWeight: 600, marginBottom: 28, letterSpacing: 0.5 }}
        >
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#22d3ee)', display: 'inline-block', animation: 'lpulse 2s infinite' }} />
          {t('app.subtitle', 'Smart Administration & Monitoring System')}
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ fontFamily: 'Outfit,sans-serif', fontSize: 'clamp(2.8rem, 7vw, 5.8rem)', fontWeight: 900, lineHeight: 1.05, marginBottom: 26, color: dark ? '#f1f5f9' : '#0f172a' }}
        >
          <span style={{ background: 'linear-gradient(135deg, #6366f1, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', position: 'relative' }}>
            {t('landing.heroTitle', 'Empowering Citizens, Enabling Solutions')}
          </span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          style={{ fontSize: 'clamp(1rem, 2.2vw, 1.2rem)', color: dark ? '#94a3b8' : '#475569', maxWidth: 640, margin: '0 auto 44px', lineHeight: 1.75 }}
        >
          {t('landing.heroSub')}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
          style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 60 }}
        >
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 12px 40px rgba(99,102,241,0.45)' }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '14px 34px', borderRadius: 14,
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: 'white', border: 'none', fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 6px 24px rgba(99,102,241,0.35)',
              }}
            >
              {t('landing.getStarted', 'Get Started Free')} <ArrowRight size={18} />
            </motion.button>
          </Link>
          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.04, borderColor: 'rgba(99,102,241,0.6)', background: dark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.05)' }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '14px 34px', borderRadius: 14,
                background: 'transparent', color: dark ? '#f1f5f9' : '#1e293b',
                border: `1px solid ${dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'}`,
                fontSize: '1rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {t('nav.login', 'Sign In')}
            </motion.button>
          </Link>
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          {features.map(({ icon: Icon, label, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.1 }}
              whileHover={{ scale: 1.05, y: -2 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '9px 18px', borderRadius: 12,
                background: dark ? `${color}14` : `${color}0f`,
                border: `1px solid ${color}35`,
                fontSize: '0.82rem', color: dark ? '#94a3b8' : '#475569', fontWeight: 500, cursor: 'default',
              }}
            >
              <Icon size={15} color={color} /> {label}
            </motion.div>
          ))}
        </motion.div>
      </div>

      <style>{`
        @keyframes lpulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.85); } }
      `}</style>
    </section>
  );
};

/* ─── Features Section ───────────────────────────────────────────────────────── */
const FeaturesSection = ({ dark }) => {
  const { t } = useTranslation();
  const cards = [
    { icon: MapPin, title: t('landing.feat1Title', 'Location-Based Complaints'), desc: t('landing.feat1Desc', 'Auto-detect your exact location using GPS and raise a complaint with a single click.'), color: '#6366f1', gradient: 'linear-gradient(135deg,#6366f115,#818cf808)' },
    { icon: Eye, title: t('landing.feat2Title', 'Live Status Tracking'), desc: t('landing.feat2Desc', 'Track your complaint through every phase: Submitted→Assigned→Reverification→Resolved.'), color: '#22d3ee', gradient: 'linear-gradient(135deg,#22d3ee15,#0891b208)' },
    { icon: Users, title: t('landing.feat3Title', 'Worker Assignment'), desc: t('landing.feat3Desc', 'Admins intelligently assign trained workers to each complaint based on category and area.'), color: '#f59e0b', gradient: 'linear-gradient(135deg,#f59e0b15,#fbbf2408)' },
    { icon: Bell, title: t('landing.feat4Title', 'Instant Notifications'), desc: t('landing.feat4Desc', 'Get notified at every stage — worker assigned, review begins, and when the issue is resolved.'), color: '#10b981', gradient: 'linear-gradient(135deg,#10b98115,#34d39908)' },
    { icon: Shield, title: t('landing.feat5Title', 'Secure & Verified'), desc: t('landing.feat5Desc', 'All users authenticated via Google. Data encrypted end-to-end.'), color: '#f97316', gradient: 'linear-gradient(135deg,#f9731615,#fb923c08)' },
    { icon: Clock, title: t('landing.feat6Title', 'Fast Resolution'), desc: t('landing.feat6Desc', 'Our streamlined workflow ensures complaints don\'t sit idle.'), color: '#a855f7', gradient: 'linear-gradient(135deg,#a855f715,#c084fc08)' },
  ];

  return (
    <section id="features" style={{ padding: '110px 24px', maxWidth: 1240, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: 72 }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 999, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', fontSize: '0.78rem', color: '#818cf8', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>
          <Cpu size={13} /> {t('landing.featuresTag', 'Features')}
        </div>
        <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', fontWeight: 800, marginBottom: 18, color: dark ? '#f1f5f9' : '#0f172a' }}>
          {t('landing.featuresTitle', 'Everything You Need')}
        </h2>
        <p style={{ color: dark ? '#94a3b8' : '#475569', maxWidth: 520, margin: '0 auto', lineHeight: 1.75, fontSize: '1rem' }}>
          {t('landing.featuresSub', 'A complete ecosystem for citizen complaint management, built for speed, transparency and accountability.')}
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            whileHover={{ y: -8, boxShadow: `0 24px 60px ${card.color}22` }}
            style={{
              padding: 30, borderRadius: 22,
              background: dark ? `${card.gradient}, rgba(255,255,255,0.02)` : `${card.gradient}, rgba(255,255,255,0.7)`,
              border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
              cursor: 'default', transition: 'all 0.3s',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div style={{
              width: 52, height: 52, borderRadius: 16, marginBottom: 22,
              background: `linear-gradient(135deg, ${card.color}28, ${card.color}12)`,
              border: `1.5px solid ${card.color}45`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 16px ${card.color}20`,
            }}>
              <card.icon size={24} color={card.color} />
            </div>
            <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.12rem', marginBottom: 10, color: dark ? '#f1f5f9' : '#0f172a' }}>
              {card.title}
            </h3>
            <p style={{ color: dark ? '#94a3b8' : '#475569', fontSize: '0.88rem', lineHeight: 1.75 }}>{card.desc}</p>
            <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 600, color: card.color }}>
              Learn more <ArrowRight size={14} />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

/* ─── How It Works ───────────────────────────────────────────────────────────── */
const HowItWorksSection = ({ dark }) => {
  const { t } = useTranslation();
  const steps = [
    { num: '01', title: t('landing.step1Title', 'Register with Google'), desc: t('landing.step1Desc', 'Sign up instantly using your Google account.'), color: '#6366f1', bg: 'linear-gradient(135deg,#6366f130,#6366f110)' },
    { num: '02', title: t('landing.step2Title', 'Raise a Complaint'), desc: t('landing.step2Desc', 'Location auto-detected. Describe and submit in seconds.'), color: '#22d3ee', bg: 'linear-gradient(135deg,#22d3ee30,#22d3ee10)' },
    { num: '03', title: t('landing.step3Title', 'Admin Reviews & Assigns'), desc: t('landing.step3Desc', 'Admin reviews and assigns a qualified worker.'), color: '#f59e0b', bg: 'linear-gradient(135deg,#f59e0b30,#f59e0b10)' },
    { num: '04', title: t('landing.step4Title', 'Worker Resolves it'), desc: t('landing.step4Desc', 'Assigned worker visits site and fixes the issue.'), color: '#10b981', bg: 'linear-gradient(135deg,#10b98130,#10b98110)' },
    { num: '05', title: t('landing.step5Title', 'Admin Re-verifies'), desc: t('landing.step5Desc', 'Admin verifies resolution before final approval.'), color: '#f97316', bg: 'linear-gradient(135deg,#f9731630,#f9731610)' },
    { num: '06', title: t('landing.step6Title', 'You Get Notified'), desc: t('landing.step6Desc', 'A notification confirms your issue is resolved!'), color: '#a855f7', bg: 'linear-gradient(135deg,#a855f730,#a855f710)' },
  ];

  return (
    <section id="how-it-works" style={{
      padding: '110px 24px',
      background: dark ? 'rgba(13,15,30,0.7)' : 'rgba(241,245,249,0.8)',
    }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 72 }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 999, background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.25)', fontSize: '0.78rem', color: '#22d3ee', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>
            <TrendingUp size={13} /> {t('landing.processTag', 'Process')}
          </div>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', fontWeight: 800, marginBottom: 18, color: dark ? '#f1f5f9' : '#0f172a' }}>
            {t('landing.howItWorksTitle', 'How It Works')}
          </h2>
          <p style={{ color: dark ? '#94a3b8' : '#475569', maxWidth: 520, margin: '0 auto', lineHeight: 1.75 }}>
            {t('landing.howItWorksSub', 'Six simple steps from complaint submission to full resolution.')}
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 28 }}>
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              style={{
                display: 'flex', gap: 18, alignItems: 'flex-start',
                padding: '24px 22px', borderRadius: 20,
                background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.75)',
                border: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`,
                transition: 'all 0.3s',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 15, flexShrink: 0,
                background: step.bg,
                border: `1.5px solid ${step.color}45`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1rem', color: step.color,
                boxShadow: `0 6px 20px ${step.color}20`,
              }}>
                {step.num}
              </div>
              <div>
                <h4 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, marginBottom: 7, fontSize: '1.02rem', color: dark ? '#f1f5f9' : '#0f172a' }}>
                  {step.title}
                </h4>
                <p style={{ color: dark ? '#94a3b8' : '#475569', fontSize: '0.87rem', lineHeight: 1.65 }}>{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── Stats Section ──────────────────────────────────────────────────────────── */
const StatsSection = ({ dark }) => {
  const { t } = useTranslation();
  const stats = [
    { value: '10000', suffix: '+', label: t('landing.stats1', 'Complaints Resolved'), icon: CheckCircle, color: '#6366f1' },
    { value: '98', suffix: '%', label: t('landing.stats2', 'Satisfaction Rate'), icon: Star, color: '#f59e0b' },
    { value: '48', suffix: 'h', label: t('landing.stats3', 'Avg. Resolution Time'), icon: Clock, color: '#22d3ee' },
    { value: '50', suffix: '+', label: t('landing.stats4', 'Active Workers'), icon: Users, color: '#10b981' },
  ];
  return (
    <section style={{ padding: '90px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 60 }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 999, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', fontSize: '0.78rem', color: '#f59e0b', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>
            <Award size={13} /> {t('landing.impactTag', 'Our Impact')}
          </div>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, color: dark ? '#f1f5f9' : '#0f172a' }}>
            {t('landing.statsTitle', 'Numbers That Matter')}
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.04, y: -4 }}
              style={{
                textAlign: 'center', padding: '36px 24px', borderRadius: 24,
                background: dark
                  ? `linear-gradient(135deg, ${s.color}12, rgba(255,255,255,0.02))`
                  : `linear-gradient(135deg, ${s.color}0e, rgba(255,255,255,0.7))`,
                border: `1px solid ${s.color}30`,
                transition: 'all 0.3s',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div style={{ width: 52, height: 52, borderRadius: 16, background: `${s.color}20`, border: `1.5px solid ${s.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: `0 4px 18px ${s.color}20` }}>
                <s.icon size={24} color={s.color} />
              </div>
              <div style={{ fontFamily: 'Outfit,sans-serif', fontSize: '3.2rem', fontWeight: 900, color: s.color, lineHeight: 1 }}>
                <Counter target={s.value} suffix={s.suffix} />
              </div>
              <div style={{ color: dark ? '#94a3b8' : '#475569', fontSize: '0.88rem', marginTop: 10, fontWeight: 500 }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── CTA Banner ─────────────────────────────────────────────────────────────── */
const CTASection = ({ dark }) => {
  const { t } = useTranslation();
  return (
    <section style={{ padding: '80px 24px' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        style={{
          maxWidth: 900, margin: '0 auto', padding: '60px 40px', borderRadius: 28, textAlign: 'center',
          background: 'linear-gradient(135deg, #6366f1, #4f46e5 40%, #22d3ee)',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 20px 80px rgba(99,102,241,0.35)',
        }}
      >
        <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'relative' }}>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, color: 'white', marginBottom: 16 }}>
            {t('landing.ctaTitle', 'Ready to Make Your City Better?')}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: 36, maxWidth: 560, margin: '0 auto 36px' }}>
            {t('landing.ctaSub', 'Join thousands of citizens who are actively shaping a smarter, cleaner city.')}
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.06, boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}
                whileTap={{ scale: 0.97 }}
                style={{ padding: '14px 34px', borderRadius: 14, background: 'white', color: '#4f46e5', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                {t('landing.getStarted', 'Get Started')} <ArrowRight size={18} />
              </motion.button>
            </Link>
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                style={{ padding: '14px 34px', borderRadius: 14, background: 'transparent', color: 'white', border: '1.5px solid rgba(255,255,255,0.5)', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}
              >
                {t('nav.login', 'Sign In')}
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

/* ─── Footer ─────────────────────────────────────────────────────────────────── */
const Footer = ({ dark }) => {
  const { t } = useTranslation();
  const navLinks = [
    { key: 'home', label: t('nav.home', 'Home') },
    { key: 'features', label: t('nav.features', 'Features') },
    { key: 'how-it-works', label: t('nav.howItWorks', 'How it Works') },
    { key: 'contact', label: t('nav.contact', 'Contact') }
  ];
  return (
    <footer id="contact" style={{
      padding: '60px 24px 40px',
      borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'}`,
      background: dark ? 'rgba(7,8,15,0.6)' : 'rgba(248,250,252,0.8)',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg, #6366f1, #22d3ee)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}>
            <Shield size={18} color="white" />
          </div>
          <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.1rem', color: dark ? '#f1f5f9' : '#0f172a' }}>{t('app.title', 'SAMADHAN')}</span>
        </div>
        <p style={{ color: dark ? '#475569' : '#64748b', fontSize: '0.88rem', maxWidth: 420, textAlign: 'center', lineHeight: 1.7 }}>
          {t('footer.desc', 'Smart Administration & Monitoring System — Empowering citizens with transparent governance.')}
        </p>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {navLinks.map(link => (
            <a key={link.key} href={`#${link.key}`}
              style={{ fontSize: '0.85rem', color: dark ? '#475569' : '#94a3b8', fontWeight: 500, transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = '#6366f1'}
              onMouseLeave={e => e.target.style.color = dark ? '#475569' : '#94a3b8'}
            >
              {link.label}
            </a>
          ))}
        </div>
        <div style={{ width: '100%', height: 1, background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', margin: '4px 0' }} />
        <p style={{ color: dark ? '#334155' : '#94a3b8', fontSize: '0.78rem' }}>© 2026 {t('app.title', 'SAMADHAN')}. {t('footer.rights', 'All rights reserved.')}</p>
      </div>
    </footer>
  );
};

/* ─── Main Export ────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const { dark, toggle } = useTheme();

  return (
    <div style={{
      minHeight: '100vh',
      background: dark ? 'var(--bg-primary)' : '#f8faff',
      color: dark ? '#f1f5f9' : '#0f172a',
      transition: 'background 0.4s, color 0.4s',
    }}>
      {!dark && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: -1,
          background: 'radial-gradient(ellipse 80% 60% at 10% 20%, rgba(99,102,241,0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 90% 80%, rgba(34,211,238,0.05) 0%, transparent 60%)',
        }} />
      )}
      {dark && <div className="bg-mesh" />}

      <Navbar dark={dark} toggleTheme={toggle} />
      <HeroSection dark={dark} />
      <FeaturesSection dark={dark} />
      <HowItWorksSection dark={dark} />
      <StatsSection dark={dark} />
      <CTASection dark={dark} />
      <Footer dark={dark} />
    </div>
  );
}
