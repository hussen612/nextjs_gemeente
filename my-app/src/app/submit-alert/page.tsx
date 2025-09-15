'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function SubmitAlertPage() {
    const [type, setType] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const createAlert = useMutation(api.alerts.createAlert); // Hook to call the Convex mutation
    const { user, isLoaded, isSignedIn } = useUser(); // Get user information from Clerk

    return (
        <div>
            <h1>Submit an Alert</h1>
            <form
                onSubmit={async (e) => {
                    e.preventDefault();
                    if (!isSignedIn) {
                        alert('You must be signed in to submit an alert.');
                        return;
                    }
                    await createAlert({ type, description, location, userId: user.id });
                    setType('');
                    setDescription('');
                    setLocation('');
                    alert('Alert submitted!');
                }}
            >
                <div>
                    <label>
                        Type:
                        <input
                            type="text"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            required
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Description:
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Location:
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required
                        />
                    </label>
                </div>
                <button type="submit">Submit Alert</button>
            </form>
            <p>
                Back to <Link href="/">home</Link>
            </p>
        </div>
    );
}