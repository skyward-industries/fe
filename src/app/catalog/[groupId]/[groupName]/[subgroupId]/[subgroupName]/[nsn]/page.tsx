// src/app/catalog/[groupId]/[groupName]/[subgroupId]/[subgroupName]/[nsn]/page.tsx
// FINAL, ROBUST SERVER COMPONENT FOR PART DETAILS

import React from 'react';
import type { Metadata } from 'next';
import Link from "next/link";
import moment from "moment";
import { fetchPartInfo, Part } from "@/services/fetchPartInfo";
import {
  Box, Button, Container, Divider, Paper, Typography, Accordion,
  AccordionSummary, AccordionDetails, Grid,
} from "@mui/material";
import { ArrowLeft } from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Breadcrumbs from '@/components/Breadcrumbs'; // Assuming you have this component
import Script from 'next/script';
import PartInfoClient from '@/components/PartInfoClient';
import Head from 'next/head';

// --- A safe helper function for formatting text ---
const formatText = (text?: string | null) => {
  if (!text) return '';
  return text.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
};

// --- Helper function to generate JSON-LD structured data ---
const generateStructuredData = (part: Part, cleanNSN: string, params: any) => {
  const itemName = formatText(part.item_name || "Part");
  const companyName = formatText(part.company_name || "");
  
  // Base product schema
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `${itemName} - NSN ${cleanNSN}`,
    "description": part.definition || `Detailed information for NSN ${cleanNSN} (${itemName})`,
    "sku": cleanNSN,
    "mpn": part.part_number,
    "brand": {
      "@type": "Brand",
      "name": companyName || "Skyward Industries"
    },
    "category": part.fsc_title || part.fsg_title,
    "manufacturer": {
      "@type": "Organization",
      "name": companyName || "Skyward Industries",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": part.street_address_1,
        "addressLocality": part.city,
        "addressRegion": part.state,
        "postalCode": part.zip,
        "addressCountry": part.country
      }
    },
    "url": `https://skywardindustries.com/catalog/${params.groupId}/${params.groupName}/${params.subgroupId}/${params.subgroupName}/${cleanNSN}`,
    "image": "https://skywardindustries.com/logo.png", // Placeholder image
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "NSN",
        "value": cleanNSN
      },
      {
        "@type": "PropertyValue", 
        "name": "CAGE Code",
        "value": part.cage_code
      },
      {
        "@type": "PropertyValue",
        "name": "Unit of Issue",
        "value": part.unit_of_issue
      },
      {
        "@type": "PropertyValue",
        "name": "FSC Title",
        "value": part.fsc_title
      },
      {
        "@type": "PropertyValue",
        "name": "FSG Title", 
        "value": part.fsg_title
      }
    ].filter(prop => prop.value)
  };

  // Organization schema for the company
  const organizationSchema = companyName ? {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": companyName,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": part.street_address_1,
      "addressLocality": part.city,
      "addressRegion": part.state,
      "postalCode": part.zip,
      "addressCountry": part.country
    },
    "foundingDate": part.date_est ? moment(part.date_est, "DD-MMM-YYYY").format("YYYY-MM-DD") : undefined
  } : null;

  // Breadcrumb schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://skywardindustries.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Catalog",
        "item": "https://skywardindustries.com/catalog"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": formatText(params.groupName),
        "item": `https://skywardindustries.com/catalog/${params.groupId}/${params.groupName}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": formatText(params.subgroupName),
        "item": `https://skywardindustries.com/catalog/${params.groupId}/${params.groupName}/${params.subgroupId}/${params.subgroupName}`
      },
      {
        "@type": "ListItem",
        "position": 5,
        "name": `NSN ${cleanNSN}`,
        "item": `https://skywardindustries.com/catalog/${params.groupId}/${params.groupName}/${params.subgroupId}/${params.subgroupName}/${cleanNSN}`
      }
    ]
  };

  return [productSchema, organizationSchema, breadcrumbSchema].filter(Boolean);
};

