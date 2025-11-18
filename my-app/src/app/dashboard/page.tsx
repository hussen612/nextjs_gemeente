'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import { GoogleMap, Marker, useLoadScript, Autocomplete } from '@react-google-maps/api';
import UserMap from '../../components/UserMap';
import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
export default function DashboardPage() {
  return <div>
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
              <h3 className="h5 mb-3">Contact</h3>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <span className="text-muted">Telefoon: 14 010</span>
                </li>
                <li className="mb-2">
                  <a href="mailto:info@rotterdam.nl" className="text-muted">E-mail: info@rotterdam.nl</a>
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

