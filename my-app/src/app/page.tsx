// app/page.tsx
import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function HomePage() { // Renamed for clarity
  return (
    <main style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Welcome to the Government Alert App!</h1>
      <p>Report municipality issues quickly and efficiently.</p>

      <div style={{ marginTop: '23px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignInButton />
        </SignedOut>
      </div>

      <nav style={{ marginTop: '30px' }}>
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <li><Link href="/dashboard" style={{ color: '#007bff', textDecoration: 'none', fontSize: '1.1em' }}>Go to Dashboard</Link></li>
          <li><Link href="/about" style={{ color: '#007bff', textDecoration: 'none', fontSize: '1.1em' }}>About This App</Link></li>
          {/* Add other navigation links as needed */}
        </ul>
      </nav>
    </main>
  );
}