'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';

export default function AdminBootstrapPage() {
  const hasAny = useQuery((api as any).admin.hasAnyAdmin);
  const amAdminClerk = useQuery((api as any).admin.isAdminClerk);
  const bootstrap = useMutation((api as any).admin.bootstrapSelf);

  const onBootstrap = async () => {
    try {
      await bootstrap({});
      alert('Je bent nu beheerder. Ga naar het admin dashboard.');
    } catch (e: any) {
      alert(e?.message || 'Kon geen beheerder aanmaken.');
    }
  };

  return (
    <main className="container p-4">
      <h1 className="h3 mb-3">Admin initialisatie</h1>
      <p className="text-muted mb-4">Gebruik dit éénmalig om de eerste beheerder toe te voegen.</p>

      <SignedOut>
        <div className="card p-3">
          <p className="mb-3">Log in om verder te gaan.</p>
          <SignInButton>
            <button className="btn btn-primary">Inloggen</button>
          </SignInButton>
        </div>
      </SignedOut>

      <SignedIn>
        {hasAny === undefined && <p>Controleren…</p>}
        {hasAny === true || amAdminClerk === true ? (
          <div className="card p-3">
            <p className="mb-3">Er bestaat al minstens één beheerder of je bent al admin via Clerk.</p>
            <Link href="/admin-dashboard" className="btn btn-secondary">Ga naar admin dashboard</Link>
          </div>
        ) : (
          <div className="card p-3">
            <p className="mb-3">Nog geen beheerders gevonden. Je kunt jezelf nu als beheerder instellen.</p>
            <button className="btn btn-primary" onClick={onBootstrap}>Maak mij beheerder</button>
          </div>
        )}
      </SignedIn>
    </main>
  );
}
