// components/MapWithAlerts.jsx
'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { GoogleMap, Marker, InfoWindowF, useLoadScript } from '@react-google-maps/api';

const containerStyle = { width: '100%', height: '270px', borderRadius: 'var(--border-radius)' };
const defaultCenter = { lat: 51.9244, lng: 4.4777 }; // Rotterdam

export default function MapWithAlerts() {
  const alerts = useQuery(api.alerts.getAlerts) || [];
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    // You can add libraries: ['places'] if needed later
  });

  const markers = (alerts || []).map(a => {
    let lat = a.lat;
    let lng = a.lng;
    if ((lat == null || lng == null) && a.location?.includes(',')) {
      const parts = a.location.split(',');
      const pLat = parseFloat(parts[0]);
      const pLng = parseFloat(parts[1]);
      if (!isNaN(pLat) && !isNaN(pLng)) {
        lat = pLat;
        lng = pLng;
      }
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

      <div className="card-header">

      <GoogleMap mapContainerStyle={containerStyle} center={defaultCenter} zoom={12} options={{ mapTypeControl: false }}>
        {markers.map(m => (
          <Marker key={String(m._id)} position={{ lat: m.lat, lng: m.lng }} title={m.type} />
        ))}
      </GoogleMap>
      {markers.length === 0 && (
        <p className="text-small text-muted p-3 mb-0">Nog geen meldingen met coördinaten. Voeg lat/lng toe aan nieuwe meldingen.</p>
      )}
    </div>
  );
}