'use client';
import { useSelection } from '@/context/SelectionContext';
import { useState } from 'react';
import { Button, Box, Container, Grid, Paper, Typography, Divider } from '@mui/material';
import type { Part } from '@/services/fetchPartInfo';

interface PartInfoClientProps {
  part: Part;
  uniqueParts: Part[];
}

interface DetailItemProps {
  label: string;
  value?: string | number | boolean | null;
}

export default function PartInfoClient({ part, uniqueParts }: PartInfoClientProps) {
  const { addItem } = useSelection();
  const [added, setAdded] = useState(false);

  if (!part) return null;
  const generalItemName = part.item_name || 'Product Details';

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 6 } }}>
      <Paper variant="outlined" sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, boxShadow: 2, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography component="h1" variant="h4" fontWeight="bold" gutterBottom>
              NSN: {part.nsn}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>{generalItemName}</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <DetailItem label="FSC Title" value={part.fsc_title} />
              <DetailItem label="FSG Title" value={part.fsg_title} />
              <DetailItem label="Definition" value={part.definition} />
              <DetailItem label="Unit of Issue" value={part.unit_of_issue} />
            </Grid>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img
                src="/logo.png"
                alt={generalItemName}
                style={{ width: '100%', maxWidth: 180, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>
      <section>
        <Typography component="h2" variant="h5" fontWeight="bold" textAlign="center" gutterBottom>Available Part Numbers & Suppliers</Typography>
        {uniqueParts.map((p, index) => {
          const [added, setAdded] = useState(false);
          return (
            <Paper key={p.part_number || index} variant="outlined" sx={{ mb: 2, borderRadius: 2, p: { xs: 2, md: 3 } }}>
              <Grid container spacing={2}>
                <DetailItem label="Part Number" value={p.part_number?.toUpperCase() || "N/A"} />
                <DetailItem label="Company Name" value={p.company_name} />
                <DetailItem label="CAGE Code" value={p.cage_code} />
                <DetailItem label="Address" value={[p.street_address_1, p.street_address_2, p.po_box].filter(Boolean).join(", ")} />
                <DetailItem label="Location" value={p.city ? `${p.city}, ${p.state} ${p.zip || ""}` : undefined} />
                <DetailItem label="Establishment Date" value={p.date_est} />
                <Grid item xs={12}>
                  <Button
                    variant={added ? "outlined" : "contained"}
                    color="primary"
                    sx={{ mt: 2, width: { xs: '100%', sm: 'auto' } }}
                    onClick={() => {
                      addItem({
                        id: p.id || p.nsn,
                        name: p.item_name || 'Part',
                        part_number: p.part_number || p.nsn || '',
                      });
                      setAdded(true);
                      setTimeout(() => setAdded(false), 1500);
                    }}
                    disabled={added}
                  >
                    {added ? "Added!" : "Add to Cart"}
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          );
        })}
      </section>
    </Container>
  );
}

function DetailItem({ label, value }: DetailItemProps) {
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