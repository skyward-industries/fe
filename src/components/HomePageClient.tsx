// src/components/HomePageClient.tsx
"use client"; // THIS IS THE MOST IMPORTANT LINE
// @ts-ignore
import { capitalizeWords } from "@/utils/capitalizeWords";
// @ts-ignore
import { slugify } from "@/utils/slugify";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Divider,
  Typography,
} from "@mui/material";
import Slider from "react-slick"; // The Slider needs to run on the client

import Link from "next/link";
// @ts-ignore
import { Group } from "@/services/fetchGroups"; // Import the Group type

// The props this component will receive from its parent (the Server Component)
interface HomePageClientProps {
  groups: Group[];
}

export default function HomePageClient({ groups }: HomePageClientProps) {
  // We no longer need useState or useEffect to fetch data.
  // The 'groups' data is passed in directly as a prop.

  const includedFsgs = ["61", "31", "43", "60", "29"]; // Example FSGs for the slider
  const imageGenerator = (fsg: string): string => {
    const imageMap: { [key: string]: string } = {
      "61": "/category-images/61/1.png",
      "31": "/category-images/31/1.png",
      "43": "/category-images/43/1.png",
      "60": "/category-images/60/1.png",
      "29": "/category-images/29/1.png",
    };
    return imageMap[fsg] || "/default-product.jpg";
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
        { breakpoint: 1024, settings: { slidesToShow: 2 } },
        { breakpoint: 600, settings: { slidesToShow: 1, arrows: false } }
    ]
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          backgroundImage: "url('/plane.png')",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          minHeight: { xs: '60vh', md: '80vh' },
          display: "flex", alignItems: "center", justifyContent: "center",
          textAlign: "center", color: "white", position: "relative", 
        }}
      >
        <Box sx={{ position: "absolute", inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)' }}/>
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Typography variant="h2" fontWeight="bold" gutterBottom>
            Welcome to Skyward Industries
          </Typography>
          <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.9)' }} gutterBottom>
            Discover cutting-edge products built for the future.
          </Typography>
          <Box
            sx={{
              display: "flex", flexDirection: { xs: "column", sm: "row" },
              gap: 2, pt: 3, justifyContent: 'center',
            }}
          >
            <Button variant="contained" color="primary" size="large" component={Link} href="/catalog">Browse Products</Button>
            <Button variant="outlined" color="primary" size="large" component={Link} href="/cart">View Cart</Button>
            <Button variant="contained" color="error" size="large" component={Link} href="/cart">Create RFQ</Button>
          </Box>
        </Container>
      </Box>

      {/* About Section */}
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Typography variant="h2" fontWeight="bold" textAlign="center" gutterBottom sx={{ mb: 4 }}>
          About Skyward Industries
        </Typography>
        <Typography variant="body1" color="textSecondary" textAlign="center" sx={{ maxWidth: 800, mx: "auto", mb: 4 }}>
          {`Skyward Industries was founded by three friends who share a passion
          for aerospace and a deep-rooted connection to the Space Coast. We
          revolutionize how aerospace parts are sourced by offering fast,
          customer-first service and access to a vast network of reliable
          manufacturers. Whether you're a Fortune 500 company or a small
          repair shop, we’re here to help.`}
        </Typography>
      </Container>
      <Divider />

      {/* Product Groups Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        <Typography variant="h2" fontWeight="bold" textAlign="center" gutterBottom>
          Product Groups
        </Typography>
        <Typography variant="body2" color="textSecondary" textAlign="center" sx={{ mb: 4 }}>
          Explore a few of our most popular product categories below.
        </Typography>
        <Box sx={{ '.slick-slide > div': { px: { xs: 0.5, md: 1 } } }}>
          <Slider {...settings}>
            {groups
              .filter((g) => includedFsgs.includes(g.fsg))
              .map((group) => (
                <Box key={group.fsg} sx={{ p: 1 }}>
                  {/* NOTE: I've corrected the group properties to match your 'getGroups' query from earlier */}
                  <Card variant="outlined" sx={{ height: "100%" }}>
                    <CardContent sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                      <Typography fontWeight="bold" variant="h6" gutterBottom>
                        {capitalizeWords(group.fsg_title)}
                      </Typography>
                      <CardMedia component="img" height="200px" image={imageGenerator(group.fsg)} alt={`Image for ${group.fsg_title}`} sx={{ mb: 2, objectFit: 'contain' }} />
                      <Typography variant="body2" color="textSecondary" sx={{ my: 1, height: 80, overflowY: "auto" }}>
                        {capitalizeWords(group.description || "")}
                      </Typography>
                      <Button
                        variant="contained" color="primary" fullWidth component={Link}
                        href={`/catalog/${group.fsg}/${slugify(group.fsg_title || '')}`}
                        sx={{ mt: 'auto' }}
                      >
                        View Group
                      </Button>
                    </CardContent>
                  </Card>
                </Box>
              ))}
          </Slider>
        </Box>
        <Box textAlign="center" py={2}>
          <Button variant="outlined" component={Link} href="/catalog">
            View Full Catalog
          </Button>
        </Box>
      </Container>
      <Divider />

      {/* Contact Section */}
      <Container maxWidth="sm" sx={{ textAlign: "center", py: { xs: 4, md: 6 } }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Contact Us
        </Typography>
        <Typography variant="body1" color="textSecondary">📍 980 Rockledge Blvd, Rockledge FL, 32955</Typography>
        <Typography variant="body1" color="textSecondary">✉️ Email: admin@skywardparts.com</Typography>
        <Typography variant="body1" color="textSecondary">📞 Phone: +1 (321) 351-2875</Typography>
      </Container>
    </Box>
  );
}