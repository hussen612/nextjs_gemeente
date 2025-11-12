'use client';

import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function SiteHeader() {
  return (
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
  );
}
