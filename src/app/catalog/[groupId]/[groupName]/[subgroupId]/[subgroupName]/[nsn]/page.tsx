import SelectionButton from "@/components/Selection";
import { fetchPartInfo } from "@/services/fetchPartInfo";
import { capitalizeWords } from "@/utils/capitalizeWords";
import { ArrowLeft } from "@mui/icons-material";
import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";
import Link from "next/link";

function isDefined(value: any): boolean {
  return value !== undefined && value !== null && value !== "";
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!isDefined(value)) return null;
  return (
    <TableRow>
      <TableCell><strong>{label}</strong></TableCell>
      <TableCell>{value}</TableCell>
    </TableRow>
  );
}

export default async function PartInfoPage(props: {
  params: Promise<{
    nsn: string;
    groupId: string;
    groupName: string;
    subgroupId: string;
    subgroupName: string;
  }>;
}) {
  const { nsn, groupId, groupName, subgroupId, subgroupName } =
    await props.params;
  const cleanNSN = nsn?.replace("nsn-", "").replace("NSN-", "");
  const parts = await fetchPartInfo(cleanNSN);
  const uniqueParts = parts.filter(
    (part, index, self) =>
      index ===
      self.findIndex(
        (p) => p.part_number?.toLowerCase() === part.part_number?.toLowerCase()
      )
  );

  return (
    <Container maxWidth="lg" sx={{ py: 8, height: "90vh", overflowY: "scroll" }}>
      <Button
        variant="outlined"
        sx={{ mb: 2, fontWeight: "bold" }}
        startIcon={<ArrowLeft />}
      >
        <Link
          href={`/catalog/${groupId}/${groupName}/${subgroupId}/${subgroupName}/`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          Back
        </Link>
      </Button>

      <Typography variant="h4" fontWeight="bold" gutterBottom>
        NSN: {cleanNSN}
      </Typography>

      {parts.length === 0 ? (
        <Typography textAlign="center" sx={{ mt: 3 }}>
          No parts found for this NSN.
        </Typography>
      ) : (
        uniqueParts.map((part, index) => (
          <Box key={index} sx={{ mb: 8 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h5" fontWeight="bold">
                Part Number: {part.part_number.toUpperCase()}
              </Typography>
              <SelectionButton item={part} />
            </Box>

            <Grid container spacing={4}>
              <Grid item xs={12} md={8}>
                <Paper variant="outlined" sx={{ backgroundColor: "#1a1a1a", color: "white" }}>
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Manufacturer & NSN Info
                    </Typography>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableBody>
                        <InfoRow label="Company Name" value={capitalizeWords(part.company_name)} />
                        {isDefined(part.street_address_1) || isDefined(part.street_address_2) || isDefined(part.po_box) ? (
                          <TableRow>
                            <TableCell><strong>Address</strong></TableCell>
                            <TableCell>{[capitalizeWords(part.street_address_1), capitalizeWords(part.street_address_2), capitalizeWords(part.po_box)].filter(Boolean).join(", ")}</TableCell>
                          </TableRow>
                        ) : null}
                        {isDefined(part.city) && (
                          <TableRow>
                            <TableCell><strong>Location</strong></TableCell>
                            <TableCell>{`${capitalizeWords(part.city)}, ${capitalizeWords(part.state)} ${part.zip}, ${capitalizeWords(part.country)}`}</TableCell>
                          </TableRow>
                        )}
                        <InfoRow label="Establishment Date" value={capitalizeWords(part.date_est)} />
                        <InfoRow label="INC" value={part.inc} />
                        <InfoRow label="Item Name" value={capitalizeWords(part.item_name)} />
                        <InfoRow label="End Item" value={capitalizeWords(part.end_item_name)} />
                        <InfoRow label="SOS" value={part.sos} />
                        <InfoRow label="Cancelled NIIN" value={part.cancelled_niin} />
                        <InfoRow label="Standardization Code" value={part.item_standardization_code} />
                        <InfoRow label="Origin Decision Code" value={part.origin_stdzn_decision_code} />
                        <InfoRow label="Decision Date" value={part.decision_date} />
                        <InfoRow label="NIIN Status Code" value={part.niin_status_code} />
                        <InfoRow label="Uniform Freight Class" value={part.uniform_freight_class} />
                        <InfoRow label="LTL Class" value={part.ltl_class} />
                        <InfoRow label="LCL Class" value={part.lcl_class} />
                        <InfoRow label="NMFC Description" value={capitalizeWords(part.nmfc_description)} />
                        <InfoRow label="Special Handling" value={capitalizeWords(part.special_handling_code)} />
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper variant="outlined" sx={{ backgroundColor: "#1a1a1a", color: "white" }}>
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      MOE Rule Info
                    </Typography>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableBody>
                        <InfoRow label="MOE Rule (VMR)" value={capitalizeWords(part.moe_rule_vmr)} />
                        <InfoRow label="Acquisition Method" value={capitalizeWords(part.acquisition_method_code)} />
                        <InfoRow label="Management Activity" value={capitalizeWords(part.inventory_management_activity)} />
                        <InfoRow label="Submitter" value={capitalizeWords(part.submitter)} />
                        <InfoRow label="Date Assigned" value={part.date_assigned} />
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>

                <Paper variant="outlined" sx={{ backgroundColor: "#1a1a1a", color: "white", mt: 3 }}>
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      FLIS Management Info
                    </Typography>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableBody>
                        <InfoRow label="MOE Rule (FLIS)" value={part.moe_rule_vfm} />
                        <InfoRow label="Unit of Issue" value={part.unit_of_issue} />
                        <InfoRow label="Shelf Life" value={part.shelf_life_code} />
                        <InfoRow label="Replenishment Code" value={part.replenishment_code} />
                        <InfoRow label="Use Status" value={part.use_status_code} />
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>

                <Box display="flex" flexDirection="column" gap={4}>
                  <Paper variant="outlined" sx={{ backgroundColor: "#1a1a1a", color: "white", mt: 3 }}>
                    <Box sx={{ px: 2, py: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Classification Info
                      </Typography>
                    </Box>
                    <TableContainer>
                      <Table>
                        <TableBody>
                          <InfoRow label="Code" value={part.code} />
                          <InfoRow label="Literal" value={capitalizeWords(part.literal)} />
                          <InfoRow label="Description" value={capitalizeWords(part.description)} />
                          <InfoRow label="Regs" value={capitalizeWords(part.regs)} />
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Box>
              </Grid>
            </Grid>

            {index < parts.length - 1 && <Divider sx={{ my: 6 }} />}
          </Box>
        ))
      )}
    </Container>
  );
}
