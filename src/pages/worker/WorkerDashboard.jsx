import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, MapPin, CheckCircle, Navigation, Loader, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { signOut, auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import toast from 'react-hot-toast';
import { calculateDistanceMeters } from '../../utils/geo';
import { getAvatarUrl } from '../../utils/avatar';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/LanguageSwitcher';

function ComplaintCard({ complaint, onComplete }) {
  const { t } = useTranslation();
  const [verifying, setVerifying] = useState(false);
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const handleResolveClick = () => {
    if (!navigator.geolocation) {
      return toast.error(t('worker.geoUnsupported', 'Geolocation is not supported by your browser.'));
    }

    setLoadingLoc(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoadingLoc(false);
        const { latitude, longitude } = pos.coords;
        const compLat = parseFloat(complaint.latitude);
        const compLng = parseFloat(complaint.longitude);
/* separator */
        if (isNaN(compLat) || isNaN(compLng)) {
          toast.error(t('worker.locInvalid', 'Complaint location is invalid.'));
          return;
        }

        const distance = calculateDistanceMeters(compLat, compLng, latitude, longitude);
        
        if (distance <= 5) {
          handleConfirmResolution();
        } else {
          toast.error(`${t('worker.distanceError', 'Verification Failed! You are too far away.')} (${Math.round(distance)}m)`);
        }
      },
      (err) => {
        setLoadingLoc(false);
        toast.error(t('worker.gpsRequired', 'Failed to get your location. Please enable GPS.'));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleConfirmResolution = async () => {
    if (!imageFile) { toast.error(t('worker.photoRequired', 'Please capture a live photo of the resolved work.')); return; }
    setVerifying(true);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      await api.patch(`/workers/complete-complaint/${complaint.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(t('worker.resolveSuccess', 'Complaint successfully marked as resolved! 🎉'));
      onComplete(complaint.id);
    } catch (err) {
      if (err.response?.data?.error) {
        toast.error(err.response.data.error);
      } else {
        toast.error(t('worker.resolveFail', 'Failed to resolve complaint.'));
      }
    } finally {
      setVerifying(false);
    }
  };

  const openMaps = () => {
    if (complaint.latitude && complaint.longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${complaint.latitude},${complaint.longitude}`, '_blank');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 16, padding: '20px',
        display: 'flex', flexDirection: 'column', gap: 14
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.2rem', color: '#e2e8f0' }}>
            {t(`complaint.cats.${complaint.category}`, complaint.category)}
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 4 }}>
            {t('dashboard.reportedOn', 'Reported on')} {new Date(complaint.createdAt).toLocaleDateString(t('app.locale', 'en-IN'))}
          </p>
        </div>
        <span style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', padding: '4px 12px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700 }}>
          {t('dashboard.assigned', 'ASSIGNED')}
        </span>
      </div>

      <div style={{ background: 'rgba(13,15,30,0.5)', padding: '12px 16px', borderRadius: 10, fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.6 }}>
        {complaint.description}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: '#a5b4fc', background: 'rgba(99,102,241,0.06)', padding: '10px 14px', borderRadius: 10 }}>
        <MapPin size={16} />
        {complaint.area || complaint.address || t('complaint.locAttached', 'Location attached')}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 'auto' }}>
        <div>
          <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>{t('worker.resolutionPhoto', 'Resolution Photo Capture')}</label>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="form-input"
            style={{ padding: '8px', background: 'rgba(13,15,30,0.5)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, fontSize: '0.85rem' }}
            onChange={e => setImageFile(e.target.files[0])}
          />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={openMaps}
            className="btn btn-outline"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <Navigation size={16} /> {t('worker.navigate', 'Navigate')}
          </button>
          <button
            onClick={handleResolveClick}
            disabled={loadingLoc || verifying}
            className="btn btn-primary"
            style={{ flex: 1.5, background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {loadingLoc ? <><Loader size={16} className="spin" /> {t('worker.verifyingGPS', 'Verifying GPS…')}</> : verifying ? t('dashboard.marking', 'Marking…') : <><CheckCircle size={16} /> {t('worker.markResolved', 'Mark Resolved')}</>}
          </button>
        </div>
      </div>
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
}

/* deleted old imports */

export default function WorkerDashboard() {
  const { t } = useTranslation();
  const { currentUser, dbUser } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/workers/my-complaints')
      .then(res => setComplaints(res.data.complaints || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    toast.success('Logged out');
    navigate('/');
  };

  const handleRemoveCompleted = (id) => {
    setComplaints(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <nav style={{
        background: 'rgba(7,8,15,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(16,185,129,0.2)', padding: '16px 5%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={20} color="white" />
          </div>
          <div>
            <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.05rem', lineHeight: 1 }}>{t('app.title', 'SAMADHAN')}</div>
            <div style={{ fontSize: '0.65rem', color: '#10b981', letterSpacing: 1, fontWeight: 700, marginTop: 2 }}>{t('app.workerPanel', 'WORKER PANEL')}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <LanguageSwitcher />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{dbUser?.name}</div>
              <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>{t('worker.activeWorker', 'Active Worker')}</div>
            </div>
            <img src={getAvatarUrl(currentUser, 40)} alt="Worker" style={{ width: 40, height: 40, borderRadius: '50%', background: '#1e1b4b', border: '2px solid rgba(16,185,129,0.3)' }} />
          </div>
          <button onClick={handleLogout} className="btn-icon" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      <main style={{ flex: 1, padding: '40px 5%', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '2rem' }}>{t('worker.assignments', 'Your Assignments')}</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: 4 }}>
            {t('worker.instruction', 'Go to the location, complete the work, and resolve constraints via GPS.')}
          </p>
        </div>

        {loading ? (
          <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner" />
          </div>
        ) : complaints.length === 0 ? (
          <div className="empty-state" style={{ height: 400 }}>
            <div style={{ background: 'rgba(16,185,129,0.1)', width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: 20 }}>
              <CheckCircle size={40} />
            </div>
            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.4rem' }}>{t('worker.allCaughtUp', 'You\'re all caught up!')}</h2>
            <p style={{ color: '#94a3b8', maxWidth: 300, fontSize: '0.9rem' }}>{t('worker.noAssignments', 'You have no pending complaints assigned right now.')}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
            <AnimatePresence>
              {complaints.map(complaint => (
                <ComplaintCard key={complaint.id} complaint={complaint} onComplete={handleRemoveCompleted} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
