// src/app/catalog/[groupId]/[groupName]/[subgroupId]/[subgroupName]/[nsn]/page.tsx

import React from 'react';
import type { Metadata } from 'next';
import Link from "next/link";
import moment from "moment";

// Local Imports
import Breadcrumbs from '@/components/Breadcrumbs';
import SelectionButton from "@/components/Selection";
import { fetchPartInfo, Part } from "@/services/fetchPartInfo";
import { capitalizeWords } from "@/utils/capitalizeWords";

// MUI Imports
import {
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
} from "@mui/material";
import { ArrowLeft } from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";


// -----------------------------------------------------------------------------
// SEO: DYNAMIC METADATA FUNCTION
// -----------------------------------------------------------------------------
type PageProps = {
  params: {
    nsn: string;
    groupId: string;
    groupName: string;
    subgroupId: string;
    subgroupName: string;
  };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { nsn, subgroupName } = params;
  const cleanNSN = nsn.replace(/^nsn[-]?/i, "");
  
  // Fetch minimal data needed for metadata
  const parts = await fetchPartInfo(cleanNSN);
  const sharedPartData = parts.length > 0 ? parts[0] : null;

  const itemName = capitalizeWords(sharedPartData?.item_name || "Part");
  const decodedSubgroupName = capitalizeWords(decodeURIComponent(subgroupName));
  const pageTitle = `${itemName} | NSN ${cleanNSN} | Skyward Industries`;
  const pageDescription = `Find detailed information, specifications, and suppliers for NSN ${cleanNSN} (${itemName}). Part of the ${decodedSubgroupName} category. Request a quote from Skyward Industries.`;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: [itemName, cleanNSN, `NSN ${cleanNSN}`, "part number", "CAGE code", "aerospace parts", "defense supply", decodedSubgroupName],
    alternates: {
      canonical: `/catalog/${params.groupId}/${params.groupName}/${params.subgroupId}/${params.subgroupName}/${params.nsn}`,
    },
  };
}


