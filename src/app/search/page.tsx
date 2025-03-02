import { Container, Typography, Card, CardContent, Alert, Button } from "@mui/material";
import Link from "next/link";
import { fetchProductById } from "@/services/fetchProductById";

export default async function SearchPage({ searchParams }: { searchParams: { query?: string } }) {
  if (!searchParams.query) {
    return (
      <Container maxWidth="md" sx={{ my: 4, textAlign: "center" }}>
        <Typography variant="h4" fontWeight="bold">Search Products</Typography>
        <Typography variant="body1" color="textSecondary">Enter a product ID in the search bar above.</Typography>
      </Container>
    );
  }

  try {
    // Step 1: Fetch product by ID (now includes groupId)
    const product = await fetchProductById(searchParams.query);

    if (!product) {
      throw new Error("Product not found");
    }

    return (
      <Container maxWidth="md" sx={{ my: 4 }}>
        <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
          Search Results
        </Typography>

        <Card sx={{ mt: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h5" fontWeight="bold">{product.name}</Typography>
            <Typography color="textSecondary">NSN: {product.nsn}</Typography>
            <Typography>Price: {product.price}</Typography>
            <Typography>Manufacturer: {product.manufacturer}</Typography>

            {/* Dynamic Link to Product Detail Page */}
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              component={Link}
              href={`/catalog/${product.groupId}/product/${product.id}`} // Now uses product.groupId dynamically
            >
              View Product
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  } catch (error) {
    return (
      <Container maxWidth="md" sx={{ my: 4, textAlign: "center" }}>
        <Typography variant="h4" fontWeight="bold">Search Results</Typography>
        <Alert severity="error" sx={{ mt: 3 }}>No product found with ID "{searchParams.query}".</Alert>
      </Container>
    );
  }
}
