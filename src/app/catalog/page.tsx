import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from "@mui/material";
import Link from "next/link";
import { fetchGroups } from "@/services/fetchGroups";

export default async function CatalogPage() {
  const categories = await fetchGroups();

  return (
    <Container maxWidth="xl" sx={{ my: 4 }}>
      {/* Page Title */}
      <Typography variant="h3" fontWeight="bold" textAlign="center" gutterBottom>
        Product Categories
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" textAlign="center" gutterBottom>
        Explore our diverse range of industry-leading product categories.
      </Typography>

      {/* Full-Screen Table */}
      <TableContainer component={Paper} sx={{ maxHeight: "70vh", overflowY: "auto", borderRadius: 2 }}>
        <Table stickyHeader>
          <TableHead sx={{ backgroundColor: "primary.dark" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>Category Name</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>Description</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>Total Products</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.length > 0 ? (
              categories.map((category) => (
                <TableRow key={category.id} hover>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.description}</TableCell>
                  <TableCell>{category.totalProducts}</TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <Button variant="contained" color="primary" size="small">
                      <Link href={`/catalog/${category.id}/${category.name.toLowerCase().replace(/\s+/g, "-")}`} style={{ textDecoration: "none", color: "inherit" }}>
                        View Products
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                  <Typography variant="h6" color="error">
                    No categories found.
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
