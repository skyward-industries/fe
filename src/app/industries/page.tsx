import React from 'react';
import type { Metadata } from 'next';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  Divider,
} from "@mui/material";
import FlightIcon from '@mui/icons-material/Flight';
import SecurityIcon from '@mui/icons-material/Security';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import BuildIcon from '@mui/icons-material/Build';
import PublicIcon from '@mui/icons-material/Public';
import NextLink from "next/link";

export const metadata: Metadata = {
  title: 'Industries Served | Skyward Industries - Aerospace & Defense Markets',
  description: 'Skyward Industries serves diverse markets including commercial aviation, defense, space exploration, and manufacturing with specialized aerospace components.',
  keywords: ['aerospace industries', 'defense markets', 'commercial aviation', 'space exploration', 'manufacturing', 'government contracts', 'military aviation'],
};

const industries = [
  {
    icon: <FlightIcon sx={{ fontSize: 80, color: 'primary.main' }} />,
    title: 'Commercial Aviation',
    description: 'Supporting commercial airlines, aircraft manufacturers, and MRO facilities with certified parts and components.',
    segments: ['Airlines & Operators', 'Aircraft OEMs', 'MRO Providers', 'Charter Services'],
    keyProducts: ['Engine components', 'Avionics systems', 'Landing gear parts', 'Interior components']
  },
  {
    icon: <SecurityIcon sx={{ fontSize: 80, color: 'primary.main' }} />,
    title: 'Defense & Military',
    description: 'Providing mission-critical components to defense contractors and military organizations worldwide.',
    segments: ['Prime Contractors', 'Military Branches', 'Defense Agencies', 'Allied Partners'],
    keyProducts: ['Weapons systems', 'Communication equipment', 'Vehicle components', 'Protective gear']
  },
  {
    icon: <RocketLaunchIcon sx={{ fontSize: 80, color: 'primary.main' }} />,
    title: 'Space & Satellite',
    description: 'Supporting the rapidly growing space industry with specialized components for satellites and launch vehicles.',
    segments: ['Launch Providers', 'Satellite Manufacturers', 'Space Agencies', 'Commercial Space'],
    keyProducts: ['Propulsion systems', 'Guidance systems', 'Thermal protection', 'Power systems']
  },
  {
    icon: <PrecisionManufacturingIcon sx={{ fontSize: 80, color: 'primary.main' }} />,
    title: 'Manufacturing',
    description: 'Serving manufacturers across aerospace and defense with precision components and assemblies.',
    segments: ['Tier 1 Suppliers', 'Specialty Manufacturers', 'Component Producers', 'Assembly Companies'],
    keyProducts: ['Precision machined parts', 'Electronic assemblies', 'Composite materials', 'Testing equipment']
  },
  {
    icon: <BuildIcon sx={{ fontSize: 80, color: 'primary.main' }} />,
    title: 'Maintenance & Repair',
    description: 'Supporting maintenance organizations with hard-to-find parts and obsolete component solutions.',
    segments: ['MRO Facilities', 'Repair Stations', 'Overhaul Shops', 'Field Service'],
    keyProducts: ['Replacement parts', 'Repair kits', 'Test equipment', 'Tools & GSE']
  },
  {
    icon: <PublicIcon sx={{ fontSize: 80, color: 'primary.main' }} />,
    title: 'Government & Agencies',
    description: 'Working with government agencies and international organizations on critical missions.',
    segments: ['Federal Agencies', 'State Organizations', 'International Partners', 'Research Institutions'],
    keyProducts: ['Specialized equipment', 'Custom solutions', 'Security systems', 'Research tools']
  }
];

export default function IndustriesPage() {
  return (
    <Box>
      {/* Hero Section */}
      <Box 
        sx={{ 
          backgroundColor: 'secondary.main', 
          color: 'white', 
          py: { xs: 8, md: 12 },
          textAlign: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h1" fontWeight="bold" gutterBottom>
            Industries We Serve
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            Trusted by leaders across aerospace, defense, and specialized manufacturing sectors
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            size="large" 
            component={NextLink} 
            href="/catalog"
            sx={{ px: 4, py: 1.5 }}
          >
            Explore Our Catalog
          </Button>
        </Container>
      </Box>

      {/* Industries Grid */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Typography variant="h2" fontWeight="bold" textAlign="center" gutterBottom sx={{ mb: 2 }}>
          Our Markets
        </Typography>
        <Typography variant="h6" color="textSecondary" textAlign="center" sx={{ mb: 8 }}>
          From Fortune 500 companies to specialized repair shops, we serve diverse markets with tailored solutions
        </Typography>
        
        <Grid container spacing={4}>
          {industries.map((industry, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card sx={{ height: '100%', p: 3, textAlign: 'center' }}>
                <CardContent>
                  <Box sx={{ mb: 3 }}>
                    {industry.icon}
                  </Box>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {industry.title}
                  </Typography>
                  <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                    {industry.description}
                  </Typography>
                  
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: 'primary.main' }}>
                    Key Segments
                  </Typography>
                  <Box component="ul" sx={{ textAlign: 'left', pl: 2, mb: 3 }}>
                    {industry.segments.map((segment, segmentIndex) => (
                      <Typography 
                        component="li" 
                        variant="body2" 
                        key={segmentIndex} 
                        sx={{ mb: 0.5 }}
                      >
                        {segment}
                      </Typography>
                    ))}
                  </Box>

                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: 'primary.main' }}>
                    Key Products
                  </Typography>
                  <Box component="ul" sx={{ textAlign: 'left', pl: 2 }}>
                    {industry.keyProducts.map((product, productIndex) => (
                      <Typography 
                        component="li" 
                        variant="body2" 
                        key={productIndex} 
                        sx={{ mb: 0.5 }}
                      >
                        {product}
                      </Typography>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Divider />

      {/* Stats Section */}
      <Box sx={{ backgroundColor: 'background.default', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" fontWeight="bold" textAlign="center" gutterBottom sx={{ mb: 6 }}>
            Trusted by Industry Leaders
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={6} md={3} textAlign="center">
              <Typography variant="h2" fontWeight="bold" color="primary.main">
                Fortune 500
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Companies Served
              </Typography>
            </Grid>
            <Grid item xs={6} md={3} textAlign="center">
              <Typography variant="h2" fontWeight="bold" color="primary.main">
                50K+
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Parts Available
              </Typography>
            </Grid>
            <Grid item xs={6} md={3} textAlign="center">
              <Typography variant="h2" fontWeight="bold" color="primary.main">
                500+
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Trusted Suppliers
              </Typography>
            </Grid>
            <Grid item xs={6} md={3} textAlign="center">
              <Typography variant="h2" fontWeight="bold" color="primary.main">
                24/7
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Global Support
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Partner with Industry Experts
        </Typography>
        <Typography variant="h6" color="textSecondary" sx={{ mb: 4 }}>
          Whether you're in commercial aviation, defense, space, or manufacturing, 
          our team understands your unique challenges and requirements.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large" 
            component={NextLink} 
            href="/services"
          >
            Our Services
          </Button>
          <Button 
            variant="outlined" 
            color="primary" 
            size="large" 
            component={NextLink} 
            href="/contact"
          >
            Contact Us
          </Button>
        </Box>
      </Container>
    </Box>
  );
}