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
  Chip,
} from "@mui/material";
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import DescriptionIcon from '@mui/icons-material/Description';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import HelpIcon from '@mui/icons-material/Help';
import DownloadIcon from '@mui/icons-material/Download';
import NextLink from "next/link";

export const metadata: Metadata = {
  title: 'Resources | Skyward Industries - Aerospace & Defense Documentation',
  description: 'Access technical guides, industry insights, compliance documentation, and helpful resources for aerospace and defense professionals.',
  keywords: ['aerospace resources', 'technical guides', 'industry reports', 'compliance documentation', 'NSN database', 'part specifications'],
};

const resourceCategories = [
  {
    icon: <LibraryBooksIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
    title: 'Technical Guides',
    description: 'Comprehensive technical documentation and guides for aerospace and defense professionals.',
    resources: [
      'NSN Identification Guide',
      'Part Number Cross-Reference Manual',
      'Quality Standards Overview',
      'Compliance Requirements Guide'
    ]
  },
  {
    icon: <DescriptionIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
    title: 'Documentation',
    description: 'Essential documentation templates and compliance resources for your operations.',
    resources: [
      'Certificate Templates',
      'Test Report Forms',
      'Compliance Checklists',
      'Inspection Procedures'
    ]
  },
  {
    icon: <TrendingUpIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
    title: 'Industry Insights',
    description: 'Stay informed with the latest trends, market analysis, and industry developments.',
    resources: [
      'Market Trend Reports',
      'Technology Updates',
      'Regulatory Changes',
      'Industry Forecasts'
    ]
  },
  {
    icon: <HelpIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
    title: 'Support Materials',
    description: 'Get help with common questions and learn how to maximize our services.',
    resources: [
      'FAQ Database',
      'How-To Guides',
      'Video Tutorials',
      'Best Practices'
    ]
  }
];

const quickLinks = [
  { title: 'NSN Lookup Tool', description: 'Search our comprehensive NSN database', href: '/search' },
  { title: 'Submit RFQ', description: 'Request quotes for your parts requirements', href: '/cart' },
  { title: 'Contact Support', description: 'Get help from our technical experts', href: '/contact' },
  { title: 'Browse Catalog', description: 'Explore our full parts catalog', href: '/catalog' }
];

export default function ResourcesPage() {
  return (
    <Box>
      {/* Hero Section */}
      <Box 
        sx={{ 
          backgroundColor: 'background.default',
          py: { xs: 8, md: 12 },
          textAlign: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h1" fontWeight="bold" gutterBottom>
            Resources & Support
          </Typography>
          <Typography variant="h5" color="textSecondary" sx={{ mb: 4 }}>
            Technical guides, industry insights, and documentation to support your success
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            size="large" 
            component={NextLink} 
            href="/contact"
            sx={{ px: 4, py: 1.5 }}
          >
            Contact Support
          </Button>
        </Container>
      </Box>

      {/* Resource Categories */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Typography variant="h2" fontWeight="bold" textAlign="center" gutterBottom sx={{ mb: 8 }}>
          Resource Categories
        </Typography>
        
        <Grid container spacing={4}>
          {resourceCategories.map((category, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card sx={{ height: '100%', p: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    {category.icon}
                    <Typography variant="h5" fontWeight="bold" sx={{ ml: 2 }}>
                      {category.title}
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                    {category.description}
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, m: 0 }}>
                    {category.resources.map((resource, resourceIndex) => (
                      <Typography 
                        component="li" 
                        variant="body2" 
                        key={resourceIndex} 
                        sx={{ mb: 0.5, cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                      >
                        {resource}
                      </Typography>
                    ))}
                  </Box>
                  <Button 
                    variant="outlined" 
                    startIcon={<DownloadIcon />} 
                    sx={{ mt: 3 }}
                    fullWidth
                  >
                    Access Resources
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Divider />

      {/* Quick Links */}
      <Box sx={{ backgroundColor: 'background.default', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" fontWeight="bold" textAlign="center" gutterBottom sx={{ mb: 6 }}>
            Quick Access Tools
          </Typography>
          <Grid container spacing={3}>
            {quickLinks.map((link, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ height: '100%', textAlign: 'center', p: 3, '&:hover': { transform: 'translateY(-4px)' } }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {link.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                      {link.description}
                    </Typography>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      component={NextLink} 
                      href={link.href}
                      fullWidth
                    >
                      Access Tool
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Knowledge Base Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" fontWeight="bold" textAlign="center" gutterBottom sx={{ mb: 2 }}>
          Knowledge Base
        </Typography>
        <Typography variant="h6" color="textSecondary" textAlign="center" sx={{ mb: 6 }}>
          Frequently accessed topics and popular resources
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Part Identification
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                Learn how to identify parts using NSN, part numbers, and specifications.
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Chip label="NSN Format" size="small" sx={{ mr: 1, mb: 1 }} />
                <Chip label="Part Numbers" size="small" sx={{ mr: 1, mb: 1 }} />
                <Chip label="CAGE Codes" size="small" sx={{ mr: 1, mb: 1 }} />
              </Box>
              <Button variant="outlined" color="primary">
                Learn More
              </Button>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Quality Standards
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                Understand the quality standards and certifications required in aerospace.
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Chip label="AS9100" size="small" sx={{ mr: 1, mb: 1 }} />
                <Chip label="ISO 9001" size="small" sx={{ mr: 1, mb: 1 }} />
                <Chip label="DFARS" size="small" sx={{ mr: 1, mb: 1 }} />
              </Box>
              <Button variant="outlined" color="primary">
                Learn More
              </Button>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ backgroundColor: 'primary.main', color: 'white', py: 8 }}>
        <Container maxWidth="md" textAlign="center">
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Need Additional Support?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Our technical experts are here to help with any questions or specialized requirements.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              color="secondary" 
              size="large" 
              component={NextLink} 
              href="/contact"
            >
              Contact Support
            </Button>
            <Button 
              variant="outlined" 
              size="large" 
              component={NextLink} 
              href="/services"
              sx={{ 
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Our Services
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}