// --- Define the page properties ---
type PageProps = {
  params: {
    nsn: string;
    groupId: string;
    groupName: string;
    subgroupId: string;
    subgroupName: string;
  };
};

// --- SEO: Dynamic Metadata Function ---
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { nsn, subgroupName, groupId, groupName, subgroupId } = params;
  const cleanNSN = nsn.replace(/^nsn[-]?/i, "");
  
  let sharedPartData: Part | null = null;
  try {
    const parts = await fetchPartInfo(cleanNSN);
    if (Array.isArray(parts) && parts.length > 0) {
      sharedPartData = parts[0];
    }
  } catch (error) {
    console.error("Failed to fetch metadata for NSN:", cleanNSN, error);
  }

  const itemName = formatText(sharedPartData?.item_name || "Part");
  const companyName = formatText(sharedPartData?.company_name || "");
  const decodedSubgroupName = formatText(decodeURIComponent(subgroupName));
  const partNumber = sharedPartData?.part_number || '';
  const cageCode = sharedPartData?.cage_code || '';
  const manufacturer = companyName || 'Skyward Industries';
  const fscTitle = sharedPartData?.fsc_title || '';
  const fsgTitle = sharedPartData?.fsg_title || '';
  const unitOfIssue = sharedPartData?.unit_of_issue || '';
  const technicalSummary = Array.isArray(sharedPartData?.characteristics)
    ? sharedPartData.characteristics.map(c => `${c.requirements_statement}: ${c.clear_text_reply}`).join('; ')
    : '';

  // Enhanced title with company name if available
  const pageTitle = companyName 
    ? `NSN ${cleanNSN} | ${itemName} | ${companyName}`
    : `NSN ${cleanNSN} | ${itemName} | Skyward Industries`;
  
  // --- Short meta description ---
  let metaDescription = '';
  if (sharedPartData?.definition) {
    metaDescription = `${itemName} (NSN ${cleanNSN}): ${sharedPartData.definition}`;
  } else {
    metaDescription = `Buy ${itemName} (NSN ${cleanNSN}) for aerospace, defense, and industrial needs.`;
  }
  if (metaDescription.length > 160) {
    metaDescription = metaDescription.slice(0, 157) + '...';
  }
  // --- Canonical URL ---
  const canonicalUrl = `https://skywardparts.com/catalog/${groupId}/${groupName}/${subgroupId}/${subgroupName}/${nsn}`;

  // Build keywords array from available data
  const keywords = [
    `NSN ${cleanNSN}`,
    cleanNSN,
    itemName,
    partNumber,
    cageCode,
    manufacturer,
    fscTitle,
    fsgTitle,
    decodedSubgroupName,
    "aerospace parts",
    "military parts",
    "industrial supplies"
  ].filter(Boolean) as string[];

  // OpenGraph data for better social media sharing
  const openGraph = {
    title: pageTitle,
    description: metaDescription,
    type: 'website' as const,
    url: canonicalUrl,
    images: [
      {
        url: 'https://skywardindustries.com/logo.png', // Placeholder image URL
        width: 1200,
        height: 630,
        alt: `${itemName} - NSN ${cleanNSN}`,
      },
    ],
    siteName: 'Skyward Industries',
  };

  return {
    title: pageTitle,
    description: metaDescription,
    keywords: keywords,
    openGraph: openGraph,
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: metaDescription,
      images: ['https://skywardindustries.com/logo.png'], // Placeholder image URL
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: canonicalUrl,
    },
    other: {
      'author': manufacturer,
      'publisher': manufacturer,
      'copyright': `© ${new Date().getFullYear()} ${manufacturer}`,
      'part_number': partNumber,
      'cage_code': cageCode,
      'unit_of_issue': unitOfIssue,
      'fsc_title': fscTitle,
      'fsg_title': fsgTitle,
      'technical_characteristics': technicalSummary,
    }
  };
}


