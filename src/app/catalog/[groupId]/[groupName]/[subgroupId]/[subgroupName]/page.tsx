import { fetchParts } from "@/services/fetchParts";
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

interface Item {
  id: string;
  nsn: string;
  fsg: string;
  fsc: string;
}

export default async function PartsPage(props: {
  params: Promise<{
    groupId: string;
    groupName: string;
    subgroupId: string;
    subgroupName: string;
  }>;
}) {
  const params = await props.params;
  const parts: Item[] = await fetchParts(params.subgroupId);
  const formattedGroupName = decodeURIComponent(
    params.subgroupName.replaceAll("-", " ")
  );

  return (
    <Container maxWidth="xl" sx={{ my: 4 }}>
      {/* Page Title */}
      <Typography
        variant="h4"
        fontWeight="bold"
        textAlign="center"
        gutterBottom
      >
        {formattedGroupName}
      </Typography>

      {/* Full-Screen Table */}
      <TableContainer
        component={Paper}
        sx={{ maxHeight: "70vh", overflowY: "auto", borderRadius: 2 }}
      >
        <Table stickyHeader>
          <TableHead sx={{ backgroundColor: "primary.dark" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>NSN</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>FSG</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>FSC</TableCell>
              <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
                Actions
              </TableCell>
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
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      sx={{ fontWeight: "bold" }}
                    >
                      <Link
                        href={`/catalog/${params.groupId}/${params.groupName}/${params.subgroupId}/${params.subgroupName}/${part.nsn}`}
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

      {/* Back to Categories */}
      <Button variant="outlined" sx={{ mt: 4, display: "block", mx: "auto" }}>
        <Link
          href="/catalog"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          Back to Categories
        </Link>
      </Button>
    </Container>
  );
}
