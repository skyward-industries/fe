import { Container, Typography, Button, Box } from "@mui/material";
import Link from "next/link";

export default function Home() {
  console.log(process.env)
  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "85vh",
          textAlign: "center",
        }}
      >
        <Typography variant="h2" color="primary" fontWeight="bold" gutterBottom>
          Welcome to Skyward Industries
        </Typography>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Discover cutting-edge products built for the future.
        </Typography>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 3 }}>
          <Button variant="contained" color="primary" size="large">
            <Link href="/catalog" style={{ color: "inherit", textDecoration: "none" }}>
              Browse Products
            </Link>
          </Button>

          <Button variant="outlined" color="primary" size="large">
            <Link href="/cart" style={{ color: "inherit", textDecoration: "none" }}>
              View Cart
            </Link>
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
