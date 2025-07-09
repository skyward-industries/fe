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

// --- A safe helper function for formatting text ---
const formatText = (text?: string | null) => {
  if (!text) return '';
  return text.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
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
  const decodedSubgroupName = formatText(decodeURIComponent(subgroupName));
  const pageTitle = `${itemName} | NSN ${cleanNSN} | Skyward Industries`;
  const pageDescription = `Detailed information for NSN ${cleanNSN} (${itemName}) in the ${decodedSubgroupName} category.`;

  return {
    title: pageTitle,
    description: pageDescription,
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