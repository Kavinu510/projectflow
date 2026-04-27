import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Toaster } from 'sonner';
import '../styles/tailwind.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'FernFlow — Team Project & Task Management',
  description:
    'FernFlow helps teams manage projects end-to-end — assign tasks, track progress, and ship faster with full visibility into every deadline.',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="antialiased">
      <body>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
