// app/dashboard/page.tsx
'use client'; // Essential directive

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const createAlert = useMutation(api.alerts.createAlert);
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded || !isSignedIn || !user?.id) {
      alert('You must be logged in to submit an alert. Redirecting to sign in.');
      router.push('/sign-in');
      return;
    }

    try {
      await createAlert({
        type,
        description,
        location,
        userId: user.id,
      });
      alert('Alert submitted successfully!');
      setType('');
      setDescription('');
      setLocation('');
    } catch (error) {
      console.error('Failed to submit alert:', error);
      alert('Failed to submit alert. Please try again.');
    }
  };

  return (
    <main style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Dashboard: Submit New Alert</h1> {/* This must be different from About page */}

      {!isLoaded ? (
        <p>Loading user data...</p>
      ) : !isSignedIn ? (
        <p>Please <Link href="/sign-in">sign in</Link> to submit an alert.</p>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px', backgroundColor: '#f9f9f9', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div>
            <label htmlFor="alertType" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Alert Type:</label>
            <input
              id="alertType"
              type="text"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
              placeholder="e.g., Damaged Road, Excessive Garbage"
            />
          </div>
          <div>
            <label htmlFor="alertDescription" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Description:</label>
            <textarea
              id="alertDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={6}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
              placeholder="Provide detailed information about the issue."
            />
          </div>
          <div>
            <label htmlFor="alertLocation" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Location:</label>
            <input
              id="alertLocation"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
              placeholder="e.g., Street name, Intersection, Coordinates"
            />
          </div>
          <button type="submit" style={{ padding: '12px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
            Submit Alert
          </button>
        </form>
      )}

      <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <Link href="/" style={{ color: '#007bff', textDecoration: 'none' }}>← Back to Home</Link>
      </div>
    </main>
  );
}