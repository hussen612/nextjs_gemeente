'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { useUser } from '@clerk/nextjs';

const containerStyle = { width: '100%', height: '450px', borderRadius: 'var(--border-radius)' };
const defaultCenter = { lat: 51.9244, lng: 4.4777 }; // Rotterdam

export default function UserMap() {
  const { isSignedIn } = useUser();
  const alerts = useQuery(api.alerts.getMyAlerts) || [];
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  if (!isSignedIn) {
    return <div className="card"><div className="card-header"><h2 className="card-title">Kaart</h2></div><p>Log in om jouw meldingen op de kaart te zien.</p></div>;
  }

  const markers = (alerts || []).map(a => {
    let { lat, lng } = a;
    if ((lat == null || lng == null) && a.location?.includes(',')) {
      const [la, ln] = a.location.split(',').map(Number);
      if (!Number.isNaN(la) && !Number.isNaN(ln)) { lat = la; lng = ln; }
    }
    if (lat == null || lng == null) return null;
    return { id: a._id, lat, lng, type: a.type, description: a.description };
  }).filter(Boolean);

  // New: sort alerts for the simple list (newest first)
  const sortedAlerts = (alerts || [])
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

      {/* New: two-column layout */}
      <div className="grid grid-2" style={{ gap: '1rem' }}>
        <div>
          <GoogleMap mapContainerStyle={containerStyle} center={defaultCenter} zoom={12} options={{ mapTypeControl: false }}>
            {markers.map(m => (
              <Marker key={String(m.id)} position={{ lat: m.lat, lng: m.lng }} title={m.type} />
            ))}
          </GoogleMap>
          {markers.length === 0 && (
            <p className="text-small text-muted p-3 mb-0">Je hebt nog geen meldingen met coördinaten.</p>
          )}
        </div>

        <div className="p-3" style={{ maxHeight: 450, overflowY: 'auto', borderLeft: '1px solid var(--border-secondary)' }}>
          {sortedAlerts.length === 0 ? (
            <p className="text-small text-muted mb-0">Nog geen meldingen.</p>
          ) : (
            <ul className="list-unstyled mb-0">
              {sortedAlerts.map(a => (
                <li key={String(a._id)} className="mb-3">
                  <div className="fw-600">
                    {a.type} <span className="text-muted">• {a.status || 'nieuw'}</span>
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