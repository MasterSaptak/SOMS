import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
      <body className="bg-background text-foreground min-h-screen flex flex-col">
        <OfflineBanner />
        {children}
        <CommandPalette />
        <AICopilot />
      </body>
    </html>
  );
}
