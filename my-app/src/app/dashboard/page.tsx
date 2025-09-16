'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GoogleMap, Marker, useLoadScript, Autocomplete } from '@react-google-maps/api';

const libraries = ['places'];
const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '4px',
};

const alertTypes = [
  'Beschadigde Weg',
  'Overmatige Afval',
  'Graffiti',
  'Putdeksel',
  'Straatlantaarn Storing',
  'Stoplicht Storing',
  'Vandalisme',
  'Verkeersbord Beschadiging',
  'Boomschade',
  'Illegale Dump',
  'Water Lek',
  'Geluidsoverlast',
  'Publieke Veiligheidsrisico',
  'Overig',
];

export default function DashboardPage() {
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(''); // Will store formatted address string
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 0, lng: 0 }); // Default initial center
  const [mapZoom, setMapZoom] = useState(8);

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const createAlert = useMutation(api.alerts.createAlert);
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  const { isLoaded: isMapLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: libraries as any, // Type assertion for libraries
  });

  // Geolocation for initial map center
  useEffect(() => {
    if (navigator.geolocation && isMapLoaded) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newCenter = { lat: latitude, lng: longitude };
          setMapCenter(newCenter);
          setMapZoom(14); // Zoom in on current location
        },
        (error) => {
          console.error("Error getting user's location:", error);
          // Default to a general location if geolocation fails (e.g., London)
          setMapCenter({ lat: 51.5074, lng: -0.1278 });
          setMapZoom(8);
        }
      );
    } else if (isMapLoaded) {
      // Geolocation not supported or map not loaded yet, default to a general location
      setMapCenter({ lat: 51.5074, lng: -0.1278 });
      setMapZoom(8);
    }
  }, [isMapLoaded]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setMarkerPosition({ lat, lng });
      geocodeLatLng({ lat, lng }, setLocation);
    }
  }, []);

  const onMarkerDragEnd = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setMarkerPosition({ lat, lng });
      geocodeLatLng({ lat, lng }, setLocation);
    }
  }, []);

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const newPosition = { lat, lng };
        setMarkerPosition(newPosition);
        setMapCenter(newPosition);
        setMapZoom(15);
        if (place.formatted_address) {
          setLocation(place.formatted_address);
        }
      } else {
        console.error('Place has no geometry or location:', place);
      }
    }
  };

  const geocodeLatLng = (latLng: { lat: number; lng: number }, callback: (address: string) => void) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        callback(results[0].formatted_address);
      } else {
        console.error('Geocoder failed due to: ' + status);
        callback('Location not found');
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded || !isSignedIn || !user?.id) {
      alert('You must be logged in to submit an alert. Redirecting to sign in.');
      router.push('/sign-in');
      return;
    }

    if (!location) {
      alert('Please select a location on the map or search for an address.');
      return;
    }

    try {
      await createAlert({
        type,
        description,
        location, // Formatted address string
        userId: user.id,
      });
      alert('Alert submitted successfully!');
      setType('');
      setDescription('');
      setLocation('');
      setMarkerPosition(null); // Clear marker after submission
      // Reset map to initial state or default
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setMapCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
            setMapZoom(14);
          },
          () => {
            setMapCenter({ lat: 51.5074, lng: -0.1278 }); // London default
            setMapZoom(8);
          }
        );
      } else {
        setMapCenter({ lat: 51.5074, lng: -0.1278 }); // London default
        setMapZoom(8);
      }
    } catch (error) {
      console.error('Failed to submit alert:', error);
      alert('Failed to submit alert. Please try again.');
    }
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isMapLoaded) return <div>Loading Maps...</div>;

  return (
    <main style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Dashboard: Submit New Alert</h1>

      {!isLoaded ? (
        <p>Loading user data...</p>
      ) : !isSignedIn ? (
        <p>Please <Link href="/sign-in">sign in</Link> to submit an alert.</p>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px', backgroundColor: '#f9f9f9', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div>
            <label htmlFor="alertType" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Alert Type:</label>
            <select
              id="alertType"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
            >
              <option value="" disabled>Select an alert type</option>
              {alertTypes.map((alertType) => (
                <option key={alertType} value={alertType}>
                  {alertType}
                </option>
              ))}
            </select>
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
            {/* Google Maps Autocomplete Input */}
            <Autocomplete
              onLoad={(autocomplete) => { autocompleteRef.current = autocomplete; }}
              onPlaceChanged={onPlaceChanged}
            >
              <input
                id="alertLocation"
                type="text"
                value={location} // Display the selected formatted address
                onChange={(e) => setLocation(e.target.value)} // Allows manual typing, but onPlaceChanged overrides
                placeholder="Search for a location"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', marginBottom: '10px' }}
              />
            </Autocomplete>
            {/* Google Map Component */}
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={mapCenter}
              zoom={mapZoom}
              onLoad={onMapLoad}
              onClick={onMapClick}
              options={{ disableDefaultUI: true, zoomControl: true }}
            >
              {markerPosition && (
                <Marker
                  position={markerPosition}
                  draggable={true}
                  onDragEnd={onMarkerDragEnd}
                />
              )}
            </GoogleMap>
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