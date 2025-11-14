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
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  if (!isSignedIn) {
    return <div className="card"><div className="card-header"><h2 className="card-title">Kaart</h2></div><p>Log in om jouw meldingen op de kaart te zien.</p></div>;
  }

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
          <GoogleMap mapContainerStyle={containerStyle} center={defaultCenter} zoom={12} options={{ mapTypeControl: false }}>
            {markers.map(m => (
              <Marker key={String(m.id)} position={{ lat: m.lat, lng: m.lng }} title={m.type} />
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
                  <div className="text-tiny"><Link href={`/alerts/${a._id}`}>Bekijk details</Link></div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}