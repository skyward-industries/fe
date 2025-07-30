// src/app/catalog/[groupId]/[groupName]/[subgroupId]/[subgroupName]/page.tsx
// FINAL, ROBUST SERVER COMPONENT

import { fetchParts, Part, PartResponse } from "@/services/fetchParts";
import PartsPagination from "@/components/PartsPagination";
import {
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { ArrowLeft } from "@mui/icons-material";

// Define the properties this page component will receive from Next.js
type PageProps = {
  params: {
    groupId: string;
    groupName: string;
    subgroupId: string;
    subgroupName: string;
  };
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
};

// This is the main page component. It's async, so it can 'await' data fetching.
export default async function PartsPage({ params, searchParams }: PageProps) {
  const { groupId, groupName, subgroupId, subgroupName } = params;

  // Safely parse the page number from the URL, defaulting to 1
  const page = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1;
  const limit = 100;

  let parts: Part[] = [];
  let totalPages = 1;
  let fetchError = false;

  // Fetch data within a try...catch block for maximum safety
  try {
    const response: PartResponse = await fetchParts(subgroupId, page, limit);
    
    // Safety Check: Ensure the 'data' property is actually an array before using it
    if (Array.isArray(response.data)) {
      parts = response.data;
      totalPages = response.pagination.totalPages;
    } else {
      console.error("API did not return a valid data array for subgroup:", subgroupId);
      fetchError = true;
    }
  } catch (error) {
    console.error("Failed to fetch parts on the server for subgroup:", subgroupId, error);
    fetchError = true;
  }

  // Safely format the title, ensuring it never fails even if subgroupName is undefined
  const formattedGroupName = (subgroupName || '')
    .replaceAll("-", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

  // If the data fetch failed completely, show a clear error message
  if (fetchError) {
    return (
      <Container maxWidth="xl" sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error">
          Could not load parts information. Please try again later.
        </Typography>
      </Container>
    );
  }

  // Render the page with the data
  return (
    <Container maxWidth="xl" sx={{ my: 4 }}>
      <Button
        variant="outlined"
        sx={{ mb: 2, fontWeight: "bold" }}
        startIcon={<ArrowLeft />}
        component={Link}
        href={`/catalog/${groupId}/${groupName}/`}
      >
        Back to Group
      </Button>

      <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
        {formattedGroupName}
      </Typography>

      <TableContainer component={Paper} sx={{ maxHeight: "70vh", overflowY: "auto", borderRadius: 2 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>NSN</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>FSG Title</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>FSC Title</TableCell>
              <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {parts.length > 0 ? (
              parts.map((part) => (
                <TableRow key={part.id} hover>
                  <TableCell>{part.nsn}</TableCell>
                  {/* Safe, inline formatting. Will not crash. */}
                  <TableCell>{(part.fsg_title || part.fsg || '').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}</TableCell>
                  <TableCell>{(part.fsc_title || part.fsc || '').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}</TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      component={Link}
                      href={`/catalog/${groupId}/${groupName}/${subgroupId}/${subgroupName}/${part.nsn}`}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                  <Typography variant="h6" color="text.secondary">
                    No parts found for this subgroup.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* The Pagination component is a separate Client Component */}
      <PartsPagination totalPages={totalPages} />
    </Container>
  );
}