// --- Main Page Component ---
export default async function PartInfoPage({ params }: PageProps) {
  const { nsn, groupId, groupName, subgroupId, subgroupName } = params;
  const cleanNSN = nsn.replace(/^nsn[-]?/i, "");

  let parts: Part[] = [];
  try {
    const fetchedParts = await fetchPartInfo(cleanNSN);
    if (Array.isArray(fetchedParts)) {
      parts = fetchedParts;
    }
  } catch (error) {
    console.error("Failed to fetch part info on server for NSN:", cleanNSN, error);
  }

  const sharedPartData = parts.length > 0 ? parts[0] : null;

  // --- Handle Not Found Case ---
  if (!sharedPartData) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>Product Not Found</Typography>
        <Typography color="text.secondary">Sorry, we could not find information for NSN: {cleanNSN}.</Typography>
        <Button variant="contained" sx={{ mt: 4 }} component={Link} href={`/catalog/${groupId}/${groupName}/${subgroupId}/${subgroupName}/`}>
          Back to Subgroup
        </Button>
      </Container>
    );
  }

  // --- Prepare Data for Display ---
  const uniquePartNumbers = new Set<string>();
  const uniqueParts = parts.filter(part => {
    const partNum = part.part_number?.toLowerCase();
    if (partNum && !uniquePartNumbers.has(partNum)) {
      uniquePartNumbers.add(partNum);
      return true;
    }
    return false;
  });

  // --- SEO Structured Data (JSON-LD) ---
  // ...existing JSON-LD logic...

  return (
    <>
      <Head>
        <meta name="author" content={sharedPartData.company_name || 'Skyward Industries'} />
        <meta name="publisher" content={sharedPartData.company_name || 'Skyward Industries'} />
        <meta name="copyright" content={`© ${new Date().getFullYear()} ${sharedPartData.company_name || 'Skyward Industries'}`} />
        <meta name="part_number" content={sharedPartData.part_number || ''} />
        <meta name="cage_code" content={sharedPartData.cage_code || ''} />
        <meta name="unit_of_issue" content={sharedPartData.unit_of_issue || ''} />
        <meta name="fsc_title" content={sharedPartData.fsc_title || ''} />
        <meta name="fsg_title" content={sharedPartData.fsg_title || ''} />
        <meta name="technical_characteristics" content={Array.isArray(sharedPartData?.characteristics) ? sharedPartData.characteristics.map(c => `${c.requirements_statement}: ${c.clear_text_reply}`).join('; ') : ''} />
      </Head>
      <main>
        {/* JSON-LD Structured Data */}
        {sharedPartData && (
          <Script
            id="product-structured-data"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org/",
                "@type": "Product",
                "name": sharedPartData.item_name || 'Product Details',
                "sku": sharedPartData.nsn,
                "description": sharedPartData.definition || sharedPartData.item_name || 'Product Details',
                "brand": {
                  "@type": "Organization",
                  "name": sharedPartData.company_name || 'Skyward Industries'
                },
                "offers": {
                  "@type": "Offer",
                  "availability": "https://schema.org/InStock"
                }
              })
            }}
          />
        )}
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Breadcrumbs />
          <Box mb={3}>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 700, margin: 0 }}>
              NSN: {sharedPartData.nsn} – {sharedPartData.item_name || 'Product Details'}
            </h1>
          </Box>
          <PartInfoClient part={sharedPartData} uniqueParts={uniqueParts} />
        </Container>
      </main>
    </>
  );
}

// --- Reusable Helper Component for Displaying Details ---
function DetailItem({ label, value }: { label: string; value?: string | number | boolean | null }) {
  if (value === undefined || value === null || String(value).trim() === "") {
    return null;
  }
  return (
    <Grid item xs={12} sm={6}>
      <Typography variant="body2" sx={{ fontWeight: "bold", color: "text.secondary" }}>{label}:</Typography>
      <Typography variant="body1" sx={{ color: "text.primary" }}>{String(value)}</Typography>
    </Grid>
  );
}