import type { Metadata, Viewport } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'SOMS - Smart Office Management System',
  description: 'Enterprise-grade AI-powered Smart Office Management Platform',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SOMS",
  },
  formatDetection: {
    telephone: false,
  },
};

import { CommandPalette } from '@/components/command-palette';
import { AICopilot } from '@/components/ai-copilot';
import { OfflineBanner } from '@/components/offline-banner';
import { PwaInstallPrompt } from '@/components/pwa-install-prompt';
import { QueryProvider } from '@/components/query-provider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} font-sans antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            window.deferredPrompt = null;
            window.addEventListener('beforeinstallprompt', (e) => {
              e.preventDefault();
              window.deferredPrompt = e;
              window.dispatchEvent(new Event('deferredpromptready'));
            });
          `
        }} />
      </head>
      <body className="bg-background text-foreground min-h-screen flex flex-col">
        <QueryProvider>
          <OfflineBanner />
          <PwaInstallPrompt />
          {children}
          <CommandPalette />
          <AICopilot />
        </QueryProvider>
      </body>
    </html>
  );
}
