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

export default function CatalogClient({ groups }: CatalogClientProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
          {groups.map((group) => (
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
                  {group.description ? toSentenceCase(group.description) : 'N/A'}
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
              {groups.map((group) => (
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
                    {group.description ? toSentenceCase(group.description) : 'N/A'}
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