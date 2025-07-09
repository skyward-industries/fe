// src/components/HomePageClient.tsx
'use client'; // THIS IS THE MOST IMPORTANT LINE FOR CLIENT COMPONENTS

// --- Core Imports ---
import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Divider,
  Typography,
  IconButton, // For cart icon
  Badge,      // For cart count
  SxProps,
} from "@mui/material";
// --- End Core Imports ---

// --- External Libraries ---
import NextLink from "next/link"; // For navigation to different pages (e.g., /catalog)
// import Slider from "react-slick"; // The Slider needs to run on the client - COMMENTED OUT FOR DEBUGGING
// import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'; // For dropdown icon - COMMENTED OUT
// import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'; // For cart icon - COMMENTED OUT
// --- End External Libraries ---

// For Smooth Scrolling
import { Link as ScrollLink, scroller, Element } from 'react-scroll';

// --- Utility Imports ---
// @ts-ignore - Keep these if your build process expects them, or remove if not needed
import { capitalizeWords } from "@/utils/capitalizeWords";
// @ts-ignore
import { slugify } from "@/utils/slugify";
// --- End Utility Imports ---

// --- Type Imports ---
// @ts-ignore
import { Group } from "@/services/fetchGroups"; // Assuming Group type is defined here
// --- End Type Imports ---

// --- Configuration Constants ---
// Adjust this offset based on the actual height of your sticky header (NavBar)
// If your NavBar is 64px, use -64. If it's more, adjust accordingly.
const HEADER_OFFSET = -70; // Negative value to adjust for sticky header position
const SCROLL_DURATION = 500; // Duration of the scroll animation in milliseconds

// --- Helper Component for Scrollable Sections ---
// Wraps content with an ID for react-scroll and applies scroll margin/padding
// to account for the sticky header.
interface ScrollableSectionProps {
  id: string; // The unique ID for this scroll target
  children: React.ReactNode;
  title?: string; // Optional title that will be rendered above the content
}

const ScrollableSection: React.FC<ScrollableSectionProps> = ({ id, children, title }) => (
  // Use Element for react-scroll's internal tracking and scroll-spy functionality
  <Element name={id} className="element">
    <Box
      id={id} // Also provide a standard ID for direct access if needed
      sx={{
        // These paddings/margins are crucial for aligning content under a sticky header
        paddingTop: '70px',       // Add space at the top of the content box itself
        scrollMarginTop: '70px',  // Adjust the scroll target position to clear the header
        position: 'relative',     // Often necessary for scrollMarginTop to work reliably
        py: { xs: 4, md: 6 },     // Vertical padding for sections
      }}
    >
      {title && (
        <Typography variant="h2" fontWeight="bold" textAlign="center" gutterBottom sx={{ mb: 4 }}>
          {title}
        </Typography>
      )}
      {children}
    </Box>
  </Element>
);

// --- Main Client Component ---
// This component receives data fetched by a Server Component and renders client-side interactivity.
interface HomePageClientProps {
  groups: Group[]; // Expecting an array of Group objects
}

