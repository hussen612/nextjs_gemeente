'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import type { Id } from '../../../../convex/_generated/dataModel';
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';
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
  const [location, setLocation] = useState('');
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 0, lng: 0 });
  const [mapZoom, setMapZoom] = useState(8);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isUsingDeviceLoc, setIsUsingDeviceLoc] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Array<{ file: File; previewUrl: string }>>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const createAlert = useMutation(api.alerts.createAlert);
  const generateUploadUrl = useMutation((api as any).files.generateUploadUrl);
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  const { isLoaded: isMapLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: libraries as any,
  });

  useEffect(() => {
    if (navigator.geolocation && isMapLoaded) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newCenter = { lat: latitude, lng: longitude };
          setMapCenter(newCenter);
          setMapZoom(14);
        },
        (error) => {
          console.error("Error getting user's location:", error);
          setMapCenter({ lat: 51.5074, lng: -0.1278 });
          setMapZoom(8);
        }
      );
    } else if (isMapLoaded) {
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

  const geocodeAddressToMarker = useCallback((address: string) => {
    if (!address || !window.google) return;
    setIsGeocoding(true);
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      setIsGeocoding(false);
      if (status === 'OK' && results && results[0]?.geometry?.location) {
        const loc = results[0].geometry.location;
        const lat = loc.lat();
        const lng = loc.lng();
        const pos = { lat, lng };
        setMarkerPosition(pos);
        setMapCenter(pos);
        setMapZoom(15);
        if (!location) setLocation(results[0].formatted_address || address);
      }
    });
  }, [location]);

  const handleManualLocationBlur = () => {
    if (location && !markerPosition) geocodeAddressToMarker(location);
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

    if (!markerPosition) {
      alert('Please pick a location on the map (click or search) before submitting.');
      return;
    }

    try {
      setIsSubmitting(true);
        setUploadError(null);

        const uploadedImages: Array<{ storageId: Id<"_storage">; contentType: string }> = [];
      for (const img of selectedImages) {
        try {
          const postUrl: string = await generateUploadUrl({});
          const res = await fetch(postUrl, {
            method: 'POST',
            headers: { 'Content-Type': img.file.type || 'application/octet-stream' },
            body: img.file,
          });
          if (!res.ok) throw new Error(`Upload failed with ${res.status}`);
          const json = await res.json();
          if (!json?.storageId) throw new Error('No storageId returned');
          uploadedImages.push({ storageId: json.storageId as Id<'_storage'>, contentType: img.file.type || 'application/octet-stream' });
        } catch (err: any) {
          console.error('Image upload failed:', err);
          setUploadError('Een of meer afbeeldingen konden niet worden geüpload. Probeer het opnieuw.');
          setIsSubmitting(false);
          return;
        }
      }

      await createAlert({
        type,
        description,
        location,
        userId: user.id,
        lat: markerPosition.lat,
        lng: markerPosition.lng,
        images: uploadedImages,
      });
      alert('Alert submitted successfully!');
      setType('');
      setDescription('');
      setLocation('');
      setMarkerPosition(null);
      selectedImages.forEach((i) => URL.revokeObjectURL(i.previewUrl));
      setSelectedImages([]);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setMapCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
            setMapZoom(14);
          },
          () => {
            setMapCenter({ lat: 51.924038409199795, lng: 4.4778090834409054 });
            setMapZoom(8);
          }
        );
      } else {
          setMapCenter({ lat: 51.924038409199795, lng: 4.4778090834409054 });
        setMapZoom(8);
      }
    } catch (error) {
      console.error('Failed to submit alert:', error);
      alert('Failed to submit alert. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const useDeviceLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocatie wordt niet ondersteund door deze browser.');
      return;
    }
    setGeoError(null);
    setIsUsingDeviceLoc(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const coords = { lat: latitude, lng: longitude };
        setMarkerPosition(coords);
        setMapCenter(coords);
        setMapZoom(16);
        if (window.google) {
          geocodeLatLng(coords, (addr) => {
            setLocation(addr !== 'Location not found' ? addr : `${latitude},${longitude}`);
          });
        } else {
          setLocation(`${latitude},${longitude}`);
        }
        setIsUsingDeviceLoc(false);
      },
      (err) => {
        console.error('Geolocatie mislukt:', err);
        setGeoError('Kon huidige locatie niet ophalen (toestemming geweigerd of fout).');
        setIsUsingDeviceLoc(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isMapLoaded) return <div>Loading Maps...</div>;

  return (
    <main style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Dashboard: Submit New Alert</h1>

      {!isLoaded ? (
        <p>Loading user data...</p>
      ) : !isSignedIn ? (
          <SignInButton>
                  <button className="btn btn-primary">Inloggen</button>
                </SignInButton>
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
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Foto's toevoegen:</label>
            <div style={{ border: '1px dashed #ccc', borderRadius: 6, padding: 12, background: '#fff' }}>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  const maxFiles = 5;
                  const maxSize = 5 * 1024 * 1024;
                  const next: Array<{ file: File; previewUrl: string }> = [];
                  for (const f of files) {
                    if (!f.type.startsWith('image/')) continue;
                    if (f.size > maxSize) {
                      setUploadError('Afbeeldingen moeten kleiner dan 5MB zijn.');
                      continue;
                    }
                    next.push({ file: f, previewUrl: URL.createObjectURL(f) });
                    if (selectedImages.length + next.length >= maxFiles) break;
                  }
                  setSelectedImages((prev) => [...prev, ...next].slice(0, maxFiles));
                }}
                style={{ display: 'block', marginBottom: 12 }}
              />
              {uploadError && (
                <div style={{ color: '#b00020', fontSize: '0.85rem', marginBottom: 8 }}>{uploadError}</div>
              )}
              {selectedImages.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 12 }}>
                  {selectedImages.map((img, idx) => (
                    <div key={idx} style={{ position: 'relative', border: '1px solid #eee', borderRadius: 6, overflow: 'hidden', background: '#fafafa' }}>
                      <img src={img.previewUrl} alt={`upload-${idx}`} style={{ width: '100%', height: 110, objectFit: 'cover', display: 'block' }} />
                      <button
                        type="button"
                        onClick={() => {
                          URL.revokeObjectURL(img.previewUrl);
                          setSelectedImages((prev) => prev.filter((_, i) => i !== idx));
                        }}
                        className="btn btn-danger"
                        style={{ position: 'absolute', top: 6, right: 6, padding: '4px 8px' }}
                      >
                        Verwijderen
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted" style={{ fontSize: '0.85rem' }}>Je kunt maximaal 5 foto's toevoegen. Ondersteunde types: JPG, PNG, GIF.</div>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="alertLocation" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Location:</label>
            <Autocomplete
              onLoad={(autocomplete) => { autocompleteRef.current = autocomplete; }}
              onPlaceChanged={onPlaceChanged}
            >
              <input
                id="alertLocation"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onBlur={handleManualLocationBlur}
                placeholder="Search for a location"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', marginBottom: '10px' }}
              />
            </Autocomplete>
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
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={useDeviceLocation}
                disabled={isUsingDeviceLoc}
                style={{ padding: '10px 14px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
              >
                {isUsingDeviceLoc ? 'Locatie ophalen…' : 'Gebruik mijn huidige locatie'}
              </button>
              {geoError && <div style={{ color: '#b00020', fontSize: '0.85rem' }}>{geoError}</div>}
              {!markerPosition && !location && (
                <div style={{ fontSize: '0.75rem', color: '#555' }}>Tip: klik op de kaart, zoek een adres, of gebruik je huidige locatie.</div>
              )}
            </div>
          </div>
          <button type="submit" disabled={isSubmitting} style={{ padding: '12px 20px', backgroundColor: isSubmitting ? '#6aa6ff' : '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
            {isSubmitting ? 'Versturen…' : 'Submit Alert'}
          </button>
        </form>
      )}

      <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <Link href="/" style={{ color: '#007bff', textDecoration: 'none' }}>← Back to Home</Link>
      </div>
                 <footer className="site-footer mt-5">
        <div className="container">
          <div className="grid grid-3 mb-4">
            <div>
              <h3 className="h5 mb-3">Contact</h3>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <span className="text-muted">Telefoon: 14 010</span>
                </li>
                <li className="mb-2">
                  <a href="mailto:info@rotterdam.nl" className="text-muted">E-mail: info@rotterdam.nl</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="text-center pt-4" style={{ borderTop: '1px solid var(--border-secondary)' }}>
            <p className="text-muted text-small mb-0">
              © 2025 Gemeente Rotterdam. Alle rechten voorbehouden.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}