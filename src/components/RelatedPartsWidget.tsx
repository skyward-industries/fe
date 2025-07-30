'use client';

import React from 'react';
import Link from 'next/link';
import { Box, Typography, Grid, Paper } from '@mui/material';

interface Part {
  nsn: string;
  fsg: string;
  fsc: string;
  fsg_title?: string;
  fsc_title?: string;
  item_name?: string;
}

interface RelatedPartsWidgetProps {
  currentNSN: string;
  fsg: string;
  fsc: string;
  groupName: string;
  subgroupName: string;
}

// This creates a powerful internal linking network
const RelatedPartsWidget: React.FC<RelatedPartsWidgetProps> = ({
  currentNSN,
  fsg,
  fsc,
  groupName,
  subgroupName
}) => {
  const [relatedParts, setRelatedParts] = React.useState<Part[]>([]);

  React.useEffect(() => {
    // Fetch related parts from same FSC + similar NSNs
    const fetchRelated = async () => {
      try {
        const response = await fetch(`/api/related-parts/${currentNSN}?limit=12`);
        const data = await response.json();
        setRelatedParts(data);
      } catch (error) {
        console.error('Failed to fetch related parts:', error);
      }
    };

    fetchRelated();
  }, [currentNSN]);

  if (relatedParts.length === 0) return null;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Related Parts & Cross-References
      </Typography>
      <Grid container spacing={2}>
        {relatedParts.map((part) => (
          <Grid item xs={12} sm={6} md={3} key={part.nsn}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Link 
                href={`/catalog/${part.fsg}/${groupName}/${part.fsc}/${subgroupName}/${part.nsn}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  {part.nsn}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {part.item_name || part.fsc_title || 'Part Details'}
                </Typography>
              </Link>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default RelatedPartsWidget;