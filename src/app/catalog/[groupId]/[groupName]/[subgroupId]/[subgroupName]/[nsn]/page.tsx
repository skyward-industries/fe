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

export default async function PartInfoPage(props: {
  params: Promise<{ nsn: string }>;
}) {
  const params = await props.params;
  const cleanNSN = params.nsn.replace("nsn-", "");

  const parts = await fetchPartInfo(cleanNSN);

  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Typography
        variant="h4"
        fontWeight="bold"
        textAlign="center"
        gutterBottom
      >
        NSN: {cleanNSN}
      </Typography>

      {parts.length === 0 ? (
        <Typography textAlign="center" sx={{ mt: 3 }}>
          No parts found for this NSN.
        </Typography>
      ) : (
        parts.map((part, index) => (
          <Box key={index} sx={{ mb: 5 }}>
            {/* Part Header */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h5" fontWeight="bold">
                {part.part_number}
              </Typography>
              {index === 0 && <SelectionButton item={part} />}
            </Box>
            <Typography
              variant="subtitle1"
              color="textSecondary"
              sx={{ mt: 1 }}
            >
              <strong>CAGE Code:</strong> {part.cage_code}
            </Typography>

            {/* Manufacturer Info */}
            <Typography variant="h6" sx={{ mt: 3 }}>
              Manufacturer Details
            </Typography>
            <TableContainer component={Paper} sx={{ mt: 1 }}>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <strong>Company Name</strong>
                    </TableCell>
                    <TableCell>{part.company_name || "N/A"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <strong>Address</strong>
                    </TableCell>
                    <TableCell>
                      {part.street_address_1 || ""}{" "}
                      {part.street_address_2 || ""} {part.po_box || ""}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <strong>Location</strong>
                    </TableCell>
                    <TableCell>
                      {part.city
                        ? `${part.city}, ${part.state} ${part.zip}, ${part.country}`
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <strong>Establishment Date</strong>
                    </TableCell>
                    <TableCell>{part.date_est || "N/A"}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {/* Add a divider between multiple parts */}
            {index < parts.length - 1 && <Divider sx={{ my: 4 }} />}
          </Box>
        ))
      )}
    </Container>
  );
}
