import Head from "next/head";
import { Container, Typography, Button, Box } from "@mui/material";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Head>
        <title>Skyward Industries | Aerospace & Industrial Supply</title>
        <meta
          name="description"
          content="Discover cutting-edge aerospace and industrial products at Skyward Industries. Browse our catalog and request a quote today."
        />
        <link rel="canonical" href="https://www.skywardparts.com/" />
      </Head>

      <Box
        sx={{
          backgroundImage: "url('/plane.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: "white",
          position: "relative",
          px: 2,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        />

        <Container
          maxWidth="lg"
          sx={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography variant="h2" fontWeight="bold" gutterBottom>
            Welcome to Skyward Industries
          </Typography>
          <Typography variant="h5" sx={{ color: "#ccc" }} gutterBottom>
            Discover cutting-edge products built for the future.
          </Typography>
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
            <Button component={Link} href="/cart" variant="outlined" color="error">
              Create RFQ
            </Button>
          </Box>
        </Container>
      </Box>
    </>
  );
}
