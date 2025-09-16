// app/layout.tsx
import './globals.css';
import AppProviders from './providers';

export const metadata = {
  title: 'Gemeente Meldpunt',
  description: 'Report municipality issues',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}