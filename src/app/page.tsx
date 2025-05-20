"use client";

import Head from "next/head";
import { useEffect, useState } from "react";
import { fetchGroups, Group } from "@/services/fetchGroups";
import { slugify } from "@/utils/slugify";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Grid,
  Divider,
} from "@mui/material";
import Link from "next/link";

export default function Home() {
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    fetchGroups().then(setGroups);
  }, []);

  return (
    <Box sx={{ height: "100vh", overflowY: "scroll" }}>
      <Head>
        <title>Skyward Industries | Aerospace & Industrial Supply</title>
        <meta
          name="description"
          content="Discover cutting-edge aerospace and industrial products at Skyward Industries. Browse our catalog and request a quote today."
        />
        <link rel="canonical" href="https://www.skywardparts.com/" />
      </Head>

      <Box sx={{ overflowY: "auto" }}>
        <Box
          sx={{
            backgroundImage: "url('/plane.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            minHeight: "100vh",
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
            }}
          />
          <Container
            maxWidth="lg"
            sx={{
              position: "relative",
              pt: 4,
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              height: "100vh",
            }}
          >
            <Typography variant="h2" fontWeight="bold" gutterBottom>
              Welcome to Skyward Industries
            </Typography>
            <Typography variant="h5" sx={{ color: "#ccc" }} gutterBottom>
              Discover cutting-edge products built for the future.
            </Typography>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 3 }}
            >
              <Button
                variant="contained"
                color="primary"
                size="large"
                component={Link}
                href="/catalog"
              >
                Browse Products
              </Button>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                component={Link}
                href="/cart"
              >
                View Cart
              </Button>
              <Button
                variant="contained"
                color="error"
                size="large"
                component={Link}
                href="/cart"
              >
                Create RFQ
              </Button>
            </Box>
          </Container>
        </Box>

        <Container maxWidth="md" sx={{ py: 2 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            textAlign="center"
            gutterBottom
          >
            About Skyward Industries
          </Typography>
          <Typography
            variant="body1"
            color="textSecondary"
            textAlign="center"
            sx={{ maxWidth: 800, mx: "auto" }}
          >
            {`Skyward Industries was founded by three friends who share a passion
            for aerospace and a deep-rooted connection to the Space Coast. We
            revolutionize how aerospace parts are sourced by offering fast,
            customer-first service and access to a vast network of reliable
            manufacturers. Whether you're a Fortune 500 company or a small
            repair shop, we’re here to help.`}
          </Typography>
        </Container>
        <Divider />

        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            textAlign="center"
            gutterBottom
          >
            Product Groups
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            textAlign="center"
            sx={{ mb: 4 }}
          >
            Explore a few of our most popular product categories below.
          </Typography>
          <Grid container spacing={3}>
            {groups.slice(0, 6).map((group) => (
              <Grid item xs={12} sm={6} md={4} key={group.id}>
                <Card variant="outlined" sx={{ height: "100%" }}>
                  <CardContent
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      flexDirection: "column",
                      height: "100%",
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      {group.fsg_title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ my: 1 }}
                    >
                      {group.fsc_inclusions || ""}
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      component={Link}
                      href={`/catalog/${group.fsg}/${slugify(group.fsg_title)}`}
                    >
                      View Subgroups
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box textAlign="center" py={2}>
            <Button variant="outlined" component={Link} href="/catalog">
              View Full Catalog
            </Button>
          </Box>
        </Container>
        <Divider />
        <Container maxWidth="sm" sx={{ textAlign: "center", py: 2 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Contact Us
          </Typography>
          <Typography variant="body1" color="textSecondary">
            📍 449 Blakey Blvd, Cocoa Beach, FL 32931
          </Typography>
          <Typography variant="body1" color="textSecondary">
            ✉️ Email: admin@skywardparts.com
          </Typography>
          <Typography variant="body1" color="textSecondary">
            📞 Phone: +1 (321) 427-9292
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
