// pages/index.jsx (or wherever your HomePage component is located)
'use client';
import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import MapWithAlerts from '../components/MapWithAlerts'; // Adjust this import path as necessary

export default function HomePage() {
  return (
    <div className="page">
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
              <SignedOut>
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
              {/* Map with active alerts */}
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
  );
}