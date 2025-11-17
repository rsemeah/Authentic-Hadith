import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Authentic Hadith',
  description: 'Read, search, and reflect on authentic hadith in a calm, trustworthy experience.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
        <div className="mx-auto max-w-4xl px-4 py-6">{children}</div>
      </body>
    </html>
  );
}
