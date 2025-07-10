'use client';
import { useTheme, useMediaQuery, Container, Typography, Box, Paper, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Button, Card, CardContent, CardActions, Divider } from '@mui/material';
import Link from 'next/link';
import { capitalizeWords } from '@/utils/capitalizeWords';
import { slugify } from '@/utils/slugify';
import type { Group } from '@/services/fetchGroups';

interface CatalogClientProps {
  groups: Group[];
}

function toSentenceCase(str: string) {
  if (!str) return '';
  const lower = str.toLowerCase();
  return lower.replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
}

function getCustomDescription(title: string) {
  return `Explore our selection of ${capitalizeWords(title)} for aerospace, defense, and industrial applications.`;
}

// --- Aerospace Relevance Ranking ---
const aerospaceRanking = [
  'Aerospace Craft And Structural Components',
  'Aerospace Craft Components And Accessories',
  'Aerospace Craft Launching, Landing, Ground Handling, And Servicing Equipment',
  'Engines, Turbines, And Components',
  'Engine Accessories',
  'Guided Missiles',
  'Space Vehicles',
  'Electrical And Electronic Equipment Components',
  'Communication, Detection, And Coherent Radiation Equipment',
  'Fire Control Equipment',
  'Bearings',
  'Mechanical Power Transmission Equipment',
  'Pumps And Compressors',
  'Valves',
  'Fiber Optics Materials, Components, Assemblies, And Accessories',
  'Electric Wire, And Power And Distribution Equipment',
  'Lighting Fixtures And Lamps',
  'Measuring Tools',
  'Maintenance And Repair Shop Equipment',
  // Moderately Relevant
  'Weapons',
  'Ammunition And Explosives',
  'Nuclear Ordinance',
  'Ship And Marine Equipment',
  'Tractors',
  'Vehicular Equipment Components',
  'Containers, Packaging, And Packing Supplies',
  'Hand Tools',
  'Training Aids And Devices',
  'Instruments And Laboratory Equipment',
  'Photographic Equipment',
  'Refrigeration, Air Conditioning, And Air Circulating Equipment',
  'Plumbing, Heating, And Waste Disposal Equipment',
  // Low/Indirect Relevance
  'Construction, Mining, Excavating, And Highway Maintenance Equipment',
  'Materials Handling Equipment',
  'Railway Equipment',
  'Ground Effect Vehicles, Motor Vehicles, Trailers, And Cycles',
  'Service And Trade Equipment',
  'Special Industry Machinery',
  'Agricultural Machinery And Equipment',
  'Food Preparation And Serving Equipment',
  'Medical, Dental, And Veterinary Equipment And Supplies',
  'Chemicals And Chemical Products',
  'Textiles, Leather, Furs, Apparel And Shoe Findings, Tents And Flags',
  'Clothing, Individual Equipment, Insignia, And Jewelry',
  'Toiletries',
  'Subsistence',
  'Fuels, Lubricants, Oils, And Waxes',
  'Nonmetallic Fabricated Materials',
  'Nonmetallic Crude Materials',
  'Metal Bars, Sheets, And Shapes',
  'Ores, Minerals, And Their Primary Products',
  'Brushes, Paints, Sealers, And Adhesives',
  'Office Supplies And Devices',
  'Books, Maps, And Other Publications',
  'Furniture',
  'Household And Commercial Furnishings And Appliances',
  'Office Machines, Text Processing Systems And Visible Record Equipment',
  'Musical Instruments, Phonographs, And Home Type Radios',
  'Recreational And Athletic Equipment',
  'Cleaning Equipment And Supplies',
  'Prefabricated Structures And Scaffolding',
  'Lumber, Millwork, Plywood, And Veneer',
  'Construction And Building Materials',
  'Historical Fsg',
  'Live Animals',
  'Agricultural Supplies',
  'Miscellaneous',
];

function getRankingIndex(title: string) {
  const idx = aerospaceRanking.findIndex(
    (r) => r.toLowerCase() === title.toLowerCase()
  );
  return idx === -1 ? 9999 : idx;
}

export default function CatalogClient({ groups }: CatalogClientProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Sort groups by aerospace relevance ranking
  const sortedGroups = [...groups].sort((a, b) =>
    getRankingIndex(a.fsg_title) - getRankingIndex(b.fsg_title)
  );

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Box textAlign="center" mb={{ xs: 4, md: 6 }}>
        <Typography component="h1" variant="h2" fontWeight="bold" gutterBottom>
          Product Groups
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Explore our diverse range of industry-leading product groups.
        </Typography>
      </Box>

      {isMobile ? (
        <Box display="flex" flexDirection="column" gap={2}>
          {sortedGroups.map((group) => (
            <Card key={group.fsg} variant="outlined" sx={{ borderRadius: 3, boxShadow: 3, background: theme => theme.palette.background.paper, p: 1 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ fontSize: '1.25rem' }}>
                  {capitalizeWords(group.fsg_title)}
                </Typography>
                <Divider sx={{ mb: 1 }} />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    fontWeight: 400,
                    fontSize: '0.98rem',
                    letterSpacing: 0.05,
                    textTransform: 'none',
                    lineHeight: 1.5,
                  }}
                >
                  {group.description && group.description.trim() && group.description.trim().toUpperCase() !== 'N/A'
                    ? toSentenceCase(group.description)
                    : getCustomDescription(group.fsg_title)}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  component={Link}
                  href={`/catalog/${group.fsg}/${slugify(group.fsg_title || '')}`}
                  fullWidth
                  aria-label={`View subgroups for ${group.fsg_title}`}
                  sx={{ borderRadius: 2, fontWeight: 600, boxShadow: 1 }}
                >
                  View Subgroups
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, boxShadow: 3, background: theme => theme.palette.background.paper }}>
          <Table aria-label="product groups table">
            <TableHead>
              <TableRow sx={{
                '& .MuiTableCell-head': {
                  backgroundColor: 'primary.dark',
                  color: 'common.white',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                },
              }}>
                <TableCell>Group Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedGroups.map((group) => (
                <TableRow
                  key={group.fsg}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    background: theme => theme.palette.background.paper,
                    boxShadow: 2,
                    borderRadius: 2,
                    transition: 'background 0.2s',
                    '&:hover': { background: theme => theme.palette.action.hover },
                  }}
                >
                  <TableCell component="th" scope="row" sx={{ fontWeight: '600', fontSize: '1.1rem' }}>
                    {capitalizeWords(group.fsg_title)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 400, fontSize: '0.98rem', letterSpacing: 0.05, textTransform: 'none', lineHeight: 1.5 }}>
                    {group.description && group.description.trim() && group.description.trim().toUpperCase() !== 'N/A'
                      ? toSentenceCase(group.description)
                      : getCustomDescription(group.fsg_title)}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="contained"
                      component={Link}
                      href={`/catalog/${group.fsg}/${slugify(group.fsg_title || '')}`}
                      aria-label={`View subgroups for ${group.fsg_title}`}
                      sx={{ borderRadius: 2, fontWeight: 600, boxShadow: 1 }}
                    >
                      View Subgroups
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
} 