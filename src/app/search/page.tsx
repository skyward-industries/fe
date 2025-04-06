import SelectionButton from "@/components/Selection";
import { fetchPartInfo } from "@/services/fetchPartInfo";
import {
  Box,
  Container,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";

export default async function PartInfoPage(props: { searchParams: Promise<{ nsn?: string }> }) {
  const searchParams = await props.searchParams;
  if (!searchParams.nsn) {
    return (
      <Container maxWidth="md" sx={{ my: 4, textAlign: "center" }}>
        <Typography variant="h4" fontWeight="bold">Search Parts</Typography>
        <Typography variant="body1" color="textSecondary">
          Enter an NSN in the search bar above.
        </Typography>
      </Container>
    );
  }

  const parts = await fetchPartInfo(searchParams.nsn);

  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
        NSN: {searchParams.nsn}
      </Typography>

      {parts.length === 0 ? (
        <Typography textAlign="center" sx={{ mt: 3 }}>
          No parts found for this NSN.
        </Typography>
      ) : (
        parts.map((part, index) => (
          <Box key={index} sx={{ mb: 5 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" fontWeight="bold">
                {part.part_number}
              </Typography>
              {index === 0 && <SelectionButton item={part} />}
            </Box>
            <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 1 }}>
              <strong>CAGE Code:</strong> {part.cage_code}
            </Typography>
            <Typography variant="h6" sx={{ mt: 3 }}>
              Manufacturer Details
            </Typography>
            <TableContainer component={Paper} sx={{ mt: 1 }}>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell><strong>Company Name</strong></TableCell>
                    <TableCell>{part.company_name || "N/A"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Address</strong></TableCell>
                    <TableCell>
                      {part.street_address_1 || ""} {part.street_address_2 || ""} {part.po_box || ""}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Location</strong></TableCell>
                    <TableCell>
                      {part.city ? `${part.city}, ${part.state} ${part.zip}, ${part.country}` : "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Establishment Date</strong></TableCell>
                    <TableCell>{part.date_est || "N/A"}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            {index < parts.length - 1 && <Divider sx={{ my: 4 }} />}
          </Box>
        ))
      )}
    </Container>
  );
}
