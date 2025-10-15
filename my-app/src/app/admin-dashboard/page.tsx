// my-app/src/app/admin-dashboard/page.tsx

export const metadata = {
    title: 'Admin Dashboard',
    description: 'Administrative overview for Gemeente Meldpunt',
};

export default function AdminDashboardPage() {
    return (
        <main style={{ padding: '1.5rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Admin Dashboard
            </h1>
            <p style={{ color: '#555', marginBottom: '1.5rem' }}>
                Manage reports and monitor system status. Content coming soon.
            </p>

            <section
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '1rem',
                }}
            >
                <div
                    style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: 8,
                        padding: '1rem',
                        background: '#fff',
                    }}
                >
                    <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                        Overview
                    </h2>
                    <p style={{ color: '#666' }}>Placeholder for key metrics.</p>
                </div>

                <div
                    style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: 8,
                        padding: '1rem',
                        background: '#fff',
                    }}
                >
                    <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                        Recent Activity
                    </h2>
                    <p style={{ color: '#666' }}>Placeholder for latest alerts and actions.</p>
                </div>
            </section>
        </main>
    );
}