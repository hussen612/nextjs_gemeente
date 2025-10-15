'use client';

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import Link from 'next/link';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { useParams } from 'next/navigation';

export default function AlertDetailPage() {
  const params = useParams();
  const idParam = params?.id as string;
  // Convex ids are structured; try to pass directly. If malformed, query returns null.
  const alert = useQuery((api as any).alerts.getAlertById, idParam ? { id: idParam as any } : 'skip') as any;

  if (!idParam) {
    return <main className="container p-4"><p>Geen ID opgegeven.</p></main>;
  }
  if (alert === undefined) {
    return <main className="container p-4"><p>Laden...</p></main>;
  }
  if (alert === null) {
    return <main className="container p-4"><p>Melding niet gevonden.</p></main>;
  }

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  return (
    <main className="container p-4">
      <div className="mb-3">
        <Link href="/dashboard" className="text-muted">← Terug naar dashboard</Link>
      </div>
      <h1 className="h3 mb-2">Melding: {alert.type}</h1>
      <div className="text-muted mb-4">Status: {alert.status} • {new Date(alert.timestamp).toLocaleString()}</div>

      <section className="card mb-4">
        <div className="card-header">
          <h2 className="card-title">Details</h2>
        </div>
        <div className="p-3">
          <p className="mb-2"><strong>Omschrijving:</strong> {alert.description}</p>
          <p className="mb-2"><strong>Locatie:</strong> {alert.location}</p>
          {alert.lat != null && alert.lng != null && (
            <p className="mb-0"><strong>Coördinaten:</strong> {alert.lat}, {alert.lng}</p>
          )}
        </div>
      </section>

      {alert.lat != null && alert.lng != null && (
        <section className="card mb-4">
          <div className="card-header">
            <h2 className="card-title">Kaart</h2>
          </div>
          <div className="p-3">
            {loadError && <p className="text-danger">Kaart laden mislukt.</p>}
            {!isLoaded ? (
              <p>Kaart laden…</p>
            ) : (
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: 320, borderRadius: 8 }}
                center={{ lat: alert.lat, lng: alert.lng }}
                zoom={15}
                options={{ mapTypeControl: false }}
              >
                <Marker position={{ lat: alert.lat, lng: alert.lng }} />
              </GoogleMap>
            )}
          </div>
        </section>
      )}

      <section className="card">
        <div className="card-header">
          <h2 className="card-title">Notities</h2>
        </div>
        <div className="p-3">
          {(alert.notes?.length ?? 0) === 0 ? (
            <p className="text-muted mb-0">Nog geen notities.</p>
          ) : (
            <ul className="list-unstyled mb-0">
              {alert.notes.map((n: any, idx: number) => (
                <li key={idx} className="mb-2">
                  <div className="text-small">{n.text}</div>
                  <div className="text-tiny text-muted">{new Date(n.timestamp).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
