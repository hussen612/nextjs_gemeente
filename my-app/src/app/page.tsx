'use client';
import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import MapWithAlerts from '../components/MapWithAlerts';

export default function HomePage() {
  return (
    <div className="page">
      <main>
        <div className="container">
          <section className="hero mb-5" aria-labelledby="title">
            <h1 id="title" className="mb-5">Meld een probleem in Rotterdam</h1>
            <p className="text-muted text-large mb-0">
              Eén plek waar bewoners de gemeente kunnen wijzen op problemen in de openbare ruimte in hun buurt.
            </p>
          </section>

          <div className="grid grid-2 mb-5">
            <section className="card" aria-labelledby="what-you-can-do">
              <div className="card-header">
                <h2 id="what-you-can-do" className="card-title">Wat je kunt doen</h2>
              </div>
              <ul className="mb-0">
                <li>Meld kapotte straatlantaarns</li>
                <li>Meld vandalisme en graffiti</li>
                <li>Meld zwerfafval en dumpingen</li>
                <li>Meld schade aan wegen of stoepen</li>
                <li>Volg meldingen na inloggen</li>
              </ul>
            </section>
            <section className="card" aria-labelledby="map">
              <div className="card-header">
                <h2 id="map" className="card-title">Actieve meldingen</h2>
              </div>
              <MapWithAlerts />
            </section>
          </div>

          <section className="text-center mb-5" aria-label="Volgende stappen">
            <div className="list-inline">
              <Link href="/about" className="btn btn-secondary">
                Over deze dienst
              </Link>
              <SignedOut>
                <SignInButton>
                  <button className="btn btn-primary btn-large">
                    Log in om te melden
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" className="btn btn-primary btn-large">
                  Ga naar dashboard
                </Link>
              </SignedIn>
            </div>
            <SignedIn>
              <p className="text-muted text-small mt-3 mb-0">
                Je bent ingelogd en klaar om problemen te melden.
              </p>
            </SignedIn>
          </section>
        </div>
      </main>

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
  );
}