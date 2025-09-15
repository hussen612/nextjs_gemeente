// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'Government Alert App',
  description: 'Report municipality issues',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {/* Global header/footer can live inside Providers or outside */}
          <header style={{ backgroundColor: '#f0f0f0', padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
            <p>Global Header</p>
          </header>
          {children}
          <footer style={{ backgroundColor: '#f0f0f0', padding: '10px', textAlign: 'center', borderTop: '1px solid #ddd', marginTop: '40px' }}>
            <p>&copy; 2025 Government Alert App</p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}