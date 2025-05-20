import SelectionButton from "@/components/Selection";
import { fetchPartInfo } from "@/services/fetchPartInfo";
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
    <Container
      maxWidth="lg"
      sx={{ py: 8, height: "90vh", overflowY: "scroll" }}
    >
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

            <Typography
              variant="subtitle1"
              color="textSecondary"
              sx={{ mb: 2 }}
            >
              <strong>CAGE Code:</strong> {part.cage_code}
            </Typography>

            <Grid container spacing={4}>
              {/* Main Table */}
              <Grid item xs={12} md={8}>
                <Paper
                  variant="outlined"
                  sx={{ backgroundColor: "#1a1a1a", color: "white" }}
                >
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Manufacturer & NSN Info
                    </Typography>
                  </Box>
                  <TableContainer>
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
                            {[
                              part.street_address_1,
                              part.street_address_2,
                              part.po_box,
                            ]
                              .filter(Boolean)
                              .join(", ") || "N/A"}
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
                        <TableRow>
                          <TableCell>
                            <strong>INC</strong>
                          </TableCell>
                          <TableCell>{part.inc ?? "N/A"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>Item Name</strong>
                          </TableCell>
                          <TableCell>{part.item_name || "N/A"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>End Item</strong>
                          </TableCell>
                          <TableCell>{part.end_item_name || "N/A"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>SOS</strong>
                          </TableCell>
                          <TableCell>{part.sos || "N/A"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>Cancelled NIIN</strong>
                          </TableCell>
                          <TableCell>{part.cancelled_niin || "N/A"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>Standardization Code</strong>
                          </TableCell>
                          <TableCell>
                            {part.item_standardization_code || "N/A"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>Origin Decision Code</strong>
                          </TableCell>
                          <TableCell>
                            {part.origin_stdzn_decision_code || "N/A"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>Decision Date</strong>
                          </TableCell>
                          <TableCell>{part.decision_date || "N/A"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>NIIN Status Code</strong>
                          </TableCell>
                          <TableCell>
                            {part.niin_status_code ?? "N/A"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>Uniform Freight Class</strong>
                          </TableCell>
                          <TableCell>
                            {part.uniform_freight_class ?? "N/A"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>LTL Class</strong>
                          </TableCell>
                          <TableCell>{part.ltl_class || "N/A"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>LCL Class</strong>
                          </TableCell>
                          <TableCell>{part.lcl_class || "N/A"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>NMFC Description</strong>
                          </TableCell>
                          <TableCell>
                            {part.nmfc_description || "N/A"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>Special Handling</strong>
                          </TableCell>
                          <TableCell>
                            {part.special_handling_code || "N/A"}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
              {/* Sidebar Tables */}
              <Grid item xs={12} md={4}>
                <Paper
                  variant="outlined"
                  sx={{ backgroundColor: "#1a1a1a", color: "white" }}
                >
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      MOE Rule Info
                    </Typography>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell>
                            <strong>MOE Rule (VMR)</strong>
                          </TableCell>
                          <TableCell>{part.moe_rule_vmr || "N/A"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>Acquisition Method</strong>
                          </TableCell>
                          <TableCell>
                            {part.acquisition_method_code || "N/A"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>Management Activity</strong>
                          </TableCell>
                          <TableCell>
                            {part.inventory_management_activity || "N/A"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>Submitter</strong>
                          </TableCell>
                          <TableCell>{part.submitter || "N/A"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>Date Assigned</strong>
                          </TableCell>
                          <TableCell>{part.date_assigned || "N/A"}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
                {/* FLIS Management Info */}
                <Paper
                  variant="outlined"
                  sx={{ backgroundColor: "#1a1a1a", color: "white", mt: 3 }}
                >
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      FLIS Management Info
                    </Typography>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell>
                            <strong>MOE Rule (FLIS)</strong>
                          </TableCell>
                          <TableCell>{part.moe_rule_vfm || "N/A"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>Unit of Issue</strong>
                          </TableCell>
                          <TableCell>{part.unit_of_issue || "N/A"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>Shelf Life</strong>
                          </TableCell>
                          <TableCell>{part.shelf_life_code || "N/A"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>Replenishment Code</strong>
                          </TableCell>
                          <TableCell>
                            {part.replenishment_code || "N/A"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>Use Status</strong>
                          </TableCell>
                          <TableCell>{part.use_status_code || "N/A"}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
                <Box display="flex" flexDirection="column" gap={4}>
                  {/* Classification Info */}
                  <Paper
                    variant="outlined"
                    sx={{ backgroundColor: "#1a1a1a", color: "white", mt: 3 }}
                  >
                    <Box sx={{ px: 2, py: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Classification Info
                      </Typography>
                    </Box>
                    <TableContainer>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell>
                              <strong>Code</strong>
                            </TableCell>
                            <TableCell>{part.code || "N/A"}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <strong>Literal</strong>
                            </TableCell>
                            <TableCell>{part.literal || "N/A"}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <strong>Description</strong>
                            </TableCell>
                            <TableCell>{part.description || "N/A"}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <strong>Regs</strong>
                            </TableCell>
                            <TableCell>{part.regs || "N/A"}</TableCell>
                          </TableRow>
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
