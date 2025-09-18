// components/MapWithAlerts.jsx
'use client';

import React, { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { GoogleMap, Marker, InfoWindowF, useLoadScript } from '@react-google-maps/api';

const containerStyle = { width: '100%', height: '250px', borderRadius: 'var(--border-radius)' };
const defaultCenter = { lat: 51.9244, lng: 4.4777 }; // Rotterdam

// Attempt to parse a "lat,lng" string quickly.
function parseLatLng(location) {
  if (!location) return null;
  const parts = location.split(/\s*,\s*/);
  if (parts.length !== 2) return null;
  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);
  if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  return null;
}

export default function MapWithAlerts() {
  const alerts = useQuery(api.alerts.getAlerts) || [];
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    // You can add libraries: ['places'] if needed later
  });

  const markers = useMemo(() => {
    return alerts
      .map(a => {
        // Prefer stored numeric coordinates
        if (typeof a.lat === 'number' && typeof a.lng === 'number') {
          return { ...a, position: { lat: a.lat, lng: a.lng } };
        }
        const parsed = parseLatLng(a.location);
        return parsed ? { ...a, position: parsed } : null;
      })
      .filter(Boolean);
  }, [alerts]);

  if (loadError) {
    return <div className="card"><div className="card-header"><h2 className="card-title">Kaart</h2></div><p className="text-danger">Fout bij laden van Google Maps.</p></div>;
  }

  if (!isLoaded) {
    return <div className="card"><div className="card-header"><h2 className="card-title">Kaart</h2></div><p>Kaart laden...</p></div>;
  }

  return (
    <div className="card" aria-labelledby="alerts-map-heading">
      <div className="card-header">
        <h2 id="alerts-map-heading" className="card-title">Actieve meldingen (kaart)</h2>
      </div>
      <GoogleMap mapContainerStyle={containerStyle} center={defaultCenter} zoom={12} options={{ mapTypeControl: false }}>
        {markers.map(m => (
          <Marker key={String(m._id)} position={m.position} title={m.type} />
        ))}
      </GoogleMap>
      {markers.length === 0 && (
        <p className="text-small text-muted p-3 mb-0">Nog geen meldingen met coördinaten. Voeg lat/lng toe aan nieuwe meldingen.</p>
      )}
    </div>
  );
}