import SelectionButton from "@/components/Selection";
import { fetchPartInfo } from "@/services/fetchPartInfo";
import { ArrowLeft } from "@mui/icons-material";
import {
  Box,
  Button,
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
import Link from "next/link";

export default async function PartInfoPage(props: {
  params: Promise<{
    nsn: string;
    groupId: string;
    groupName: string;
    subgroupId: string;
    subgroupName: string;
  }>;
}) {
  const cleanNSN = (await props.params).nsn
    ?.replace("nsn-", "")
    ?.replace("NSN-", "");
  const parts = await fetchPartInfo(cleanNSN);
  const uniqueParts = parts.filter(
    (part, index, self) =>
      index ===
      self.findIndex(
        (p) => p.part_number?.toLowerCase() === part.part_number?.toLowerCase()
      )
  );
  return (
    <Container
      maxWidth="md"
      sx={{ my: 4, maxHeight: "80vh", overflow: "scroll" }}
    >
      <Button
        variant="outlined"
        sx={{ mb: 2, fontWeight: "bold" }}
        startIcon={<ArrowLeft />}
      >
        <Link
          href={`/catalog/${(await props.params).groupId}/${(await props.params).groupName}/${(await props.params).subgroupId}/${(await props.params).subgroupName}/`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          Back
        </Link>
      </Button>
      <h1>NSN: {cleanNSN}</h1>
      {parts.length === 0 ? (
        <Typography textAlign="center" sx={{ mt: 3 }}>
          No parts found for this NSN.
        </Typography>
      ) : (
        uniqueParts.map((part, index) => (
          <Box key={index} sx={{ mb: 5 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h5" fontWeight="bold">
                {part.part_number.toUpperCase()}
              </Typography>
              <SelectionButton item={part} />
            </Box>
            <Typography
              variant="subtitle1"
              color="textSecondary"
              sx={{ mt: 1 }}
            >
              <strong>CAGE Code:</strong> {part.cage_code}
            </Typography>
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
            {index < parts.length - 1 && <Divider sx={{ my: 4 }} />}
          </Box>
        ))
      )}
    </Container>
  );
}
