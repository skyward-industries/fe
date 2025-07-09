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
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';
import SupportIcon from '@mui/icons-material/Support';
import InventoryIcon from '@mui/icons-material/Inventory';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VerifiedIcon from '@mui/icons-material/Verified';
import EngineeringIcon from '@mui/icons-material/Engineering';
import NextLink from "next/link";

export const metadata: Metadata = {
  title: 'Services | Skyward Industries - Aerospace & Defense Solutions',
  description: 'Comprehensive aerospace and defense services including parts sourcing, quality assurance, logistics, and technical support. Trusted by Fortune 500 companies.',
  keywords: ['aerospace services', 'defense solutions', 'parts sourcing', 'quality assurance', 'logistics', 'technical support', 'military parts', 'aerospace components'],
};

const services = [
  {
    icon: <InventoryIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
    title: 'Parts Sourcing & Procurement',
    description: 'Access to over 50,000 aerospace and defense parts through our extensive network of trusted suppliers worldwide.',
    features: ['NSN and Part Number searches', 'Cross-reference capabilities', 'Obsolete part alternatives', 'Volume pricing']
  },
  {
    icon: <VerifiedIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
    title: 'Quality Assurance',
    description: 'Rigorous quality control processes ensuring all parts meet military and aerospace standards.',
    features: ['Certificate of conformance', 'Traceability documentation', 'Testing and inspection', 'AS9100 compliance']
  },
  {
    icon: <LocalShippingIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
    title: 'Logistics & Supply Chain',
    description: 'Streamlined logistics solutions with expedited shipping and inventory management services.',
    features: ['Same-day shipping available', 'Global distribution network', 'Inventory management', 'Drop-shipping capabilities']
  },
  {
    icon: <EngineeringIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
    title: 'Technical Support',
    description: 'Expert technical assistance from aerospace professionals with decades of industry experience.',
    features: ['Part identification assistance', 'Application guidance', 'Technical specifications', 'Engineering support']
  },
  {
    icon: <PrecisionManufacturingIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
    title: 'Custom Manufacturing',
    description: 'Specialized manufacturing services for custom and hard-to-find aerospace components.',
    features: ['Custom fabrication', 'Prototype development', 'Small batch production', 'Reverse engineering']
  },
  {
    icon: <SupportIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
    title: 'Contract Services',
    description: 'Comprehensive contract services including vendor management and supply chain optimization.',
    features: ['Vendor managed inventory', 'Contract negotiations', 'Supply chain analysis', 'Cost reduction programs']
  }
];

export default function ServicesPage() {
  return (
    <Box>
      {/* Hero Section */}
      <Box 
        sx={{ 
          backgroundColor: 'primary.main', 
          color: 'white', 
          py: { xs: 8, md: 12 },
          textAlign: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h1" fontWeight="bold" gutterBottom>
            Our Services
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            Comprehensive aerospace and defense solutions tailored to your needs
          </Typography>
          <Button 
            variant="contained" 
            color="secondary" 
            size="large" 
            component={NextLink} 
            href="/contact"
            sx={{ px: 4, py: 1.5 }}
          >
            Get Started Today
          </Button>
        </Container>
      </Box>

      {/* Services Grid */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Typography variant="h2" fontWeight="bold" textAlign="center" gutterBottom sx={{ mb: 8 }}>
          What We Offer
        </Typography>
        
        <Grid container spacing={4}>
          {services.map((service, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card sx={{ height: '100%', p: 3, '&:hover': { transform: 'translateY(-4px)' } }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    {service.icon}
                    <Typography variant="h5" fontWeight="bold" sx={{ ml: 2 }}>
                      {service.title}
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                    {service.description}
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, m: 0 }}>
                    {service.features.map((feature, featureIndex) => (
                      <Typography 
                        component="li" 
                        variant="body2" 
                        key={featureIndex} 
                        sx={{ mb: 0.5 }}
                      >
                        {feature}
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

      {/* CTA Section */}
      <Box sx={{ backgroundColor: 'background.default', py: 8 }}>
        <Container maxWidth="md" textAlign="center">
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Ready to Partner with Us?
          </Typography>
          <Typography variant="h6" color="textSecondary" sx={{ mb: 4 }}>
            Whether you need a single part or a comprehensive supply chain solution, 
            our team is ready to help you succeed.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large" 
              component={NextLink} 
              href="/catalog"
            >
              Browse Catalog
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
            <Button 
              variant="contained" 
              color="error" 
              size="large" 
              component={NextLink} 
              href="/cart"
            >
              Request Quote
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}