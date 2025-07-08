// src/components/Breadcrumbs.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Breadcrumbs as MuiBreadcrumbs, Typography } from '@mui/material';
import { Home } from '@mui/icons-material';

// Helper to capitalize words
const capitalizeWords = (str: string) => {
  return str.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  if (!pathname.startsWith('/catalog')) {
    return null; // Don't show on non-catalog pages
  }

  const pathSegments = pathname.split('/').filter(segment => segment);
  
  // Create breadcrumb items from URL segments
  const breadcrumbItems = pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/');
    const isLast = index === pathSegments.length - 1;
    let label = capitalizeWords(decodeURIComponent(segment));

    // For the NSN, we can format it specially
    if (pathSegments[0] === 'catalog' && index === pathSegments.length - 1 && segment.match(/\d{4}-?\d{2}-?\d{3}-?\d{4}/)) {
      label = `NSN: ${segment}`;
    }

    return { href, label, isLast };
  });

  return (
    <MuiBreadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
        <Home sx={{ mr: 0.5, fontSize: 'inherit' }} />
        Home
      </Link>
      {breadcrumbItems.map((item) =>
        item.isLast ? (
          <Typography key={item.href} color="text.primary">
            {item.label}
          </Typography>
        ) : (
          <Link key={item.href} href={item.href} style={{ textDecoration: 'none', color: 'inherit' }}>
            {item.label}
          </Link>
        )
      )}
    </MuiBreadcrumbs>
  );
}