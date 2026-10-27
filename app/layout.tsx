import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ครอบครัว กำลังพล กองพลทหารช่าง',
  description: 'ระบบสารสนเทศ บริการไฟล์ QR Code และการประสานงาน ครอบครัว กำลังพล กองพลทหารช่าง',
  keywords: ['กองพลทหารช่าง', 'ครอบครัว กำลังพล กองพลทหารช่าง', 'ทหารช่าง', 'ระบบกำลังพล', 'qr code'],
  icons: {
    icon: [
      { url: '/icon.png' },
      { url: '/logo.png' },
    ],
    shortcut: '/icon.png',
    apple: '/apple-icon.png',
  },
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
