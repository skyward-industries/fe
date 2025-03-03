import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from "@mui/material";
import Link from "next/link";
import { fetchGroups } from "@/services/fetchGroups"; // Function to fetch groups
import { Group } from "@/types"; // Import Group model

export default async function CatalogPage() {
  const groups: Group[] = await fetchGroups(); // Fetch groups dynamically

  return (
    <Container maxWidth="xl" sx={{ my: 4 }}>
      {/* Page Title */}
      <Typography
        variant="h4"
        fontWeight="bold"
        textAlign="center"
        gutterBottom
      >
        Product Groups
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        textAlign="center"
        gutterBottom
      >
        Explore our diverse range of industry-leading product groups.
      </Typography>

      {/* Full-Screen Table */}
      <TableContainer
        component={Paper}
        sx={{ maxHeight: "70vh", overflowY: "auto", borderRadius: 2 }}
      >
        <Table stickyHeader>
          <TableHead sx={{ backgroundColor: "primary.dark" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                Group Name
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                Description
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", color: "white", textAlign: "center" }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {groups.length > 0 ? (
              groups.map((group) => (
                <TableRow key={group.id} hover>
                  <TableCell>{group.fsg_title}</TableCell>
                  <TableCell>
                    {group.fsc_inclusions
                      ? group.fsc_inclusions
                      : "No description available"}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      sx={{ fontWeight: "bold" }}
                    >
                      <Link
                        href={`/catalog/${group.fsg}/${encodeURIComponent(
                          group.fsg_title.replace(/\s+/g, "-")
                        )}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        View Subgroups
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                  <Typography variant="h6" color="error">
                    No groups found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
