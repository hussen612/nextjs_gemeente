// app/page.tsx
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <h1>Welcome to Next.js 15</h1>
      <p>
        <Link href="/about">About Us</Link>
      </p>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      {/* Example of a protected link */}
      <SignedIn>
        <p>
          <Link href="/dashboard">Go to Dashboard</Link>
        </p>
      </SignedIn>
    </main>
  );
}