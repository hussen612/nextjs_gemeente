'use client';

import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

function getStatusLabel(status: string): string {
    const statusMap: Record<string, string> = {
        'open': 'Open',
        'in_progress': 'In behandeling',
        'resolved': 'Opgelost'
    };
    return statusMap[status] || status;
}

export default function AdminDashboardPage() {
        const amAdminClerk = useQuery((api as any).admin.isAdminClerk);
        const amAdminTable = useQuery((api as any).admin.isAdmin);
            const alerts = useQuery((api as any).alerts.getAllAlerts) || [];
    const updateStatus = useMutation((api as any).alerts.updateAlertStatus);
    const addNote = useMutation((api as any).alerts.addAlertNote);
        const admins = useQuery((api as any).admin.listAdmins) || [];
            const hasAnyAdmin = useQuery((api as any).admin.hasAnyAdmin);
        const addAdmin = useMutation((api as any).admin.addAdmin);
        const removeAdmin = useMutation((api as any).admin.removeAdmin);

    const [filter, setFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
    const fullAlert = useQuery(
        (api as any).alerts.getAlertById,
        selectedAlertId !== null ? { id: selectedAlertId as any } : "skip"
    ) as any;
    const { isLoaded: mapLoaded, loadError: mapLoadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    });
    const isAdmin = !!(amAdminClerk || amAdminTable);
    const imageIdsForModal = useMemo(() => (fullAlert?.images || []).map((i: any) => i.storageId), [fullAlert]);
    const modalImagePairs = useQuery((api as any).files.getImageUrls, isAdmin && imageIdsForModal.length > 0 ? { storageIds: imageIdsForModal } : "skip") || [];
    const modalUrlMap: Record<string, string> = useMemo(() => {
        const m: Record<string, string> = {};
        for (const p of modalImagePairs) if (p?.url) m[p.id] = p.url;
        return m;
    }, [modalImagePairs]);
    const [modalLightboxUrl, setModalLightboxUrl] = useState<string | null>(null);
    const [modalNoteText, setModalNoteText] = useState('');

    const displayed = useMemo(() => {
        let filtered = alerts;
        
        if (filter !== 'all') {
            filtered = filtered.filter((a: any) => a.status === filter);
        }
        
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((a: any) => 
                (a.type || '').toLowerCase().includes(query) ||
                (a.description || '').toLowerCase().includes(query) ||
                (a.location || '').toLowerCase().includes(query)
            );
        }
        
        return filtered;
    }, [alerts, filter, searchQuery]);

    const mapMarkers = useMemo(() => {
        return (displayed || [])
            .map((alert: any) => {
                const lat = alert.lat;
                const lng = alert.lng;
                if (lat == null || lng == null) return null;
                return {
                    id: String(alert._id),
                    lat,
                    lng,
                    type: alert.type,
                    status: alert.status,
                };
            })
            .filter(Boolean) as Array<{ id: string; lat: number; lng: number; type: string; status: string }>;
    }, [displayed]);

    const mapCenter = useMemo(() => {
        if (mapMarkers.length > 0) {
            return { lat: mapMarkers[0].lat, lng: mapMarkers[0].lng };
        }
        return { lat: 51.9244, lng: 4.4777 };
    }, [mapMarkers]);

    const handleStatusChange = async (id: string, status: string) => {
        try {
            await updateStatus({ id: id as any, status });
        } catch (e) {
            console.error(e);
            alert('Kon status niet bijwerken');
        }
    };

    const handleAddNote = async (id: string, text: string, clear: () => void) => {
        if (!text.trim()) return;
        try {
            await addNote({ id: id as any, text });
            clear();
        } catch (e) {
            console.error(e);
            alert('Kon notitie niet toevoegen');
        }
    };

    return (
        <>
        <main className="container p-4">
            <h1 className="h3 mb-3">Admin Dashboard</h1>
            <p className="text-muted mb-4">Beheer meldingen: pas status aan en voeg notities toe.</p>

            <SignedOut>
                <div className="card p-3">
                    <p className="mb-3">Je moet zijn ingelogd om dit te bekijken.</p>
                    <SignInButton>
                        <button className="btn btn-primary">Inloggen</button>
                    </SignInButton>
                </div>
            </SignedOut>

            <SignedIn>
                {amAdminClerk === undefined && amAdminTable === undefined && (
                    <div className="card p-3"><p>Autorisatie controleren…</p></div>
                )}
                {amAdminClerk === false && amAdminTable === false && (
                    <div className="card p-3">
                        <h2 className="h5 mb-2">Geen toegang</h2>
                        <p className="text-muted mb-3">Je bent niet gemachtigd om deze pagina te bekijken.</p>
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <Link href="/" className="btn btn-secondary">Terug naar home</Link>
                                                    {hasAnyAdmin === false && (
                                                        <Link href="/admin-bootstrap" className="btn btn-primary">Eerste beheerder instellen</Link>
                                                    )}
                                                </div>
                    </div>
                )}
                {(amAdminClerk || amAdminTable) && (
                    <>
                        <section className="card p-3 mb-4">
                            <h2 className="h5 mb-3">Beheerders</h2>
                            <AdminManager admins={admins} onAdd={addAdmin} onRemove={removeAdmin} />
                        </section>

                        <section className="card p-3 mb-4">
                            <h2 className="h5 mb-3">Meldingenkaart</h2>
                            {mapLoadError && (
                                <p className="text-danger">Fout bij laden van Google Maps.</p>
                            )}
                            {!mapLoadError && !mapLoaded && (
                                <p>Kaart laden…</p>
                            )}
                            {mapLoaded && (
                                <div style={{ width: '100%', height: 360, borderRadius: 12, overflow: 'hidden' }}>
                                    <GoogleMap
                                        mapContainerStyle={{ width: '100%', height: '100%' }}
                                        center={mapCenter}
                                        zoom={12}
                                        options={{ mapTypeControl: false }}
                                    >
                                        {mapMarkers.map((marker) => (
                                            <Marker
                                                key={marker.id}
                                                position={{ lat: marker.lat, lng: marker.lng }}
                                                title={marker.type}
                                                onClick={() => {
                                                    setSelectedAlertId(marker.id);
                                                    setModalNoteText('');
                                                }}
                                            />
                                        ))}
                                    </GoogleMap>
                                </div>
                            )}
                            {mapMarkers.length === 0 && mapLoaded && !mapLoadError && (
                                <p className="text-muted mt-2">Geen meldingen met coördinaten binnen de huidige filters.</p>
                            )}
                        </section>

                        <div className="mb-3" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{ flex: '1 1 300px' }}>
                                <input 
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Zoek op type, beschrijving of locatie..."
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <label className="text-muted" style={{ whiteSpace: 'nowrap' }}>Status:</label>
                                <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                                    <option value="all">Alle</option>
                                    <option value="open">Open</option>
                                    <option value="in_progress">In behandeling</option>
                                    <option value="resolved">Opgelost</option>
                                </select>
                            </div>
                            {(searchQuery || filter !== 'all') && (
                                <button 
                                    className="btn btn-secondary btn-small"
                                    onClick={() => { setSearchQuery(''); setFilter('all'); }}
                                >
                                    Wis filters
                                </button>
                            )}
                        </div>

                        {(displayed || []).length === 0 ? (
                            <p className="text-muted">
                                {searchQuery || filter !== 'all' 
                                    ? 'Geen meldingen gevonden met de huidige filters.' 
                                    : 'Geen meldingen gevonden.'}
                            </p>
                        ) : (
                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Melding</th>
                                            <th>Locatie</th>
                                            <th>Datum</th>
                                            <th>Afbeeldingen</th>
                                            <th>Status</th>
                                            <th>Acties</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayed.map((a: any) => (
                                            <AlertRow key={String(a._id)} alert={a} onStatusChange={handleStatusChange} onAddNote={handleAddNote} onOpenDetails={(id) => { setSelectedAlertId(id); setModalNoteText(''); }} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </SignedIn>
        </main>
        {(selectedAlertId && fullAlert) && (
            <AlertDetailsModal
                alert={fullAlert}
                onClose={() => { setSelectedAlertId(null); setModalLightboxUrl(null); }}
                onStatusChange={handleStatusChange}
                onAddNote={handleAddNote}
                noteText={modalNoteText}
                setNoteText={setModalNoteText}
                imageUrlMap={modalUrlMap}
                onOpenImage={(url) => setModalLightboxUrl(url)}
            />
        )}
        {modalLightboxUrl && (
            <div onClick={() => setModalLightboxUrl(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div onClick={(e) => e.stopPropagation()} style={{ background: '#000', padding: 12, borderRadius: 8, maxWidth: '90vw', maxHeight: '90vh' }}>
                    <img src={modalLightboxUrl} alt="foto" style={{ maxWidth: '88vw', maxHeight: '80vh', objectFit: 'contain', display: 'block' }} />
                    <div style={{ textAlign: 'right', marginTop: 8 }}>
                        <button className="btn btn-secondary" onClick={() => setModalLightboxUrl(null)}>Sluiten</button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
}

    function AdminManager({ admins, onAdd, onRemove }: { admins: any[]; onAdd: (args: any) => Promise<any>; onRemove: (args: any) => Promise<any>; }) {
        const [newAdminEmail, setNewAdminEmail] = useState('');
        const [errorMessage, setErrorMessage] = useState<string | null>(null);
        const [isAdding, setIsAdding] = useState(false);
        const checkUserExists = useAction((api as any).admin.checkUserExists);

        const handleAddAdmin = async () => {
            if (!newAdminEmail.trim()) return;
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(newAdminEmail)) {
                setErrorMessage('Voer een geldig e-mailadres in.');
                return;
            }

            setIsAdding(true);
            try {
                const userCheck = await checkUserExists({ email: newAdminEmail });
                
                if (userCheck.error) {
                    setErrorMessage(userCheck.error);
                    setIsAdding(false);
                    return;
                }
                
                if (!userCheck.exists) {
                    setErrorMessage(`Gebruiker met e-mailadres "${newAdminEmail}" bestaat niet in het systeem. Zorg ervoor dat de gebruiker zich eerst heeft geregistreerd.`);
                    setIsAdding(false);
                    return;
                }

                await onAdd({ email: newAdminEmail });
                setNewAdminEmail('');
                setErrorMessage(null);
            } catch (error: any) {
                console.error('Error adding admin:', error);
                setErrorMessage(error.message || 'Kon beheerder niet toevoegen. Probeer het opnieuw.');
            } finally {
                setIsAdding(false);
            }
        };

        return (
            <div>
                {(admins || []).length === 0 ? (
                    <p className="text-muted">Nog geen beheerders.</p>
                ) : (
                    <ul className="list-unstyled mb-3">
                        {admins.map((a: any) => (
                            <li key={String(a._id)} className="mb-2" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <span className="text-small">{a.email}</span>
                                <button className="btn btn-danger btn-small" onClick={() => onRemove({ email: a.email })}>Verwijderen</button>
                            </li>
                        ))}
                    </ul>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                    <input 
                        value={newAdminEmail} 
                        onChange={(e) => setNewAdminEmail(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && handleAddAdmin()}
                        placeholder="E-mailadres" 
                        disabled={isAdding}
                    />
                    <button 
                        className="btn btn-secondary" 
                        onClick={handleAddAdmin}
                        disabled={isAdding || !newAdminEmail.trim()}
                    >
                        {isAdding ? 'Toevoegen...' : 'Toevoegen'}
                    </button>
                </div>
                <div className="text-tiny text-muted mt-1">Voeg beheerders toe op basis van e-mailadres. Het e-mailadres moet overeenkomen met dat van de gebruiker die inlogt.</div>
                
                {errorMessage && (
                    <div 
                        onClick={() => setErrorMessage(null)} 
                        style={{ 
                            position: 'fixed', 
                            inset: 0, 
                            background: 'rgba(0,0,0,0.6)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            zIndex: 3000 
                        }}
                    >
                        <div 
                            onClick={(e) => e.stopPropagation()} 
                            style={{ 
                                background: '#fff', 
                                padding: 24, 
                                borderRadius: 12, 
                                maxWidth: 480, 
                                boxShadow: '0 8px 32px rgba(0,0,0,0.3)' 
                            }}
                        >
                            <h3 className="h5 mb-3" style={{ color: '#dc3545' }}>Fout bij toevoegen beheerder</h3>
                            <p className="text-small mb-4">{errorMessage}</p>
                            <div style={{ textAlign: 'right' }}>
                                <button 
                                    className="btn btn-primary" 
                                    onClick={() => setErrorMessage(null)}
                                >
                                    Sluiten
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

function AlertRow({ alert, onStatusChange, onAddNote, onOpenDetails }: { alert: any; onStatusChange: (id: string, s: string) => void; onAddNote: (id: string, text: string, clear: () => void) => void; onOpenDetails: (id: string) => void; }) {
    const [noteText, setNoteText] = useState('');
    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
    const imageIds = useMemo(() => (alert.images || []).map((i: any) => i.storageId), [alert]);
    const imagePairs = useQuery((api as any).files.getImageUrls, { storageIds: imageIds }) || [];
    const urlMap: Record<string, string> = useMemo(() => {
        const m: Record<string, string> = {};
        for (const p of imagePairs) if (p?.url) m[p.id] = p.url;
        return m;
    }, [imagePairs]);
    return (
        <tr>
            <td>
                <div className="fw-600">{alert.type}</div>
                <div className="text-small text-muted" style={{ maxWidth: 360, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{alert.description}</div>
                <div className="text-tiny"><Link href={`/alerts/${alert._id}`}>Bekijk</Link></div>
            </td>
            <td className="text-small">{alert.location}</td>
            <td className="text-small">{new Date(alert.timestamp).toLocaleString()}</td>
            <td style={{ minWidth: 180 }}>
                {(alert.images || []).length === 0 ? (
                    <span className="text-muted text-small">Geen</span>
                ) : (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {(alert.images || []).slice(0, 4).map((img: any, idx: number) => {
                            const url = urlMap[String(img.storageId)] as string | undefined;
                            return (
                                <button key={idx} type="button" onClick={() => url && setLightboxUrl(url)} style={{ display: 'block', width: 56, height: 56, borderRadius: 6, overflow: 'hidden', background: '#f2f2f2', border: '1px solid #eee', padding: 0, cursor: url ? 'pointer' : 'default' }}>
                                    {url ? (
                                        <img src={url} alt="bijlage" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                    ) : (
                                        <div className="text-tiny text-muted" style={{ padding: 6, textAlign: 'center' }}>Laden…</div>
                                    )}
                                </button>
                            );
                        })}
                        {(alert.images || []).length > 4 && (
                            <span className="text-tiny text-muted">+{(alert.images || []).length - 4} meer</span>
                        )}
                        {lightboxUrl && (
                          <div onClick={() => setLightboxUrl(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                            <div onClick={(e) => e.stopPropagation()} style={{ background: '#000', padding: 8, borderRadius: 8, maxWidth: '90vw', maxHeight: '90vh' }}>
                              <img src={lightboxUrl} alt="bijlage" style={{ maxWidth: '88vw', maxHeight: '85vh', display: 'block', objectFit: 'contain' }} />
                              <div style={{ textAlign: 'right', marginTop: 8 }}>
                                <button className="btn btn-secondary" onClick={() => setLightboxUrl(null)}>Sluiten</button>
                              </div>
                            </div>
                          </div>
                        )}
                    </div>
                )}
            </td>
            <td className="text-small">{getStatusLabel(alert.status)}</td>
            <td>
                                <button type="button" className="btn btn-link" onClick={() => onOpenDetails(String(alert._id))}>Details</button>
            </td>
        </tr>
    );
}

function AlertDetailsModal({ alert, onClose, onStatusChange, onAddNote, noteText, setNoteText, imageUrlMap, onOpenImage }: {
    alert: any; onClose: () => void; onStatusChange: (id: string, status: string) => void; onAddNote: (id: string, text: string, clear: () => void) => void;
    noteText: string; setNoteText: (t: string) => void; imageUrlMap: Record<string,string>; onOpenImage: (url: string) => void;
}) {
    if (!alert) return null;
    return (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '60px 24px', zIndex: 2000 }}>
            <div style={{ width: '100%', maxWidth: 880, background: '#fff', borderRadius: 12, boxShadow: '0 6px 24px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', overflow: 'hidden', maxHeight: 'calc(100vh - 120px)' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className="h5 mb-0">Melding Details</h2>
                    <button className="btn btn-secondary" onClick={onClose}>Sluiten</button>
                </div>
                <div style={{ padding: 20, display: 'grid', gap: 24, overflowY: 'auto' }}>
                    <section>
                        <h3 className="h6 mb-2">Algemeen</h3>
                        <div className="text-small"><strong>Type:</strong> {alert.type}</div>
                        <div className="text-small"><strong>Beschrijving:</strong> {alert.description}</div>
                        <div className="text-small"><strong>Locatie:</strong> {alert.location}</div>
                        <div className="text-small"><strong>Datum:</strong> {new Date(alert.timestamp).toLocaleString()}</div>
                        <div className="text-small"><strong>Status:</strong> {getStatusLabel(alert.status)}</div>
                    </section>
                    {(alert.lat != null && alert.lng != null) && (
                        <section>
                            <h3 className="h6 mb-2">Locatie op kaart</h3>
                            <div style={{ width: '100%', height: 280, borderRadius: 8, overflow: 'hidden', border: '1px solid #eee' }}>
                                        <iframe
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${alert.lat},${alert.lng}&zoom=15`}
                                    allowFullScreen
                                />
                            </div>
                        </section>
                    )}
                    <section>
                        <h3 className="h6 mb-2">Status bijwerken</h3>
                        <select value={alert.status} onChange={(e) => onStatusChange(alert._id as string, e.target.value)}>
                            <option value="open">Open</option>
                            <option value="in_progress">In behandeling</option>
                            <option value="resolved">Opgelost</option>
                        </select>
                    </section>
                    <section>
                        <h3 className="h6 mb-2">Foto's</h3>
                        {(alert.images || []).length === 0 ? (
                            <p className="text-muted text-small mb-0">Geen afbeeldingen</p>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))', gap: 12 }}>
                                {(alert.images || []).map((img: any, idx: number) => {
                                    const url = imageUrlMap[String(img.storageId)];
                                    return (
                                        <button key={idx} type="button" onClick={() => url && onOpenImage(url)} style={{ padding: 0, border: '1px solid #eee', background: '#fafafa', borderRadius: 8, overflow: 'hidden', cursor: url ? 'pointer' : 'default' }}>
                                            {url ? <img src={url} alt={`img-${idx}`} style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} /> : (
                                                <div className="text-tiny text-muted" style={{ padding: 10, textAlign: 'center' }}>Laden…</div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                    <section>
                        <h3 className="h6 mb-2">Notities</h3>
                        <div style={{ maxHeight: 180, overflowY: 'auto', marginBottom: 12, paddingRight: 4 }}>
                            {(alert.notes || []).length === 0 ? (
                                <p className="text-muted text-small mb-0">Nog geen notities.</p>
                            ) : (
                                <ul className="list-unstyled mb-0">
                                    {(alert.notes || []).slice().reverse().map((n: any, idx: number) => (
                                        <li key={idx} className="mb-2">
                                            <div className="text-small">{n.text}</div>
                                            <div className="text-tiny text-muted">{new Date(n.timestamp).toLocaleString()}</div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <input value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Nieuwe notitie" />
                            <button className="btn btn-secondary" onClick={() => noteText.trim() && onAddNote(alert._id as string, noteText, () => setNoteText(''))}>Toevoegen</button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

