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
      {/* Freight Info Section: Only show if any freight fields are present */}
      {(part.activity_code || part.nmfc_number || part.nmfc_subcode || part.uniform_freight_class || part.ltl_class || part.wcc || part.tcc || part.shc || part.adc || part.acc || part.nmf_desc) && (
        <Paper variant="outlined" sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, boxShadow: 1, mb: 4 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>Freight Information</Typography>
          <Grid container spacing={2}>
            {part.activity_code && <DetailItem label="Activity Code" value={part.activity_code} />}
            {part.nmfc_number && <DetailItem label="NMFC Number" value={part.nmfc_number} />}
            {part.nmfc_subcode && <DetailItem label="NMFC Subcode" value={part.nmfc_subcode} />}
            {part.uniform_freight_class && <DetailItem label="Uniform Freight Class" value={part.uniform_freight_class} />}
            {part.ltl_class && <DetailItem label="LTL Class" value={part.ltl_class} />}
            {part.wcc && <DetailItem label="WCC" value={part.wcc} />}
            {part.tcc && <DetailItem label="TCC" value={part.tcc} />}
            {part.shc && <DetailItem label="SHC" value={part.shc} />}
            {part.adc && <DetailItem label="ADC" value={part.adc} />}
            {part.acc && <DetailItem label="ACC" value={part.acc} />}
            {part.nmf_desc && <DetailItem label="NMF Description" value={part.nmf_desc} />}
          </Grid>
        </Paper>
      )}
      {/* Technical Characteristics Section: Only show if characteristics are present */}
      {Array.isArray(part.characteristics) && part.characteristics.length > 0 && (
        <Paper variant="outlined" sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, boxShadow: 1, mb: 4 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>Technical Characteristics</Typography>
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ccc' }}>Characteristic</th>
                  <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ccc' }}>Value</th>
                </tr>
              </thead>
              <tbody>
                {part.characteristics.map((char, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{char.requirements_statement}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{char.clear_text_reply}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Paper>
      )}
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