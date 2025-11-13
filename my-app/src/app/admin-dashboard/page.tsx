'use client';

import React, { useMemo, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';

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

    const displayed = useMemo(() => {
        if (filter === 'all') return alerts;
        return (alerts || []).filter((a: any) => a.status === filter);
    }, [alerts, filter]);

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

                        <div className="mb-3" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <label className="text-muted">Filter status:</label>
                            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                                <option value="all">Alle</option>
                                <option value="open">Open</option>
                                <option value="in_progress">In behandeling</option>
                                <option value="resolved">Opgelost</option>
                            </select>
                        </div>

                        {(displayed || []).length === 0 ? (
                            <p className="text-muted">Geen meldingen gevonden.</p>
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
                                            <th>Notities</th>
                                            <th>Acties</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayed.map((a: any) => (
                                            <AlertRow key={String(a._id)} alert={a} onStatusChange={handleStatusChange} onAddNote={handleAddNote} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </SignedIn>
        </main>
    );
}

    function AdminManager({ admins, onAdd, onRemove }: { admins: any[]; onAdd: (args: any) => Promise<any>; onRemove: (args: any) => Promise<any>; }) {
        const [newAdminEmail, setNewAdminEmail] = useState('');
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
                    <input value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} placeholder="E-mailadres" />
                    <button className="btn btn-secondary" onClick={() => newAdminEmail && onAdd({ email: newAdminEmail }).then(() => setNewAdminEmail(''))}>Toevoegen</button>
                </div>
                <div className="text-tiny text-muted mt-1">Voeg beheerders toe op basis van e-mailadres. Het e-mailadres moet overeenkomen met dat van de gebruiker die inlogt.</div>
            </div>
        );
    }

function AlertRow({ alert, onStatusChange, onAddNote }: { alert: any; onStatusChange: (id: string, s: string) => void; onAddNote: (id: string, text: string, clear: () => void) => void; }) {
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
                                        // eslint-disable-next-line @next/next/no-img-element
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
                              {/* eslint-disable-next-line @next/next/no-img-element */}
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
            <td>
                <select value={alert.status} onChange={(e) => onStatusChange(alert._id as string, e.target.value)}>
                    <option value="open">Open</option>
                    <option value="in_progress">In behandeling</option>
                    <option value="resolved">Opgelost</option>
                </select>
            </td>
            <td style={{ minWidth: 240 }}>
                <div style={{ maxHeight: 90, overflowY: 'auto' }} className="text-small mb-2">
                    {(alert.notes || []).length === 0 ? (
                        <span className="text-muted">Geen notities</span>
                    ) : (
                        <ul className="list-unstyled mb-0">
                            {(alert.notes || []).slice().reverse().map((n: any, idx: number) => (
                                <li key={idx} className="mb-1">
                                    <div>{n.text}</div>
                                    <div className="text-tiny text-muted">{new Date(n.timestamp).toLocaleString()}</div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <input value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Nieuwe notitie" />
                    <button className="btn btn-secondary" onClick={() => onAddNote(alert._id as string, noteText, () => setNoteText(''))}>Toevoegen</button>
                </div>
            </td>
            <td>
                <Link href={`/alerts/${alert._id}`} className="btn btn-link">Details</Link>
            </td>
        </tr>
    );
}