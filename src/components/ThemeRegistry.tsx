// src/components/ThemeRegistry.tsx
"use client"; // This directive makes this a Client Component

import * as React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
// @ts-ignore
import theme from '@/theme'; // Import your theme here
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter'; // Keep this for caching

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ key: 'css' }}>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kicks off an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}