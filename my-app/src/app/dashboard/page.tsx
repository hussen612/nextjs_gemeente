'use client';


import { useRouter } from 'next/navigation';
import React from 'react';
import { GoogleMap, Marker, useLoadScript, Autocomplete } from '@react-google-maps/api';
import UserMap from '../../components/UserMap';

export default function DashboardPage() {
  return <UserMap />;
}

