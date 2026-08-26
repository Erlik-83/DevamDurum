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
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DevamDurum',
  },
};

import { SecurityPinGate } from '@/components/auth/SecurityPinGate';
import { ChangePinModal } from '@/components/auth/ChangePinModal';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="bg-slate-50 text-slate-900 min-h-screen antialiased" suppressHydrationWarning>
        <SecurityPinGate>
          <AppLayout>{children}</AppLayout>
          <ChangePinModal />
        </SecurityPinGate>
        <InstallPwaPrompt />
      </body>
    </html>
  );
}
