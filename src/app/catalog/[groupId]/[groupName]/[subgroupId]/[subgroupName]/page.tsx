"use client"; // Ensures this runs on the client-side
import { useState, useEffect, use } from "react";
import { fetchParts, Part } from "@/services/fetchParts";
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
  Pagination,
  CircularProgress,
  Box,
} from "@mui/material";
import Link from "next/link";

export default function PartsPage(props: {
  params: Promise<{ groupId: string; groupName: string; subgroupId: string; subgroupName: string }>;
}) {
  const { groupId, groupName, subgroupId, subgroupName } = use(props.params);
  const [parts, setParts] = useState<Part[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const limit = 100;

  useEffect(() => {
    const loadParts = async () => {
      setLoading(true);
      try {
        const response = await fetchParts(subgroupId, page, limit);
        setParts(response.data);
        setTotalPages(response.pagination.totalPages);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadParts();
  }, [subgroupId, page]);

  const formattedGroupName = decodeURIComponent(
    subgroupName.replace("nsn-", "").replace("NSN-")?.replaceAll("-", " ")
  ).replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <Container maxWidth="xl" sx={{ my: 4 }}>
      <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
        {formattedGroupName}
      </Typography>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ maxHeight: "70vh", overflowY: "auto", borderRadius: 2 }}>
            <Table stickyHeader>
              <TableHead sx={{ backgroundColor: "primary.dark" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>NSN</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>FSG</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>FSC</TableCell>
                  <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {parts.length > 0 ? (
                  parts.map((part) => (
                    <TableRow key={part.id} hover>
                      <TableCell>{part.nsn}</TableCell>
                      <TableCell>{part.fsg}</TableCell>
                      <TableCell>{part.fsc}</TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        <Button variant="contained" color="primary" size="small" sx={{ fontWeight: "bold" }}>
                          <Link
                            href={`/catalog/${groupId}/${groupName}/${subgroupId}/${subgroupName}/nsn-${part.nsn}`}
                            style={{ textDecoration: "none", color: "inherit" }}
                          >
                            View Details
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      <Typography variant="h6" color="error">
                        No parts found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(event, value) => setPage(value)}
            color="primary"
            sx={{ mt: 3, display: "flex", justifyContent: "center" }}
          />

          <Button variant="outlined" sx={{ mt: 4, display: "block", mx: "auto" }}>
            <Link href="/catalog" style={{ textDecoration: "none", color: "inherit" }}>
              Back to Categories
            </Link>
          </Button>
        </>
      )}
    </Container>
  );
}