export default function HomePageClient({ groups }: HomePageClientProps) {

  // --- Local State and Configuration ---
  const includedFsgs = ["61", "31", "43", "60", "29"]; // Example FSGs to display in the slider

  // Helper to map FSG codes to image paths
  const imageGenerator = (fsg: string): string => {
    const imageMap: { [key: string]: string } = {
      "61": "/category-images/61/1.png",
      "31": "/category-images/31/1.png",
      "43": "/category-images/43/1.png",
      "60": "/category-images/60/1.png",
      "29": "/category-images/29/1.png",
    };
    return imageMap[fsg] || "/default-product.jpg"; // Fallback image if FSG not in map
  };

  // react-slick slider settings (COMMENTED OUT FOR DEBUGGING)
  // const settings = { ... };

  // --- Scroll Handlers ---
  // Programmatic scroll to the contact section
  const scrollToContact = () => {
    scroller.scrollTo('section-contact', {
      duration: SCROLL_DURATION,
      delay: 0, // No delay
      smooth: 'easeInOutQuart', // A nice easing function for animation
      offset: HEADER_OFFSET,
    });
  };

  // Handler for scrolling to a specific product group section (COMMENTED OUT)
  // const handleScrollToGroup = (groupId: string, groupTitle?: string) => {
  //   const targetId = `section-group-${slugify(groupTitle || groupId)}`;
  //   scroller.scrollTo(targetId, {
  //     duration: SCROLL_DURATION,
  //     smooth: 'easeInOutQuart',
  //     offset: HEADER_OFFSET,
  //   });
  // };
  // --- End Scroll Handlers ---

  // --- Render JSX ---
  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          backgroundImage: "url('/plane.png')", // Background image
          backgroundSize: "cover",
          backgroundPosition: "center center",
          minHeight: { xs: '60vh', md: '80vh' }, // Responsive height
          display: "flex", alignItems: "center", justifyContent: "center",
          textAlign: "center", color: "white", position: "relative", // For overlay
        }}
      >
        {/* Dark overlay for better text readability */}
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
              display: "flex", flexDirection: { xs: "column", sm: "row" }, // Stack on small screens
              gap: 2, pt: 3, justifyContent: 'center',
            }}
          >
            {/* Button for navigating to a different page */}
            <Button variant="contained" color="primary" size="large" component={NextLink} href="/catalog">
              Browse Products
            </Button>
            <Button variant="outlined" color="primary" size="large" component={NextLink} href="/cart">
              View Cart
            </Button>
            {/* Button that scrolls to contact section */}
            <Button variant="contained" color="error" size="large" onClick={scrollToContact}>
              Create RFQ
            </Button>
          </Box>
        </Container>
      </Box>

      {/* About Section - Wrapped in ScrollableSection for scrolling */}
      <ScrollableSection id="section-about" title="About Skyward Industries">
        <Typography variant="body1" color="textSecondary" textAlign="center" sx={{ maxWidth: 800, mx: "auto", mb: 4 }}>
          {`Skyward Industries was founded by three friends who share a passion
          for aerospace and a deep-rooted connection to the Space Coast. We
          revolutionize how aerospace parts are sourced by offering fast,
          customer-first service and access to a vast network of reliable
          manufacturers. Whether you're a Fortune 500 company or a small
          repair shop, we’re here to help.`}
        </Typography>
      </ScrollableSection>
      <Divider />

      {/* Featured Product Categories Section */}
      <ScrollableSection id="section-featured-categories" title="Featured Product Categories">
        <Container maxWidth="lg">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 4 }}>
            {/* Category 1 */}
            <Card component={NextLink} href="/catalog/61/Electrical%20Wire%20and%20Cable" sx={{ textDecoration: 'none', ':hover': { boxShadow: 6 } }}>
              <CardMedia component="img" height="140" image="/category-images/61/1.png" alt="Electrical Wire and Cable" />
              <CardContent>
                <Typography variant="h6" fontWeight="bold">Electrical Wire & Cable</Typography>
                <Typography variant="body2" color="textSecondary">High-quality wiring and cabling for aerospace and industrial applications.</Typography>
              </CardContent>
            </Card>
            {/* Category 2 */}
            <Card component={NextLink} href="/catalog/31/Bearings" sx={{ textDecoration: 'none', ':hover': { boxShadow: 6 } }}>
              <CardMedia component="img" height="140" image="/category-images/31/1.png" alt="Bearings" />
              <CardContent>
                <Typography variant="h6" fontWeight="bold">Bearings</Typography>
                <Typography variant="body2" color="textSecondary">Precision bearings for critical aerospace and industrial systems.</Typography>
              </CardContent>
            </Card>
            {/* Category 3 */}
            <Card component={NextLink} href="/catalog/43/Pumps%20and%20Compressors" sx={{ textDecoration: 'none', ':hover': { boxShadow: 6 } }}>
              <CardMedia component="img" height="140" image="/category-images/43/1.png" alt="Pumps and Compressors" />
              <CardContent>
                <Typography variant="h6" fontWeight="bold">Pumps & Compressors</Typography>
                <Typography variant="body2" color="textSecondary">Reliable pumps and compressors for demanding environments.</Typography>
              </CardContent>
            </Card>
            {/* Category 4 */}
            <Card component={NextLink} href="/catalog/60/Fittings" sx={{ textDecoration: 'none', ':hover': { boxShadow: 6 } }}>
              <CardMedia component="img" height="140" image="/category-images/60/1.png" alt="Fittings" />
              <CardContent>
                <Typography variant="h6" fontWeight="bold">Fittings</Typography>
                <Typography variant="body2" color="textSecondary">Durable fittings for fluid and air systems in aerospace and industry.</Typography>
              </CardContent>
            </Card>
          </Box>
        </Container>
      </ScrollableSection>
      <Divider />

      {/* Why Choose Us Section */}
      <ScrollableSection id="section-why-choose-us" title="Why Choose Us?">
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, justifyContent: 'center', alignItems: 'stretch' }}>
            {/* Column 1 */}
            <Box sx={{ flex: 1, textAlign: 'center', p: 2 }}>
              <Typography variant="h3" color="primary" sx={{ mb: 2 }}>⚡</Typography>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Fast, Reliable Service</Typography>
              <Typography variant="body2" color="textSecondary">We pride ourselves on rapid response times and dependable delivery, so you can keep your projects moving forward.</Typography>
            </Box>
            {/* Column 2 */}
            <Box sx={{ flex: 1, textAlign: 'center', p: 2 }}>
              <Typography variant="h3" color="primary" sx={{ mb: 2 }}>✅</Typography>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Trusted Quality</Typography>
              <Typography variant="body2" color="textSecondary">All our products are sourced from reputable manufacturers and meet rigorous industry standards.</Typography>
            </Box>
            {/* Column 3 */}
            <Box sx={{ flex: 1, textAlign: 'center', p: 2 }}>
              <Typography variant="h3" color="primary" sx={{ mb: 2 }}>🎧</Typography>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Customer-First Support</Typography>
              <Typography variant="body2" color="textSecondary">Our team is here to help you every step of the way, from product selection to after-sales support.</Typography>
            </Box>
          </Box>
        </Container>
      </ScrollableSection>
      <Divider />

      {/* Product Groups Section (SLIDER AND DYNAMIC SECTIONS ARE COMMENTED OUT) */}
      {/*
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        <Typography variant="h2" fontWeight="bold" textAlign="center" gutterBottom>
          Product Groups
        </Typography>
        <Typography variant="body2" color="textSecondary" textAlign="center" sx={{ mb: 4 }}>
          Explore a few of our most popular product categories below.
        </Typography>
        <Box sx={{ '.slick-slide > div': { px: { xs: 0.5, md: 1 } } }}>
          <Slider {...settings}> // Slider is commented out
            {groups
              .filter((g) => includedFsgs.includes(g.fsg))
              .map((group) => (
                <Box key={group.fsg} sx={{ p: 1 }}>
                  <Card variant="outlined" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                    <CardContent sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
                      <Typography fontWeight="bold" variant="h6" gutterBottom>
                        {capitalizeWords(group.fsg_title)}
                      </Typography>
                      <CardMedia
                        component="img"
                        height="200px"
                        image={imageGenerator(group.fsg)}
                        alt={`Image for ${group.fsg_title}`}
                        sx={{ mb: 2, objectFit: 'contain' }}
                      />
                      <Typography variant="body2" color="textSecondary" sx={{ my: 1, flexGrow: 1, overflowY: "auto" }}>
                        {capitalizeWords(group.description || "")}
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        component={ScrollLink}
                        to={`section-group-${slugify(group.fsg_title || group.fsg)}`}
                        smooth={true}
                        duration={SCROLL_DURATION}
                        offset={HEADER_OFFSET}
                        spy={true}
                        activeClass="active-nav-link"
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
          <Button variant="outlined" component={NextLink} href="/catalog">
            View Full Catalog
          </Button>
        </Box>
      </Container>
      <Divider /> */}

      {/* Dynamic Product Group Sections for Scrolling (COMMENTED OUT) */}
      {/* {groups
        .filter((g) => includedFsgs.includes(g.fsg))
        .map((group) => (
          <ScrollableSection key={group.fsg} id={`section-group-${slugify(group.fsg_title || group.fsg)}`}>
            <Container maxWidth="lg">
              <Typography variant="h3" textAlign="center" gutterBottom>{capitalizeWords(group.fsg_title)} Details</Typography>
              <Typography variant="body1" color="textSecondary" textAlign="center" sx={{ mb: 4 }}>
                More details about the {capitalizeWords(group.fsg_title)} category. This section provides in-depth information, featured parts, and related subcategories.
              </Typography>
            </Container>
          </ScrollableSection>
        ))} */}

      {/* Contact Section - Wrapped in ScrollableSection for scrolling */}
      <ScrollableSection id="section-contact" title="Contact Us">
        <Typography variant="body1" color="textSecondary" textAlign="center">📍 980 Rockledge Blvd, Rockledge FL, 32955</Typography>
        <Typography variant="body1" color="textSecondary" textAlign="center">✉️ Email: admin@skywardparts.com</Typography>
        <Typography variant="body1" color="textSecondary" textAlign="center">📞 Phone: +1 (321) 351-2875</Typography>
      </ScrollableSection>
    </Box>
  );
}