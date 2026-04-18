import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { GoogleMap, useLoadScript, Marker, Circle } from '@react-google-maps/api';
import { MapPin, Send, Loader, AlertCircle, CheckCircle, Mic, MicOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../api';
import toast from 'react-hot-toast';

const LIBRARIES = ['places'];
const MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0d0f1e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0d0f1e' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e2340' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1e2340' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#070a1a' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
];

const CATEGORIES = ['Road/Pothole', 'Water Supply', 'Electricity', 'Sanitation/Garbage', 'Drainage', 'Street Lights', 'Tree/Park', 'Noise Pollution', 'Other'];

export default function RaiseComplaint({ onSuccess }) {
  const { t, i18n } = useTranslation();
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey || '',
    libraries: LIBRARIES,
  });

  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('');
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Speech Recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }
        if (transcript) {
          setDescription((prev) => {
            const separator = prev && !prev.endsWith(' ') ? ' ' : '';
            return prev + separator + transcript.trim();
          });
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [SpeechRecognition]);
  
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = i18n.language.startsWith('hi') ? 'hi-IN' : 'en-US';
    }
  }, [i18n.language]);

  const toggleListening = (e) => {
    e.preventDefault();
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if(recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        toast.error("Voice recognition is not supported in this browser.");
      }
    }
  };

  // Auto-fetch location on mount
  useEffect(() => { fetchLocation(); }, []);

  const fetchLocation = () => {
    setLocLoading(true);
    setLocError('');
    if (!navigator.geolocation) {
      setLocError('Geolocation not supported by your browser.');
      setLocLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocation({ lat, lng });
        await reverseGeocode(lat, lng);
        setLocLoading(false);
      },
      (err) => {
        setLocError('Could not fetch your location. Please allow location access.');
        setLocLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
      );
      const data = await res.json();
      if (data.results?.[0]) {
        const result = data.results[0];
        setAddress(result.formatted_address);
        // Extract area/locality from address components
        const locality = result.address_components?.find(c =>
          c.types.includes('sublocality') || c.types.includes('locality')
        );
        setArea(locality?.long_name || result.formatted_address.split(',').slice(0, 2).join(','));
      }
    } catch {
      setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      setArea('Location detected');
    }
  };

  const handleMapClick = useCallback(async (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setLocation({ lat, lng });
    setLocLoading(true);
    await reverseGeocode(lat, lng);
    setLocLoading(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location) { toast.error('Please allow location access.'); return; }
    if (!category) { toast.error('Please select a category.'); return; }
    if (description.length < 20) { toast.error('Please describe the problem in at least 20 characters.'); return; }
    if (!imageFile) { toast.error('Please capture a live image of the problem.'); return; }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('category', category);
      formData.append('description', description);
      formData.append('latitude', location.lat);
      formData.append('longitude', location.lng);
      formData.append('address', address);
      formData.append('area', area);
      formData.append('image', imageFile);

      await api.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSubmitted(true);
      toast.success('Complaint raised successfully! 🎉');
      onSuccess?.();
      // Reset after 3s
      setTimeout(() => {
        setSubmitted(false);
        setCategory('');
        setDescription('');
        setImageFile(null);
        fetchLocation();
      }, 3000);
    } catch (err) {
      if (err.response?.data?.error) {
        toast.error(err.response.data.error);
      } else {
        toast.error('Failed to submit complaint. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400, gap: 20, textAlign: 'center' }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <CheckCircle size={40} color="#10b981" />
      </motion.div>
      <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.5rem' }}>Complaint Submitted!</h2>
      <p style={{ color: '#94a3b8', maxWidth: 350 }}>Your complaint has been registered. The admin will review and assign a worker shortly.</p>
    </motion.div>
  );

  return (
    <div className="page-enter">
      <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.4rem', marginBottom: 6 }}>{t('dashboard.raise', 'Raise a Complaint')}</h2>
      <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: 24 }}>{t('dashboard.locAuto', 'Your location is auto-detected. Describe the issue and submit.')}</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Map Panel */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin size={18} color="#6366f1" /> {t('complaint.location', 'Your Location')}
            </h3>
            <button onClick={fetchLocation} disabled={locLoading} className="btn btn-outline btn-sm">
              {locLoading ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> {t('complaint.detecting', 'Detecting…')}</> : `🎯 ${t('complaint.redetect', 'Re-detect')}`}
            </button>
          </div>

          {locError && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, marginBottom: 12, fontSize: '0.83rem', color: '#fca5a5' }}>
              <AlertCircle size={14} /> {locError}
            </div>
          )}

          <div className="map-container" style={{ height: 340 }}>
            {!apiKey ? (
              <div style={{ height: 340, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(13,15,30,0.8)', color: '#94a3b8', gap: 12, textAlign: 'center', padding: 20 }}>
                <MapPin size={40} color="#6366f1" />
                <p style={{ fontWeight: 600 }}>Google Maps API Key Required</p>
                <p style={{ fontSize: '0.8rem' }}>Add VITE_GOOGLE_MAPS_API_KEY to your .env file to enable the map.</p>
              </div>
            ) : loadError ? (
              <div style={{ height: 340, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(13,15,30,0.8)', color: '#f87171' }}>
                Map failed to load. Check your API key.
              </div>
            ) : !isLoaded ? (
              <div style={{ height: 340, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(13,15,30,0.8)' }}>
                <div className="spinner" />
              </div>
            ) : (
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={location || { lat: 21.2514, lng: 81.6296 }}
                zoom={location ? 15 : 10}
                options={{ styles: MAP_STYLE, disableDefaultUI: false, zoomControl: true, mapTypeControl: false, streetViewControl: false }}
                onClick={handleMapClick}
              >
                {location && (
                  <>
                    <Marker position={location} />
                    <Circle
                      center={location}
                      radius={100}
                      options={{ fillColor: '#6366f1', fillOpacity: 0.15, strokeColor: '#6366f1', strokeOpacity: 0.6, strokeWeight: 2 }}
                    />
                  </>
                )}
              </GoogleMap>
            )}
          </div>

          {/* Address Display */}
          {(address || locLoading) && (
            <div style={{ marginTop: 12, padding: '12px 14px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10 }}>
              {locLoading ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#818cf8', fontSize: '0.83rem' }}>
                  <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Detecting your location…
                </div>
              ) : (
                <>
                  <div style={{ fontSize: '0.78rem', color: '#818cf8', fontWeight: 600, marginBottom: 4 }}>📍 {t('complaint.detectedLoc', 'DETECTED LOCATION')}</div>
                  <div style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>{address}</div>
                  {area && <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 3 }}>{t('complaint.area', 'Area')}: {area}</div>}
                </>
              )}
            </div>
          )}
          <p style={{ fontSize: '0.75rem', color: '#475569', marginTop: 8 }}>💡 {t('complaint.mapTip', 'Click anywhere on the map to adjust the complaint location.')}</p>
        </div>

        {/* Form Panel */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="form-group">
            <label className="form-label">{t('complaint.category', 'Problem Category')} *</label>
            <select
              id="complaint-category"
              className="form-select"
              value={category}
              onChange={e => setCategory(e.target.value)}
              required
            >
              <option value="">{t('complaint.selectCat', 'Select a category…')}</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{t(`complaint.cats.${c}`, c)}</option>)}
            </select>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="form-label" style={{ marginBottom: 0 }}>{t('complaint.description', 'Describe the Problem')} *</label>
              {SpeechRecognition && (
                <button
                  type="button"
                  onClick={toggleListening}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '4px 10px', borderRadius: 8, border: 'none',
                    background: isListening ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)',
                    color: isListening ? '#f87171' : '#818cf8', cursor: 'pointer',
                    fontSize: '0.75rem', fontWeight: 600, transition: 'all 0.2s'
                  }}
                >
                  {isListening ? <><MicOff size={14} /> {t('complaint.stop', 'Stop')}</> : <><Mic size={14} /> {t('complaint.voice', 'Dictate Problem')}</>}
                </button>
              )}
            </div>
            
            <textarea
              id="complaint-description"
              className="form-textarea"
              style={{ minHeight: 140 }}
              placeholder={t('complaint.placeholder', 'Please describe the issue in detail...')}
              value={description}
              onChange={e => setDescription(e.target.value)}
              minLength={20}
              required
            />
            <span style={{ fontSize: '0.75rem', color: description.length < 20 ? '#f59e0b' : '#10b981', marginTop: 2 }}>
              {description.length}/20 {t('complaint.minChars', 'minimum characters')}
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">{t('complaint.location', 'Location Address')}</label>
            <input
              className="form-input"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Address will be auto-filled from map…"
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('complaint.area', 'Area / Locality')}</label>
            <input
              className="form-input"
              value={area}
              onChange={e => setArea(e.target.value)}
              placeholder="Area name…"
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('complaint.image', 'Live Image Capture')} *</label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="form-input"
              style={{ padding: '10px 14px', background: 'var(--bg-card)', color: '#e2e8f0', border: '1px solid var(--border)', borderRadius: 10 }}
              onChange={e => setImageFile(e.target.files[0])}
              required
            />
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 4 }}>
              📷 {t('complaint.imagePrompt', 'Please capture a clear, real-time photo of the issue.')}
            </span>
          </div>

          <motion.button
            id="submit-complaint-btn"
            type="submit"
            disabled={submitting || !location}
            whileHover={{ scale: submitting ? 1 : 1.02, boxShadow: submitting ? 'none' : '0 8px 30px rgba(99,102,241,0.4)' }}
            whileTap={{ scale: 0.98 }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: '14px', borderRadius: 12, border: 'none',
              background: submitting ? '#1e2340' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: 'white', fontWeight: 700, fontSize: '1rem', cursor: submitting ? 'not-allowed' : 'pointer',
              marginTop: 8, transition: 'all 0.2s',
            }}
          >
            {submitting ? (
              <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Submitting…</>
            ) : (
              <><Send size={18} /> {t('complaint.submit', 'Submit Complaint')}</>
            )}
          </motion.button>

          {!location && (
            <p style={{ fontSize: '0.8rem', color: '#f59e0b', textAlign: 'center' }}>
              ⚠️ Location is required to submit a complaint.
            </p>
          )}
        </form>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