// -----------------------------------------------------------------------------
// PAGE COMPONENT
// -----------------------------------------------------------------------------
export default async function PartInfoPage({ params }: PageProps) {
  const { nsn, groupId, groupName, subgroupId, subgroupName } = params;
  const cleanNSN = nsn.replace(/^nsn[-]?/i, "");

  // Fetch all part data for the page
  const parts: Part[] = await fetchPartInfo(cleanNSN);
  const sharedPartData = parts.length > 0 ? parts[0] : null;

  // --- Handle Not Found Case ---
  if (!sharedPartData) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, textAlign: 'center' }}>
        <Breadcrumbs />
        <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>Product Not Found</Typography>
        <Typography color="text.secondary">
          Sorry, we could not find any information for NSN: {cleanNSN}.
        </Typography>
        <Button
          variant="contained"
          sx={{ mt: 4 }}
          startIcon={<ArrowLeft />}
          component={Link}
          href={`/catalog/${groupId}/${groupName}/${subgroupId}/${subgroupName}/`}
        >
          Back to Subgroup
        </Button>
      </Container>
    );
  }

  // --- Prepare Data for Display ---
  const uniquePartNumbers = new Set<string>();
  const uniqueParts = parts.filter(part => {
    if (part.part_number && !uniquePartNumbers.has(part.part_number.toLowerCase())) {
      uniquePartNumbers.add(part.part_number.toLowerCase());
      return true;
    }
    return false;
  });

  const generalItemName = capitalizeWords(sharedPartData.item_name || "Product Details");
  const decodedGroupName = decodeURIComponent(groupName);
  const decodedSubgroupName = decodeURIComponent(subgroupName);

  // --- Enhanced JSON-LD Schema ---
  const schemaOrg = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "name": `${generalItemName} - NSN ${cleanNSN}`,
        "description": sharedPartData.definition || `Detailed specifications and supplier information for National Stock Number ${cleanNSN}.`,
        "sku": cleanNSN,
        "mpn": cleanNSN,
        "brand": {
          "@type": "Organization",
          "name": capitalizeWords(sharedPartData.company_name || 'Various Manufacturers')
        },
        "offers": {
          "@type": "Offer",
          "url": `https://www.skywardparts.com/catalog/${groupId}/${decodedGroupName}/${subgroupId}/${decodedSubgroupName}/${nsn}`,
          "priceCurrency": "USD", "price": "0", "availability": "https://schema.org/InStock",
          "seller": { "@type": "Organization", "name": "Skyward Industries" }
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.skywardparts.com" },
          { "@type": "ListItem", "position": 2, "name": "Catalog", "item": "https://www.skywardparts.com/catalog" },
          { "@type": "ListItem", "position": 3, "name": capitalizeWords(decodedGroupName), "item": `https://www.skywardparts.com/catalog/${groupId}/${decodedGroupName}` },
          { "@type": "ListItem", "position": 4, "name": capitalizeWords(decodedSubgroupName), "item": `https://www.skywardparts.com/catalog/${groupId}/${decodedGroupName}/${subgroupId}/${decodedSubgroupName}` },
          { "@type": "ListItem", "position": 5, "name": `NSN ${cleanNSN}` }
        ]
      }
    ]
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }} />
      
      <Breadcrumbs />

      <Button
        variant="outlined"
        sx={{ mb: { xs: 2, md: 4 }, fontWeight: "bold" }}
        startIcon={<ArrowLeft />}
        component={Link}
        href={`/catalog/${groupId}/${groupName}/${subgroupId}/${subgroupName}/`}
      >
        Back to Subgroup
      </Button>

      {/* Section 1: Shared NSN Information */}
      <Paper variant="outlined" sx={{ p: { xs: 2, md: 4 }, mb: { xs: 4, md: 6 }, borderRadius: 2 }}>
        <Typography component="h1" variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
          NSN: {cleanNSN}
        </Typography>
        <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 4 }}>
            {generalItemName}
        </Typography>
        <Divider sx={{ mb: 4 }} />

        <Typography component="h2" variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
          General Details
        </Typography>
        <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 4 }}>
            <DetailItem label="FSC Title" value={capitalizeWords(sharedPartData.fsc_title)} />
            <DetailItem label="FSG Title" value={capitalizeWords(sharedPartData.fsg_title)} />
            <DetailItem label="Item Name" value={capitalizeWords(sharedPartData.item_name)} />
            <DetailItem label="Definition" value={sharedPartData.definition} />
            <DetailItem label="Unit of Issue" value={sharedPartData.unit_of_issue} />
            <DetailItem label="Shelf Life Code" value={sharedPartData.shelf_life_code} />
        </Grid>

        <Typography component="h2" variant="h6" gutterBottom sx={{ color: 'primary.main', mt: 4 }}>
            Logistics & Freight
        </Typography>
        <Grid container spacing={{ xs: 2, md: 3 }}>
            <DetailItem label="Uniform Freight Class" value={sharedPartData.uniform_freight_class} />
            <DetailItem label="LTL Class" value={sharedPartData.ltl_class} />
            <DetailItem label="NMFC Description" value={capitalizeWords(sharedPartData.nmfc_description)} />
        </Grid>
      </Paper>

      {/* Section 2: Part-Specific Information Accordions */}
      <Typography component="h2" variant="h5" fontWeight="bold" textAlign="center" gutterBottom sx={{ mt: 6 }}>
        Available Part Numbers & Suppliers
      </Typography>
      {uniqueParts.length === 0 ? (
        <Typography textAlign="center" sx={{ mt: 3, color: "text.secondary" }}>
          No specific part numbers found for this NSN.
        </Typography>
      ) : (
        uniqueParts.map((part, index) => (
          <Accordion key={part.part_number || `part-${index}`} defaultExpanded={index === 0} sx={{ mb: 2, borderRadius: 2 }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel-${part.part_number || index}-content`}
              id={`panel-${part.part_number || index}-header`}
              sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', '& .MuiAccordionSummary-content': { justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', py: 1 } }}
            >
              <Typography variant="h6" fontWeight="bold" sx={{ flexShrink: 0, mr: 2 }}>
                Part Number: {part.part_number?.toUpperCase() || "N/A"}
              </Typography>
              <SelectionButton item={part} />
            </AccordionSummary>
            <AccordionDetails sx={{ p: { xs: 2, md: 4 }, bgcolor: 'background.paper' }}>
              <Typography component="h3" variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                  Supplier Information
              </Typography>
              <Grid container spacing={{ xs: 1, md: 2 }}>
                  <DetailItem label="Company Name" value={capitalizeWords(part.company_name)} />
                  <DetailItem label="CAGE Code" value={part.cage_code} />
                  <DetailItem label="Address" value={[part.street_address_1, part.street_address_2, part.po_box].filter(Boolean).map(capitalizeWords).join(", ")} />
                  <DetailItem label="Location" value={isDefined(part.city) ? `${capitalizeWords(part.city)}, ${capitalizeWords(part.state)} ${part.zip || ""}` : undefined} />
                  <DetailItem label="Establishment Date" value={part.date_est ? moment(part.date_est, "DD-MMM-YYYY").format("M/DD/YYYY") : undefined} />
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Container>
  );
}


// -----------------------------------------------------------------------------
// HELPER COMPONENTS & FUNCTIONS
// -----------------------------------------------------------------------------

function isDefined(value: any): boolean {
  return value !== undefined && value !== null;
}

function DetailItem({ label, value }: { label: string; value?: string | number | boolean | null }) {
  // Don't render if value is not defined, is null, or is an empty string
  if (!isDefined(value) || String(value).trim() === "") {
    return null; 
  }
  return (
    <Grid item xs={12} sm={6}>
      <Typography variant="body2" sx={{ fontWeight: "bold", color: "text.secondary" }}>
        {label}:
      </Typography>
      <Typography variant="body1" sx={{ color: "text.primary" }}>
        {String(value)}
      </Typography>
    </Grid>
  );
}