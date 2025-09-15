// app/page.tsx
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <html>
        <body>
      <h1>Welcome to Next.js 15</h1>
      <p>
        <Link href="/about">About Us</Link>
      </p>
      <ClerkProvider>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <SignInButton />
      </SignedOut>
  
      <SignedIn>
        <p>
          <Link href="/dashboard">Go to Dashboard</Link>
        </p>
      </SignedIn>
      </ClerkProvider>
        </body>
            </html>
    </main>
  

  );
}