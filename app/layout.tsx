import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AetherHub - Anti-Gravity Collaborative Workspace',
  description: 'Zero-gravity file ingestion, real-time QR generation, and ambient productivity micro-tools integrated with Supabase.',
  keywords: ['file sharing', 'qr code generator', 'anti-gravity', 'supabase', 'nextjs', 'productivity'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="min-h-screen bg-space-950 text-slate-100 antialiased selection:bg-violet-glow/40 selection:text-white">
        {children}
      </body>
    </html>
  );
}
