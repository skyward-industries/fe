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
  const { nsn, subgroupName } = params;
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
  
  // Enhanced title with company name if available
  const pageTitle = companyName 
    ? `NSN ${cleanNSN} | ${itemName} | ${companyName}`
    : `NSN ${cleanNSN} | ${itemName} | Skyward Industries`;
  
  // Enhanced description with definition if available
  const definition = sharedPartData?.definition || "";
  const pageDescription = definition 
    ? `${itemName} - ${definition.substring(0, 150)}${definition.length > 150 ? '...' : ''}`
    : `Detailed information for NSN ${cleanNSN} (${itemName}) in the ${decodedSubgroupName} category.`;

  // Build keywords array from available data
  const keywords = [
    `NSN ${cleanNSN}`,
    cleanNSN,
    itemName,
    sharedPartData?.part_number,
    sharedPartData?.cage_code,
    sharedPartData?.company_name,
    sharedPartData?.fsc_title,
    sharedPartData?.fsg_title,
    decodedSubgroupName,
    "aerospace parts",
    "military parts",
    "industrial supplies"
  ].filter(Boolean) as string[];

  // OpenGraph data for better social media sharing
  const openGraph = {
    title: pageTitle,
    description: pageDescription,
    type: 'website' as const,
    url: `https://skywardindustries.com/catalog/${params.groupId}/${params.groupName}/${params.subgroupId}/${params.subgroupName}/${cleanNSN}`,
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
    description: pageDescription,
    keywords: keywords,
    openGraph: openGraph,
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: ['https://skywardindustries.com/logo.png'], // Placeholder image URL
    },
    robots: {
      index: true,
      follow: true,
    },
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
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>Product Not Found</Typography>
        <Typography color="text.secondary">Sorry, we could not find information for NSN: {cleanNSN}.</Typography>
        <Button variant="contained" sx={{ mt: 4 }} startIcon={<ArrowLeft />} component={Link} href={`/catalog/${groupId}/${groupName}/${subgroupId}/${subgroupName}/`}>
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

  const generalItemName = formatText(sharedPartData.item_name || "Product Details");
  
  return (
    <>
      {/* JSON-LD Structured Data */}
      {sharedPartData && (
        <>
          {generateStructuredData(sharedPartData, cleanNSN, params).map((schema, index) => (
            <Script
              key={index}
              id={`structured-data-${index}`}
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(schema),
              }}
            />
          ))}
        </>
      )}
      
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Breadcrumbs />
        <Button variant="outlined" sx={{ mb: 4, fontWeight: "bold" }} startIcon={<ArrowLeft />} component={Link} href={`/catalog/${groupId}/${groupName}/${subgroupId}/${subgroupName}/`}>
          Back to Subgroup
        </Button>

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 2 }}>
        <Typography component="h1" variant="h4" fontWeight="bold" textAlign="center" gutterBottom>NSN: {cleanNSN}</Typography>
        <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 4 }}>{generalItemName}</Typography>
        <Divider sx={{ mb: 4 }} />
        <Grid container spacing={{ xs: 2, md: 3 }}>
          <DetailItem label="FSC Title" value={formatText(sharedPartData.fsc_title)} />
          <DetailItem label="FSG Title" value={formatText(sharedPartData.fsg_title)} />
          <DetailItem label="Definition" value={sharedPartData.definition} />
          <DetailItem label="Unit of Issue" value={sharedPartData.unit_of_issue} />
        </Grid>
      </Paper>

      <Typography component="h2" variant="h5" fontWeight="bold" textAlign="center" gutterBottom>Available Part Numbers & Suppliers</Typography>
      {uniqueParts.map((part, index) => (
        <Accordion key={part.part_number || index} defaultExpanded={index === 0} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" fontWeight="bold">Part Number: {part.part_number?.toUpperCase() || "N/A"}</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: { xs: 2, md: 4 } }}>
            <Grid container spacing={{ xs: 1, md: 2 }}>
              <DetailItem label="Company Name" value={formatText(part.company_name)} />
              <DetailItem label="CAGE Code" value={part.cage_code} />
              <DetailItem label="Address" value={[part.street_address_1, part.street_address_2, part.po_box].filter(Boolean).map(formatText).join(", ")} />
              <DetailItem label="Location" value={part.city ? `${formatText(part.city)}, ${formatText(part.state)} ${part.zip || ""}` : undefined} />
              <DetailItem label="Establishment Date" value={part.date_est ? moment(part.date_est, "DD-MMM-YYYY").format("M/DD/YYYY") : undefined} />
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
      </Container>
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