import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, MapPin, Calendar, ChevronRight } from 'lucide-react';
import { GoogleMap, useLoadScript, Marker, Circle } from '@react-google-maps/api';
import api from '../../api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const STATUS_COLORS = { pending: '#f59e0b', assigned: '#6366f1', reverification: '#f97316', resolved: '#10b981' };

const MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0d0f1e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0d0f1e' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e2340' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1e2340' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#070a1a' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
];

function ComplaintModal({ complaint, workers, onClose, onUpdate }) {
  const { t } = useTranslation();
  const [assigning, setAssigning] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useLoadScript({ googleMapsApiKey: apiKey || '' });

  const handleAssign = async () => {
    if (!selectedWorker) return toast.error(t('admin.selectWorker', 'Select a worker first'));
    const worker = workers.find(w => w.id === selectedWorker);
    setActionLoading(true);
    try {
      const r = await api.patch(`/complaints/${complaint.id}/assign`, { workerId: worker.id, workerName: worker.name });
      onUpdate(r.data.complaint);
      toast.success(`${t('admin.assignedTo', 'Assigned to')} ${worker.name}!`);
      onClose();
    } catch {
      toast.error(t('admin.assignFail', 'Failed to assign worker'));
    } finally {
      setActionLoading(false);
    }
  };



  const handleResolve = async () => {
    setActionLoading(true);
    try {
      const r = await api.patch(`/complaints/${complaint.id}/resolve`);
      onUpdate(r.data.complaint);
      toast.success(t('complaint.resolveSuccessMsg', 'Complaint marked as resolved! 🎉'));
      onClose();
    } catch {
      toast.error(t('common.failed', 'Failed'));
    } finally {
      setActionLoading(false);
    }
  };

  const sc = STATUS_COLORS[complaint.status] || '#6366f1';

  return (
    <div className="modal-overlay" style={{ marginTop: '70px' }} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        className="modal"
        style={{ maxWidth: 680, width: '90%', maxHeight: '85vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header" style={{ gap: 16, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.15rem', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{t(`complaint.cats.${complaint.category}`, complaint.category)}</h2>
            <span style={{ background: `${sc}20`, color: sc, border: `1px solid ${sc}40`, padding: '2px 10px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700, marginTop: 4, display: 'inline-block' }}>
              {t(`dashboard.${complaint.status}`, complaint.status?.toUpperCase())}
            </span>
          </div>
          <button onClick={onClose} style={{ flexShrink: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#94a3b8' }}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', marginTop: '70px', flexDirection: 'column', gap: 16 }}>
          {/* Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {[
              { label: t('admin.table.citizen', 'Citizen'), value: complaint.userName, icon: User },
              { label: t('complaint.area', 'Area'), value: complaint.area || 'N/A', icon: MapPin },
              { label: t('auth.email', 'Email'), value: complaint.userEmail, icon: null },
              { label: t('admin.table.date', 'Date'), value: new Date(complaint.createdAt).toLocaleDateString(t('app.locale', 'en-IN')), icon: Calendar },
            ].map(item => (
              <div key={item.label} style={{ padding: '10px 14px', background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border)', minWidth: 0 }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: 3 }}>{item.label}</div>
                <div style={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 500, overflowWrap: 'break-word', wordBreak: 'break-word' }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Address Map */}
          {(complaint.latitude && complaint.longitude) ? (
            <div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('complaint.detectedLoc', 'Reported Location')}</div>
              <div style={{ padding: '8px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12 }}>
                <div style={{ height: 160, borderRadius: 8, overflow: 'hidden', marginBottom: 8, background: 'rgba(13,15,30,0.8)', position: 'relative' }}>
                  {!apiKey ? (
                    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>API Key Required</div>
                  ) : !isLoaded ? (
                    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>
                  ) : loadError ? (
                    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>Map Error</div>
                  ) : (
                    <GoogleMap
                      mapContainerStyle={{ width: '100%', height: '100%' }}
                      center={{ lat: parseFloat(complaint.latitude), lng: parseFloat(complaint.longitude) }}
                      zoom={15}
                      options={{ styles: MAP_STYLE, disableDefaultUI: true, gestureHandling: 'greedy' }}
                    >
                      <Marker position={{ lat: parseFloat(complaint.latitude), lng: parseFloat(complaint.longitude) }} />
                      <Circle
                        center={{ lat: parseFloat(complaint.latitude), lng: parseFloat(complaint.longitude) }}
                        radius={100}
                        options={{ fillColor: sc, fillOpacity: 0.15, strokeColor: sc, strokeOpacity: 0.6, strokeWeight: 2 }}
                      />
                    </GoogleMap>
                  )}
                </div>
                {complaint.address && (
                  <div style={{ padding: '4px 6px', fontSize: '0.83rem', color: '#a5b4fc', display: 'flex', gap: 6 }}>
                    📍 <span>{complaint.address}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            complaint.address && (
              <div style={{ padding: '10px 14px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, fontSize: '0.83rem', color: '#a5b4fc' }}>
                📍 {complaint.address}
              </div>
            )
          )}

          {/* Images & Similarity */}
          {(complaint.photoUrl || complaint.resolvedPhotoUrl) && (
            <div>
              {complaint.similarityScore !== null && complaint.similarityScore !== undefined && (
                <div style={{ padding: '12px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ background: complaint.similarityScore >= 80 ? '#10b981' : complaint.similarityScore >= 50 ? '#f59e0b' : '#ef4444', color: 'white', fontWeight: 800, padding: '4px 10px', borderRadius: 8, fontSize: '0.9rem' }}>
                    {complaint.similarityScore}%
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#c4b5fd' }}>
                    <span style={{ fontWeight: 700 }}>{t('admin.aiMatchTitle', 'AI Match Analysis')}:</span> {t('admin.aiMatchDesc', 'Comparison rating of problem vs physical resolution site based on imagery.')}
                  </div>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                {complaint.photoUrl && (
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('admin.problemPhoto', 'Problem Photo')}</div>
                    <img src={complaint.photoUrl} alt="Problem" style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 12, border: '1px solid var(--border)' }} />
                  </div>
                )}
                {complaint.resolvedPhotoUrl && (
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('admin.resolutionProof', 'Resolution Proof')}</div>
                    <img src={complaint.resolvedPhotoUrl} alt="Resolved" style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 12, border: '1px solid var(--border)' }} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('complaint.description', 'Problem Description')}</div>
            <div style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.6, padding: '12px 14px', background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border)' }}>
              {complaint.description}
            </div>
          </div>

          {/* Worker if assigned */}
          {complaint.workerName && (
            <div style={{ padding: '10px 14px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, fontSize: '0.85rem' }}>
              <span style={{ color: '#64748b' }}>{t('admin.assignedWorker', 'Assigned Worker')}: </span>
              <span style={{ color: '#818cf8', fontWeight: 600 }}>👷 {complaint.workerName}</span>
            </div>
          )}

          {/* Actions */}
          <div style={{ paddingTop: 8, borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('admin.actions', 'Actions')}</div>

            {complaint.status === 'pending' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <select
                  className="form-select"
                  value={selectedWorker}
                  onChange={e => setSelectedWorker(e.target.value)}
                >
                  <option value="">{t('admin.selectWorkerPrompt', 'Select a worker to assign…')}</option>
                  {workers.map(w => (
                    <option key={w.id} value={w.id}>{w.name} — {w.area || t('admin.anyArea', 'Any area')} {w.specialization ? `(${w.specialization})` : ''}</option>
                  ))}
                </select>
                <button onClick={handleAssign} disabled={actionLoading || !selectedWorker} className="btn btn-primary">
                  {actionLoading ? t('admin.assigning', 'Assigning…') : `👷 ${t('admin.assignWorker', 'Assign Worker')}`}
                </button>
              </div>
            )}

            {complaint.status === 'reverification' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ padding: '12px', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 10, fontSize: '0.85rem', color: '#fb923c' }}>
                  {t('admin.workerCompletedMsg', 'Worker has marked this as complete. Verify the work.')}
                </div>
                <button onClick={handleResolve} disabled={actionLoading} className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', width: '100%' }}>
                  {actionLoading ? t('admin.resolving', 'Resolving…') : `✅ ${t('admin.approveMarkResolved', 'Approve & Mark as Resolved')}`}
                </button>

                <div style={{ position: 'relative', marginTop: 10, marginBottom: 10 }}>
                  <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '1px solid var(--border)' }} />
                  <div style={{ position: 'relative', background: 'var(--bg-card)', padding: '0 10px', width: 'fit-content', margin: '0 auto', fontSize: '0.75rem', color: '#64748b' }}>{t('admin.orReject', 'OR REJECT')}</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <select
                    className="form-select"
                    value={selectedWorker}
                    onChange={e => setSelectedWorker(e.target.value)}
                  >
                    <option value="">{t('admin.selectWorkerReassign', 'Select a worker for re-assignment…')}</option>
                    {workers.map(w => (
                      <option key={w.id} value={w.id}>{w.name} — {w.area || t('admin.anyArea', 'Any area')} {w.specialization ? `(${w.specialization})` : ''}</option>
                    ))}
                  </select>
                  <button onClick={handleAssign} disabled={actionLoading || !selectedWorker} className="btn btn-outline" style={{ borderColor: '#ef4444', color: '#ef4444' }}>
                    {actionLoading ? t('admin.reassigning', 'Re-assigning…') : `❌ ${t('admin.rejectReassign', 'Reject & Re-assign Worker')}`}
                  </button>
                </div>
              </div>
            )}

            {complaint.status === 'resolved' && (
              <div style={{ padding: '12px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, fontSize: '0.85rem', color: '#6ee7b7', textAlign: 'center' }}>
                ✅ {t('admin.resolvedOnMsg', 'This complaint has been resolved on')} {new Date(complaint.resolvedAt).toLocaleDateString(t('app.locale', 'en-IN'))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function AllComplaints() {
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    Promise.all([api.get('/complaints'), api.get('/workers/available')])
      .then(([cr, wr]) => {
        setComplaints(cr.data.complaints || []);
        setWorkers(wr.data.workers || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateComplaint = (updated) => {
    setComplaints(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const filtered = filter === 'all' ? complaints : complaints.filter(c => c.status === filter);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}><div className="spinner" /></div>;

  return (
    <div className="page-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.4rem' }}>{t('admin.complaints', 'All Complaints')}</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.83rem', marginTop: 2 }}>{complaints.length} {t('admin.totalComplaints', 'total')}</p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'pending', 'assigned', 'reverification', 'resolved'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, background: filter === f ? '#f59e0b' : 'var(--bg-card)', color: filter === f ? '#07080f' : 'var(--text-secondary)', transition: 'all 0.2s' }}>
              {t(`dashboard.${f}`, f)}
            </button>
          ))}
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>{t('complaint.category', 'Category')}</th>
              <th>{t('admin.table.citizen', 'Citizen')}</th>
              <th>{t('complaint.area', 'Area')}</th>
              <th>{t('admin.table.status', 'Status')}</th>
              <th>{t('admin.worker', 'Worker')}</th>
              <th>{t('admin.table.date', 'Date')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => {
              const sc = STATUS_COLORS[c.status] || '#6366f1';
              return (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                   style={{ cursor: 'pointer' }}
                  onClick={() => setSelected(c)}
                >
                  <td style={{ fontWeight: 600, color: '#e2e8f0' }}>{t(`complaint.cats.${c.category}`, c.category)}</td>
                  <td>{c.userName}</td>
                  <td style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.area || 'N/A'}</td>
                  <td>
                    <span style={{ background: `${sc}20`, color: sc, border: `1px solid ${sc}40`, padding: '3px 10px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700 }}>
                      {t(`dashboard.${c.status}`, c.status?.toUpperCase())}
                    </span>
                  </td>
                  <td>{c.workerName || <span style={{ color: '#475569' }}>—</span>}</td>
                  <td>{new Date(c.createdAt).toLocaleDateString(t('app.locale', 'en-IN'))}</td>
                  <td style={{ color: '#64748b' }}><ChevronRight size={16} /></td>
                </motion.tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#475569' }}>{t('admin.noComplaintsMatch', 'No complaints found.')}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {selected && (
          <ComplaintModal
            complaint={selected}
            workers={workers}
            onClose={() => setSelected(null)}
            onUpdate={updateComplaint}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
