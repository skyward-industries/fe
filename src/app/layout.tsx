// src/app/layout.tsx
// This is a Server Component by default.

import * as React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
// Import your wrapper/provider components
import ThemeRegistry from '@/components/ThemeRegistry';
import { SelectionProvider } from '@/context/SelectionContext';

// Import your global UI components
import Navbar from '@/components/NavBar';
import Footer from '@/components/Footer'; // Import the dedicated Footer component

// Import global styles
import './globals.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const inter = Inter({ subsets: ['latin'], display: 'swap' });

// Define metadata for SEO (replaces next/head)
export const metadata: Metadata = {
  title: 'Skyward Industries | Innovative Aerospace & Industrial Supply',
  description: 'Skyward Industries provides innovative aerospace and industrial solutions. Discover cutting-edge products, browse our catalog, and request a quote today for your defense and commercial needs.',
  keywords: ['Skyward Industries', 'aerospace', 'industrial', 'components', 'propulsion', 'manufacturing', 'supply', 'RFQ', 'defense', 'commercial', 'military parts'],
  applicationName: 'Skyward Industries',
  openGraph: {
    title: 'Skyward Industries - Aerospace & Industrial Supply',
    description: 'Cutting-edge products for aerospace and industrial sectors. Your trusted partner for military and industrial parts.',
    url: 'https://www.skywardparts.com', // Your domain
    siteName: 'Skyward Industries',
    images: [
      {
        url: 'https://www.skywardparts.com/images/skyward-logo-social.jpg', // Your social sharing image
        width: 1200,
        height: 630,
        alt: 'Skyward Industries Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Skyward Industries',
    description: 'Aerospace & Industrial Supply Experts',
    images: ['https://www.skywardparts.com/images/twitter-share-image.jpg'], // Your Twitter sharing image
    creator: '@yourtwitterhandle', // IMPORTANT: Replace with your actual Twitter handle
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('Layout Component: Rendering on server.');
  return (
    <html lang="en" className={inter.className}>
      <body>
        {/* ThemeRegistry is a client component and handles the theme instantiation */}
        <ThemeRegistry>
          <SelectionProvider>
            <Navbar />
            <main style={{ minHeight: 'calc(100vh - 128px)', display: 'flex', flexDirection: 'column' }}> {/* Adjusted height for footer */}
              {children}
            </main>
            <Footer /> {/* Use the imported Footer client component */}
          </SelectionProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}