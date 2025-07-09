// src/app/search/page.tsx
// This is a Server Component that displays search results.
import React from 'react';
// @ts-ignore
import { fetchPartInfo, Part } from "@/services/fetchPartInfo";
// @ts-ignore
import { slugify } from '@/utils/slugify';
import {
  Box,
  Container,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
  Divider
} from "@mui/material";
import Link from "next/link";

// This page reads searchParams from the URL (e.g., /search?nsn=1234)
export default async function SearchResultsPage({
  searchParams,
}: {
  searchParams: { nsn?: string; part_number?: string }; // Can handle nsn or part_number searches
}) {
  const query = searchParams.nsn || searchParams.part_number;

  if (!query) {
    return (
      <Container maxWidth="md" sx={{ my: 4, textAlign: "center" }}>
        <Typography variant="h4" fontWeight="bold">Search Parts</Typography>
        <Typography variant="body1" color="textSecondary">
          Please enter an NSN or Part Number in the search bar above to begin.
        </Typography>
      </Container>
    );
  }

  // We use fetchPartInfo, assuming it can also find parts by NSN or part number.
  // Your backend API at /api/nsn-parts/[query] should handle this.
  const parts: Part[] = await fetchPartInfo(query);

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Search Results for: "{query}"
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Found {parts.length} result(s).
      </Typography>

      <Paper variant="outlined">
        <List disablePadding>
          {parts.length === 0 ? (
            <ListItem>
              <ListItemText
                primary="No results found."
                secondary="Please check your search term and try again."
              />
            </ListItem>
          ) : (
            parts.map((part, index) => (
              <React.Fragment key={part.part_number || `part-${index}`}>
                <ListItem
                  button
                  component={Link}
                  // IMPORTANT: This link goes to your *actual* NSN detail page
                  // You might need to adjust the link format if your catalog structure is different
                  href={`/catalog/${part.fsg}/${slugify(part.fsg_title || '')}/${part.fsc}/${slugify(part.fsc_title || '')}/nsn-${part.nsn}`}
                >
                  <ListItemText
                    primary={`Part Number: ${part.part_number?.toUpperCase() || 'N/A'}`}
                    secondary={`NSN: ${part.nsn} | Company: ${part.company_name || 'N/A'}`}
                  />
                </ListItem>
                {index < parts.length - 1 && <Divider />}
              </React.Fragment>
            ))
          )}
        </List>
      </Paper>
    </Container>
  );
}