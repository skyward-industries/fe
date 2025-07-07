import SelectionButton from "@/components/Selection";
import { fetchPartInfo } from "@/services/fetchPartInfo";
import { capitalizeWords } from "@/utils/capitalizeWords";
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
import moment from "moment";
import Link from "next/link";

function isDefined(value: any): boolean {
  return value !== undefined && value !== null && value !== "";
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!isDefined(value)) return null;
  return (
    <TableRow>
      <TableCell sx={{ fontWeight: "bold" }}>{label}</TableCell>
      <TableCell>{value}</TableCell>
    </TableRow>
  );
}

export default async function PartInfoPage({
  params,
}: {
  params: {
    nsn: string;
    groupId: string;
    groupName: string;
    subgroupId: string;
    subgroupName: string;
  };
}) {
  const { nsn, groupId, groupName, subgroupId, subgroupName } = params;
  const cleanNSN = nsn.replace(/^nsn[-]?/i, "");

  const parts = await fetchPartInfo(cleanNSN);

  const uniqueParts = parts.filter(
    (part, index, self) =>
      index ===
      self.findIndex(
        (p) =>
          p.part_number?.toLowerCase() === part.part_number?.toLowerCase()
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

      <Typography component="h1" variant="h4" fontWeight="bold" gutterBottom>
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
                Part Number: {part.part_number?.toUpperCase() || "N/A"}
              </Typography>
              <SelectionButton item={part} />
            </Box>

            <Paper
              variant="outlined"
              sx={{ backgroundColor: "#1a1a1a", color: "white" }}
            >
              <TableContainer>
                <Table>
                  <TableBody>
                    {[
                      { label: "Company Name", value: capitalizeWords(part.company_name) },
                      {
                        label: "Address",
                        value: [part.street_address_1, part.street_address_2, part.po_box]
                          .filter(isDefined)
                          .map(capitalizeWords)
                          .join(", "),
                      },
                      {
                        label: "Location",
                        value:
                          isDefined(part.city) && isDefined(part.state) && isDefined(part.country)
                            ? `${capitalizeWords(part.city)}, ${capitalizeWords(part.state)} ${part.zip || ""}, ${capitalizeWords(part.country)}`
                            : undefined,
                      },
                      {
                        label: "Establishment Date",
                        value: part.date_est ? moment(part.date_est).format("M/DD/YYYY") : undefined,
                      },
                      { label: "INC", value: part.inc },
                      { label: "Item Name", value: capitalizeWords(part.item_name) },
                      { label: "End Item", value: capitalizeWords(part.end_item_name) },
                      { label: "SOS", value: part.sos },
                      { label: "Cancelled NIIN", value: part.cancelled_niin },
                      { label: "Uniform Freight Class", value: part.uniform_freight_class },
                      { label: "LTL Class", value: part.ltl_class },
                      { label: "Rate Value Code", value: part.rate_value_code },
                      { label: "Special Handling", value: part.special_handling_code },
                      { label: "Air Dimension Code", value: part.air_dimension_code },
                      { label: "Air Commodity Code", value: part.air_commodity_code },
                      { label: "NMFC Description", value: capitalizeWords(part.nmfc_description) },
                      { label: "MOE Rule (VMR)", value: part.moe_rule_vmr },
                      { label: "AAC", value: part.aac },
                      { label: "Unit of Issue", value: part.unit_of_issue },
                      { label: "Shelf Life", value: part.shelf_life_code },
                      { label: "Definition", value: capitalizeWords(part.definition) },
                      { label: "FIIG", value: part.fiig },
                      { label: "MRC", value: part.mrc },
                      { label: "Requirements Statement", value: part.requirements_statement },
                      { label: "Clear Text Reply", value: part.clear_text_reply },
                      { label: "Related INC", value: part.related_inc },
                      { label: "Related Item Name", value: capitalizeWords(part.related_item_name) },
                    ]
                      .filter((row) => isDefined(row.value))
                      .map((row, i) => (
                        <InfoRow key={i} label={row.label} value={row.value} />
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {index < parts.length - 1 && <Divider sx={{ my: 6 }} />}
          </Box>
        ))
      )}
    </Container>
  );
}
