'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function SubmitAlertPage() {
    const [type, setType] = useState('');
    const [description, setDescription] = useState('');``
    const [location, setLocation] = useState('');
    const createAlert = useMutation(api.alerts.createAlert); // Hook to call the Convex mutation
    const { user, isLoaded, isSignedIn } = useUser(); // Get user information from Clerk
}