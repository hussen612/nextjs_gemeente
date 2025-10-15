'use client';


import { useRouter } from 'next/navigation';
import React from 'react';
import { GoogleMap, Marker, useLoadScript, Autocomplete } from '@react-google-maps/api';
import UserMap from '../../components/UserMap';
import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
export default function DashboardPage() {
  return <div>
  <header className="site-header">
        <div className="container">
          <div className="header-row">
            <Link href="/" className="brand" aria-label="Gemeente Meldingen home">
              <img
              src="https://media.ffycdn.net/eu/gemeente-rotterdam/soYxtMssfc7dYXbBWnwc.svg?mod=v1/max=2400"
              alt="Gemeente Meldingen"
              className="brand-logo"
              style={{ height: 40, width: 'auto', display: 'block' }}
              />
            </Link>
            <nav className="nav">
              <Link href="/about" className="nav-link">
                Over
              </Link>
              <Link href="/admin-dashboard" className="nav-link">
                Admin
              </Link>
              <SignedOut >
                <SignInButton>
                  <button className="btn btn-primary">Inloggen</button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </nav>
          </div>
        </div>
      </header>
         <UserMap />
         <br></br>
<section className="text-center mb-5" aria-label="Volgende stappen">
            <SignedIn>
                <Link href="/submit-alert" className="btn btn-primary btn-large">
                  Maak een melding
                </Link>
              </SignedIn>
              </section>
                    <footer className="site-footer mt-5">
        <div className="container">
          <div className="grid grid-3 mb-4">
            <div>
              <h3 className="h5 mb-3">Diensten</h3>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <Link href="/report" className="text-muted">Meld een probleem</Link>
                </li>
                <li className="mb-2">
                  <Link href="/status" className="text-muted">Bekijk status van melding</Link>
                </li>
                <li className="mb-2">
                  <Link href="/map" className="text-muted">Bekijk kaart</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="h5 mb-3">Informatie</h3>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <Link href="/about" className="text-muted">Over deze dienst</Link>
                </li>
                <li className="mb-2">
                  <Link href="/help" className="text-muted">Hulp & ondersteuning</Link>
                </li>
                <li className="mb-2">
                  <Link href="/privacy" className="text-muted">Privacybeleid</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="h5 mb-3">Contact</h3>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <span className="text-muted">Telefoon: 14 010</span>
                </li>
                <li className="mb-2">
                  <span className="text-muted">E-mail: info@rotterdam.nl</span>
                </li>
                <li className="mb-2">
                  <Link href="/contact" className="text-muted">Contactformulier</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="text-center pt-4" style={{ borderTop: '1px solid var(--border-secondary)' }}>
            <p className="text-muted text-small mb-0">
              © 2025 Gemeente Rotterdam. Alle rechten voorbehouden.
            </p>
          </div>
        </div>
      </footer>
      </div>
      
}

