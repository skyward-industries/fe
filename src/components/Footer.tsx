// src/components/Footer.tsx
"use client"; // This makes the entire component a client component

import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import theme from '@/theme'; // Import theme here, safe for client components

export default function Footer() {
  return (
    <Box component="footer" sx={{
      bgcolor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      py: 3,
      textAlign: 'center',
      mt: 'auto' // Pushes footer to bottom of page content
    }}>
      <Typography variant="body2">
        © {new Date().getFullYear()} Skyward Industries, LLC. All rights reserved.
      </Typography>
    </Box>
  );
}