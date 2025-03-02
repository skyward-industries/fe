import { Container, Typography, Button, Box } from "@mui/material";
import Link from "next/link";

export default async function Home() {
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
        <Typography variant="h2" color="primary" gutterBottom>
          Welcome to Skyward Industries
        </Typography>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Discover cutting-edge products built for the future.
        </Typography>
        <Button variant="contained" color="primary" size="large" sx={{ mt: 3 }}>
          <Link href="/catalog" style={{ color: "inherit", textDecoration: "none" }}>
            Browse Products
          </Link>
        </Button>
      </Box>
    </Container>
  );
}
