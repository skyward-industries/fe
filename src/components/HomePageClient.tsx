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
  IconButton,
  Badge,
  Grid,
  Chip,
  SxProps,
} from "@mui/material";
// --- End Core Imports ---

// --- External Libraries ---
import NextLink from "next/link"; // For navigation to different pages (e.g., /catalog)
import Slider from "react-slick"; // The Slider needs to run on the client
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';
import SupportIcon from '@mui/icons-material/Support';
import InventoryIcon from '@mui/icons-material/Inventory';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
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
const HEADER_OFFSET = -80; // Negative value to adjust for sticky header position
const SCROLL_DURATION = 500; // Duration of the scroll animation in milliseconds

// --- Helper Component for Scrollable Sections ---
interface ScrollableSectionProps {
  id: string; // The unique ID for this scroll target
  children: React.ReactNode;
  title?: string; // Optional title that will be rendered above the content
}

const ScrollableSection: React.FC<ScrollableSectionProps> = ({ id, children, title }) => (
  <Element name={id} className="element">
    <Box
      id={id}
      sx={{
        paddingTop: '80px',
        scrollMarginTop: '80px',
        position: 'relative',
        py: { xs: 4, md: 6 },
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

  // react-slick slider settings
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };

  // --- Scroll Handlers ---
  const scrollToContact = () => {
    scroller.scrollTo('section-contact', {
      duration: SCROLL_DURATION,
      delay: 0,
      smooth: 'easeInOutQuart',
      offset: HEADER_OFFSET,
    });
  };

  // Services data
  const services = [
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Fast Delivery',
      description: 'Quick turnaround times on all orders with expedited shipping options available.'
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Quality Assurance',
      description: 'All parts undergo rigorous quality checks and come with certification documentation.'
    },
    {
      icon: <SupportIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: '24/7 Support',
      description: 'Round-the-clock customer support to help with your aerospace and defense needs.'
    },
    {
      icon: <InventoryIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Vast Inventory',
      description: 'Access to millions of parts through our extensive network of trusted suppliers.'
    }
  ];

  // Industry stats
  const stats = [
    { value: '50K+', label: 'Parts Available' },
    { value: '500+', label: 'Trusted Suppliers' },
    { value: '24/7', label: 'Customer Support' },
    { value: '99.9%', label: 'Quality Rate' }
  ];

  // --- Render JSX ---
  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          backgroundImage: "url('/plane.png')",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          minHeight: { xs: '70vh', md: '85vh' },
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          textAlign: "center", 
          color: "white", 
          position: "relative",
        }}
      >
        <Box sx={{ position: "absolute", inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}/>
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Typography variant="h1" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
            Welcome to Skyward Industries
          </Typography>
          <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.95)', mb: 1 }}>
            Your Trusted Partner for Aerospace & Defense Components
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)', mb: 4, maxWidth: 600, mx: 'auto' }}>
            Discover cutting-edge products built for the future. From military-grade components to commercial aerospace parts, we deliver excellence.
          </Typography>
          <Box
            sx={{
              display: "flex", 
              flexDirection: { xs: "column", sm: "row" },
              gap: 2, 
              pt: 2, 
              justifyContent: 'center',
            }}
          >
            <Button 
              variant="contained" 
              color="primary" 
              size="large" 
              component={NextLink} 
              href="/catalog"
              sx={{ px: 4, py: 1.5 }}
            >
              Browse Catalog
            </Button>
            <Button 
              variant="outlined" 
              size="large" 
              component={NextLink} 
              href="/cart"
              sx={{ 
                px: 4, 
                py: 1.5,
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              View Cart
            </Button>
            <Button 
              variant="contained" 
              color="error" 
              size="large" 
              onClick={scrollToContact}
              sx={{ px: 4, py: 1.5 }}
            >
              Request Quote
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ backgroundColor: 'primary.main', color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="center">
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index} textAlign="center">
                <Typography variant="h3" fontWeight="bold" sx={{ color: 'white' }}>
                  {stat.value}
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  {stat.label}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* About Section */}
      <ScrollableSection id="section-about" title="About Skyward Industries">
        <Container maxWidth="md">
          <Typography variant="h6" color="textSecondary" textAlign="center" sx={{ mb: 4, lineHeight: 1.8 }}>
            Founded by three friends with a passion for aerospace and deep connections to the Space Coast, 
            Skyward Industries revolutionizes how aerospace parts are sourced. We offer fast, customer-first 
            service and access to a vast network of reliable manufacturers.
          </Typography>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Chip 
              label="Space Coast Based" 
              sx={{ mr: 1, mb: 1 }} 
              color="primary" 
              variant="outlined" 
            />
            <Chip 
              label="Fortune 500 Trusted" 
              sx={{ mr: 1, mb: 1 }} 
              color="primary" 
              variant="outlined" 
            />
            <Chip 
              label="Military Grade" 
              sx={{ mr: 1, mb: 1 }} 
              color="primary" 
              variant="outlined" 
            />
          </Box>
        </Container>
      </ScrollableSection>

      <Divider />

      {/* Services Section */}
      <ScrollableSection id="section-services" title="Why Choose Skyward Industries">
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {services.map((service, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                  <CardContent>
                    <Box sx={{ mb: 2 }}>
                      {service.icon}
                    </Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {service.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {service.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </ScrollableSection>

      <Divider />

      {/* Product Groups Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Typography variant="h2" fontWeight="bold" textAlign="center" gutterBottom>
          Featured Product Categories
        </Typography>
        <Typography variant="h6" color="textSecondary" textAlign="center" sx={{ mb: 6 }}>
          Explore our most popular product categories
        </Typography>
        <Box sx={{ '.slick-slide > div': { px: { xs: 0.5, md: 1 } } }}>
          <Slider {...settings}>
            {groups
              .filter((g) => includedFsgs.includes(g.fsg))
              .map((group) => (
                <Box key={group.fsg} sx={{ p: 1 }}>
                  <Card variant="outlined" sx={{ height: "400px", display: "flex", flexDirection: "column" }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={imageGenerator(group.fsg)}
                      alt={`Image for ${group.fsg_title}`}
                      sx={{ objectFit: 'contain', p: 2 }}
                    />
                    <CardContent sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
                      <Typography fontWeight="bold" variant="h6" gutterBottom>
                        {capitalizeWords(group.fsg_title)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2, flexGrow: 1 }}>
                        {capitalizeWords(group.description || "")}
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        component={NextLink}
                        href={`/catalog/${group.fsg}/${slugify(group.fsg_title || group.fsg)}`}
                        sx={{ mt: 'auto' }}
                      >
                        View Category
                      </Button>
                    </CardContent>
                  </Card>
                </Box>
              ))}
          </Slider>
        </Box>
        <Box textAlign="center" py={4}>
          <Button 
            variant="outlined" 
            size="large" 
            component={NextLink} 
            href="/catalog"
            sx={{ px: 4 }}
          >
            View Full Catalog
          </Button>
        </Box>
      </Container>

      <Divider />

      {/* Features Section */}
      <Box sx={{ backgroundColor: 'background.default', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h2" fontWeight="bold" textAlign="center" gutterBottom sx={{ mb: 6 }}>
            What Sets Us Apart
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', mb: 3 }}>
                <CheckCircleIcon sx={{ color: 'success.main', mr: 2, mt: 0.5 }} />
                <Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Certified Quality
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    All parts come with proper documentation and certifications meeting military and aerospace standards.
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', mb: 3 }}>
                <CheckCircleIcon sx={{ color: 'success.main', mr: 2, mt: 0.5 }} />
                <Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Competitive Pricing
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Direct relationships with manufacturers allow us to offer competitive pricing without compromising quality.
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex' }}>
                <CheckCircleIcon sx={{ color: 'success.main', mr: 2, mt: 0.5 }} />
                <Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Expert Support
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Our team of aerospace experts helps you find the exact parts you need for your specific applications.
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 4, textAlign: 'center', height: '100%' }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Ready to Get Started?
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                  Whether you're a Fortune 500 company or a small repair shop, we're here to help with all your aerospace and defense component needs.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large" 
                  onClick={scrollToContact}
                  sx={{ mb: 2 }}
                >
                  Get Quote Now
                </Button>
                <Typography variant="body2" color="textSecondary">
                  Or call us at +1 (321) 351-2875
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Contact Section */}
      <ScrollableSection id="section-contact" title="Contact Us">
        <Container maxWidth="md">
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} sm={4} textAlign="center">
              <Typography variant="h6" fontWeight="bold" gutterBottom>📍 Location</Typography>
              <Typography variant="body1" color="textSecondary">
                980 Rockledge Blvd<br />
                Rockledge, FL 32955
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4} textAlign="center">
              <Typography variant="h6" fontWeight="bold" gutterBottom>✉️ Email</Typography>
              <Typography variant="body1" color="textSecondary">
                admin@skywardparts.com
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4} textAlign="center">
              <Typography variant="h6" fontWeight="bold" gutterBottom>📞 Phone</Typography>
              <Typography variant="body1" color="textSecondary">
                +1 (321) 351-2875
              </Typography>
            </Grid>
          </Grid>
          <Box textAlign="center" sx={{ mt: 4 }}>
            <Button 
              variant="contained" 
              color="error" 
              size="large" 
              component={NextLink} 
              href="/contact"
              sx={{ px: 4 }}
            >
              Contact Us Today
            </Button>
          </Box>
        </Container>
      </ScrollableSection>
    </Box>
  );
}