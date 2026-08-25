import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppLayout } from '@/components/layout/AppLayout';
import { InstallPwaPrompt } from '@/components/layout/InstallPwaPrompt';

export const viewport: Viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'DevamDurum PRO - Okul Öğretmen Devam & İkame Takip Sistemi',
  description: 'Öğretmen devam-devamsızlık, geç gelme ve ders doldurma (ikame) yönetim platformu',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DevamDurum',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="bg-slate-50 text-slate-900 min-h-screen antialiased">
        <AppLayout>{children}</AppLayout>
        <InstallPwaPrompt />
      </body>
    </html>
  );
}
