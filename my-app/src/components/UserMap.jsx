'use client';

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { useUser } from '@clerk/nextjs';

const containerStyle = { width: '100%', height: '250px', borderRadius: 'var(--border-radius)' };
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

  if (loadError) {
    return <div className="card"><div className="card-header"><h2 className="card-title">Kaart</h2></div><p className="text-danger">Fout bij laden van Google Maps.</p></div>;
  }
  if (!isLoaded) {
    return <div className="card"><div className="card-header"><h2 className="card-title">Kaart</h2></div><p>Kaart laden...</p></div>;
  }

  return (
    <div className="card" aria-labelledby="alerts-map-heading">
      <div className="card-header">
        <h2 id="alerts-map-heading" className="card-title">Mijn meldingen (kaart)</h2>
      </div>
      <GoogleMap mapContainerStyle={containerStyle} center={defaultCenter} zoom={12} options={{ mapTypeControl: false }}>
        {markers.map(m => (
          <Marker key={String(m.id)} position={{ lat: m.lat, lng: m.lng }} title={m.type} />
        ))}
      </GoogleMap>
      {markers.length === 0 && (
        <p className="text-small text-muted p-3 mb-0">Je hebt nog geen meldingen met coördinaten.</p>
      )}
    </div>
  );
}