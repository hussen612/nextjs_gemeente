'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { useUser } from '@clerk/nextjs';

const containerStyle = { width: '100%', height: '450px', borderRadius: 'var(--border-radius)' };
const defaultCenter = { lat: 51.9244, lng: 4.4777 }; // Rotterdam

// Helper function to translate status codes to Dutch labels
function getStatusLabel(status) {
  const statusMap = {
    'open': 'Open',
    'in_progress': 'In behandeling',
    'resolved': 'Opgelost'
  };
  return statusMap[status] || status;
}

export default function UserMap() {
  const { isSignedIn } = useUser();
  const alerts = useQuery(api.alerts.getMyAlerts) || [];
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAlertId, setSelectedAlertId] = useState(null);
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });
  const fullAlert = useQuery(api.alerts.getAlertById, selectedAlertId ? { id: selectedAlertId } : "skip");
  const selectedImages = useQuery(api.files.getAlertImageUrls, selectedAlertId ? { alertId: selectedAlertId } : "skip") || [];

  // Filter and search alerts
  const filteredAlerts = useMemo(() => {
    let filtered = alerts || [];
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(a => a.status === statusFilter);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        (a.type || '').toLowerCase().includes(query) ||
        (a.description || '').toLowerCase().includes(query) ||
        (a.location || '').toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [alerts, statusFilter, searchQuery]);

  const selectedAlert = useMemo(() => {
    if (!selectedAlertId) return null;
    return fullAlert || filteredAlerts.find(a => String(a._id) === String(selectedAlertId)) || null;
  }, [selectedAlertId, fullAlert, filteredAlerts]);

  const selectedImageUrls = useMemo(() => {
    if (!selectedAlertId) return [];
    return selectedImages;
  }, [selectedAlertId, selectedImages]);

      if (!isSignedIn) {
        return <div className="card"><div className="card-header"><h2 className="card-title">Kaart</h2></div><p>Log in om jouw meldingen op de kaart te zien.</p></div>;
      }

  const markers = (filteredAlerts || []).map(a => {
    let { lat, lng } = a;
    if ((lat == null || lng == null) && a.location?.includes(',')) {
      const [la, ln] = a.location.split(',').map(Number);
      if (!Number.isNaN(la) && !Number.isNaN(ln)) { lat = la; lng = ln; }
    }
    if (lat == null || lng == null) return null;
    return { id: a._id, lat, lng, type: a.type, description: a.description };
  }).filter(Boolean);

  // New: sort filtered alerts for the simple list (newest first)
  const sortedAlerts = (filteredAlerts || [])
    .slice()
    .sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0));

  const mapCenter = useMemo(() => {
    if (markers.length > 0) {
      return { lat: markers[0].lat, lng: markers[0].lng };
    }
    return defaultCenter;
  }, [markers]);

  const handleOpenAlert = (id) => {
    setSelectedAlertId(id);
  };

  const handleCloseModal = () => {
    setSelectedAlertId(null);
  };

  if (loadError) {
    return <div className="card"><div className="card-header"><h2 className="card-title">Kaart</h2></div><p className="text-danger">Fout bij laden van Google Maps.</p></div>;
  }
  if (!isLoaded) {
    return <div className="card"><div className="card-header"><h2 className="card-title">Kaart</h2></div><p>Kaart laden...</p></div>;
  }

  return (
    <div className="card" aria-labelledby="alerts-map-heading">
      <div className="card-header">
        <h1 id="alerts-map-heading" className="card-title">Mijn meldingen</h1>
      </div>

      {/* Search and Filter Controls */}
      <div className="p-3" style={{ borderBottom: '1px solid var(--border-secondary)' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 250px' }}>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Zoek op type, beschrijving of locatie..."
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label className="text-muted" style={{ whiteSpace: 'nowrap' }}>Status:</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Alle</option>
              <option value="open">Open</option>
              <option value="in_progress">In behandeling</option>
              <option value="resolved">Opgelost</option>
            </select>
          </div>
          {(searchQuery || statusFilter !== 'all') && (
            <button 
              className="btn btn-secondary btn-small"
              onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
            >
              Wis filters
            </button>
          )}
        </div>
      </div>

      {/* New: two-column layout */}
      <div className="grid grid-2" style={{ gap: '1rem' }}>
        <div>
          <GoogleMap mapContainerStyle={containerStyle} center={mapCenter} zoom={12} options={{ mapTypeControl: false }}>
            {markers.map(m => (
              <Marker
                key={String(m.id)}
                position={{ lat: m.lat, lng: m.lng }}
                title={m.type}
                onClick={() => handleOpenAlert(String(m.id))}
              />
            ))}
          </GoogleMap>
          {markers.length === 0 && (
            <p className="text-small text-muted p-3 mb-0">
              {searchQuery || statusFilter !== 'all'
                ? 'Geen meldingen gevonden met de huidige filters.'
                : 'Je hebt nog geen meldingen met coördinaten.'}
            </p>
          )}
        </div>

        <div className="p-3" style={{ maxHeight: 450, overflowY: 'auto', borderLeft: '1px solid var(--border-secondary)' }}>
          {sortedAlerts.length === 0 ? (
            <p className="text-small text-muted mb-0">
              {searchQuery || statusFilter !== 'all'
                ? 'Geen meldingen gevonden met de huidige filters.'
                : 'Nog geen meldingen.'}
            </p>
          ) : (
            <ul className="list-unstyled mb-0">
              {sortedAlerts.map(a => (
                <li key={String(a._id)} className="mb-3">
                  <div className="fw-600">
                    {a.type} <span className="text-muted">• {getStatusLabel(a.status || 'open')}</span>
                  </div>
                  <div className="text-small">{a.description}</div>
                  <div className="text-tiny text-muted">
                    {a.location} — {a.timestamp ? new Date(a.timestamp).toLocaleString() : ''}
                  </div>
                  <div className="text-tiny" style={{ display: 'flex', gap: 8 }}>
                    <Link href={`/alerts/${a._id}`}>Bekijk details</Link>
                    <button
                      type="button"
                      className="btn btn-link btn-small"
                      onClick={() => handleOpenAlert(String(a._id))}
                      style={{ padding: 0 }}
                    >
                      Snel bekijken
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {selectedAlert && (
        <div
          role="dialog"
          aria-modal="true"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '60px 24px', zIndex: 2000 }}
          onClick={handleCloseModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 720, background: '#fff', borderRadius: 12, boxShadow: '0 6px 24px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', overflow: 'hidden', maxHeight: 'calc(100vh - 120px)' }}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="h5 mb-0">Melding details</h2>
              <button className="btn btn-secondary" onClick={handleCloseModal}>Sluiten</button>
            </div>
            <div style={{ padding: 20, display: 'grid', gap: 20, overflowY: 'auto' }}>
              <section>
                <h3 className="h6 mb-2">Algemeen</h3>
                <div className="text-small"><strong>Type:</strong> {selectedAlert.type}</div>
                <div className="text-small"><strong>Beschrijving:</strong> {selectedAlert.description}</div>
                <div className="text-small"><strong>Locatie:</strong> {selectedAlert.location}</div>
                <div className="text-small"><strong>Datum:</strong> {selectedAlert.timestamp ? new Date(selectedAlert.timestamp).toLocaleString() : 'Onbekend'}</div>
                <div className="text-small"><strong>Status:</strong> {getStatusLabel(selectedAlert.status)}</div>
              </section>

              {(selectedImageUrls.length > 0) && (
                <section>
                  <h3 className="h6 mb-2">Foto's</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))', gap: 12 }}>
                    {selectedImageUrls.map((url, idx) => (
                      <div key={idx} style={{ border: '1px solid #eee', borderRadius: 8, overflow: 'hidden', background: '#fafafa' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`alert-img-${idx}`} style={{ width: '100%', height: 120, objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <Link href={`/alerts/${selectedAlert._id}`} className="btn btn-primary">Ga naar detailpagina</Link>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}