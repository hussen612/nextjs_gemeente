import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <h1>Welcome to Next.js 15</h1>
      <p>
        <Link href="/about">
          About Us
        </Link>
      </p>
    </main>
  );
}