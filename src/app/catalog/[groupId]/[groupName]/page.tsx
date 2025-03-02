import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from "@mui/material";
import Link from "next/link";
import { fetchProducts } from "@/services/fetchProducts";
import { capitalizeWords } from "@/utils/capitalizeWords";

export default async function ProductsPage(props: { params: Promise<{ groupId: string; groupName: string }> }) {
  const params = await props.params;
  const products = await fetchProducts(params.groupId);
  const formattedGroupName = decodeURIComponent(params.groupName.replace("-", " "));

  return (
    <Container maxWidth="xl" sx={{ my: 4 }}>
      {/* Page Title */}
      <Typography variant="h3" fontWeight="bold" textAlign="center" gutterBottom>
        {capitalizeWords(formattedGroupName)}
      </Typography>

      {/* Full-Screen Table */}
      <TableContainer component={Paper} sx={{ maxHeight: "70vh", overflowY: "auto", borderRadius: 2 }}>
        <Table stickyHeader>
          <TableHead sx={{ backgroundColor: "primary.dark" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Product Name</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>NSN</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Part Number</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Manufacturer</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Price</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Availability</TableCell>
              <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.length > 0 ? (
              products.map((product) => (
                <TableRow key={product.id} hover>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.nsn || "N/A"}</TableCell>
                  <TableCell>{product.partNumber || "N/A"}</TableCell>
                  <TableCell>{product.manufacturer || "Unknown"}</TableCell>
                  <TableCell>{product.price || "Contact for Quote"}</TableCell>
                  <TableCell>{product.availability || "In Stock"}</TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <Button variant="contained" color="primary" size="small">
                      <Link href={`/catalog/${params.groupId}/${params.groupName}/${product.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                        View Details
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography variant="h6" color="error">
                    No products found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Back to Categories */}
      <Button variant="outlined" sx={{ mt: 4, display: "block", mx: "auto" }}>
        <Link href="/catalog" style={{ textDecoration: "none", color: "inherit" }}>
          Back to Categories
        </Link>
      </Button>
    </Container>
  );
}
