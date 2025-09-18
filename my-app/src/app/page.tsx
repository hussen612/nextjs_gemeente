'use client';
import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function HomePage() {
  return (
    <div className="page">
      <header className="site-header">
        <div className="container">
          <div className="header-row">
            <Link href="/" className="brand">
              Municipality Alerts
            </Link>
            <nav className="nav">
              <Link href="/about" className="nav-link">
                About
              </Link>
              <SignedOut>
                <SignInButton>
                  <button className="btn btn-primary">Log in</button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton /> {/* Replaced span with UserButton */}
              </SignedIn>
            </nav>
          </div>
        </div>
      </header>

      <main>
        <div className="container">
          <section className="hero mb-5" aria-labelledby="title">
            <h1 id="title" className="mb-3">Report local issues. Simple.</h1>
            <p className="text-muted text-large mb-0">
              A single place for residents to alert the municipality about public
              space problems in their neighbourhood.
            </p>
          </section>

          <div className="grid grid-2 mb-5">
            <section className="card" aria-labelledby="what-you-can-do">
              <div className="card-header">
                <h2 id="what-you-can-do" className="card-title">What you can do</h2>
              </div>
              <ul className="mb-0">
                <li>Report broken streetlamps</li>
                <li>Report vandalism and graffiti</li>
                <li>Report fly-tipping and litter problems</li>
                <li>Report road or pavement damage</li>
                <li>Follow up on reports after logging in</li>
              </ul>
            </section>

            <section className="card" aria-labelledby="most-visited">
              <div className="card-header">
                <h2 id="most-visited" className="card-title">Most visited</h2>
              </div>
              <ul className="mb-0">
                <li>Parking information for cars and bicycles</li>
                <li>Service desk: municipal products and services</li>
                <li>Parking permits for residents, visitors, carers, disabled</li>
              </ul>
            </section>
          </div>

          <section className="text-center mb-5" aria-label="Next steps">
            <div className="list-inline">
              <Link href="/about" className="btn btn-secondary">
                About this service
              </Link>
              <SignedOut>
                <SignInButton>
                  <button className="btn btn-primary btn-large">
                    Log in to report
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" className="btn btn-primary btn-large">
                  Go to dashboard
                </Link>
              </SignedIn>
            </div>
            <SignedIn>
              <p className="text-muted text-small mt-3 mb-0">
                You are signed in and ready to report issues.
              </p>
            </SignedIn>
          </section>
        </div>
      </main>

      <footer className="site-footer mt-5">
        <div className="container">
          <div className="grid grid-3 mb-4">
            <div>
              <h3 className="h5 mb-3">Services</h3>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <Link href="/report" className="text-muted">Report an issue</Link>
                </li>
                <li className="mb-2">
                  <Link href="/status" className="text-muted">Check report status</Link>
                </li>
                <li className="mb-2">
                  <Link href="/map" className="text-muted">View area map</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="h5 mb-3">Information</h3>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <Link href="/about" className="text-muted">About this service</Link>
                </li>
                <li className="mb-2">
                  <Link href="/help" className="text-muted">Help & support</Link>
                </li>
                <li className="mb-2">
                  <Link href="/privacy" className="text-muted">Privacy policy</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="h5 mb-3">Contact</h3>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <span className="text-muted">Phone: 14 010</span>
                </li>
                <li className="mb-2">
                  <span className="text-muted">Email: info@rotterdam.nl</span>
                </li>
                <li className="mb-2">
                  <Link href="/contact" className="text-muted">Contact form</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="text-center pt-4" style={{ borderTop: '1px solid var(--border-secondary)' }}>
            <p className="text-muted text-small mb-0">
              © 2025 Municipality of Rotterdam. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}