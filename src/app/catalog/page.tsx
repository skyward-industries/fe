// src/app/catalog/page.tsx
import React from 'react';
// @ts-ignore
import { fetchGroups, Group } from '@/services/fetchGroups'; // You'll need to update the Group interface
// @ts-ignore
import { capitalizeWords } from '@/utils/capitalizeWords';
// @ts-ignore
import { slugify } from '@/utils/slugify';

// Force dynamic rendering to avoid build-time database access
export const dynamic = 'force-dynamic';
import {
  Container,
  Typography,
  Box,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button
} from '@mui/material';
import Link from 'next/link';
import type { Metadata } from 'next';

// --- SEO: Metadata for this page ---
export const metadata: Metadata = {
  title: 'Product Groups | Skyward Industries Catalog',
  description: 'Explore the main product groups from Skyward Industries. Browse our catalog by Federal Supply Group (FSG) for all your aerospace and defense needs.',
  alternates: {
    canonical: 'https://www.skywardparts.com/catalog',
  },
};

export default async function CatalogPage() {
  let groups: Group[] = [];
  try {
    groups = await fetchGroups(); // Fetches only distinct FSGs now
  } catch (error) {
    console.error('Failed to fetch groups for catalog page:', error);
    // Continue with empty groups array
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Box textAlign="center" mb={{ xs: 4, md: 6 }}>
        <Typography component="h1" variant="h2" fontWeight="bold" gutterBottom>
          Product Groups
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Explore our diverse range of industry-leading product groups.
        </Typography>
      </Box>

      {/* Table Layout */}
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table aria-label="product groups table">
          <TableHead>
            <TableRow sx={{
              // Style the table header to match your dark theme screenshot
              '& .MuiTableCell-head': {
                backgroundColor: 'primary.dark', // Use a dark theme color
                color: 'common.white',
                fontWeight: 'bold',
                fontSize: '1.1rem',
              },
            }}>
              <TableCell>Group Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {groups.map((group, index) => (
              <TableRow
                key={group.fsg}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row" sx={{ fontWeight: '500' }}>
                  {capitalizeWords(group.fsg_title)}
                </TableCell>
                <TableCell>{group.description || 'N/A'}</TableCell>
                <TableCell align="right">
                  <Button
                    variant="contained"
                    component={Link}
                    href={`/catalog/${group.fsg}/${slugify(group.fsg_title || '')}`}
                  >
                    View Subgroups
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}