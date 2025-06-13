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
      <TableCell>
        <strong>{label}</strong>
      </TableCell>
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
                Part Number: {part.part_number.toUpperCase()}
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
                      {
                        label: "Company Name",
                        value: capitalizeWords(part.company_name),
                      },
                      {
                        label: "Address",
                        value: [
                          part.street_address_1,
                          part.street_address_2,
                          part.po_box,
                        ]
                          .filter(isDefined)
                          .map(capitalizeWords)
                          .join(", "),
                      },
                      {
                        label: "Location",
                        value:
                          isDefined(part.city) &&
                          isDefined(part.state) &&
                          isDefined(part.country)
                            ? `${capitalizeWords(part.city)}, ${capitalizeWords(
                                part.state
                              )} ${part.zip || ""}, ${capitalizeWords(
                                part.country
                              )}`
                            : undefined,
                      },
                      {
                        label: "Establishment Date",
                        value: part.date_est
                          ? moment(new Date(part.date_est)).format("M/DD/YYYY")
                          : undefined,
                      },
                      { label: "INC", value: part.inc },
                      {
                        label: "Item Name",
                        value: capitalizeWords(part.item_name),
                      },
                      {
                        label: "End Item",
                        value: capitalizeWords(part.end_item_name),
                      },
                      { label: "SOS", value: part.sos },
                      { label: "Cancelled NIIN", value: part.cancelled_niin },
                      {
                        label: "Standardization Code",
                        value: part.item_standardization_code,
                      },
                      {
                        label: "Origin Decision Code",
                        value: part.origin_stdzn_decision_code,
                      },
                      { label: "Decision Date", value: part.decision_date },
                      {
                        label: "NIIN Status Code",
                        value: part.niin_status_code,
                      },
                      {
                        label: "Uniform Freight Class",
                        value: part.uniform_freight_class,
                      },
                      { label: "LTL Class", value: part.ltl_class },
                      { label: "LCL Class", value: part.lcl_class },
                      { label: "Rate Value Code", value: part.rate_value_code },
                      {
                        label: "Weight Computation Code",
                        value: part.weight_computation_code,
                      },
                      {
                        label: "Special Handling",
                        value: part.special_handling_code,
                      },
                      {
                        label: "Air Dimension Code",
                        value: part.air_dimension_code,
                      },
                      {
                        label: "Air Commodity Code",
                        value: part.air_commodity_code,
                      },
                      {
                        label: "NMFC Description",
                        value: capitalizeWords(part.nmfc_description),
                      },
                      { label: "MOE Rule (VMR)", value: part.moe_rule_vmr },
                      { label: "MOE Code", value: part.moe_code },
                      {
                        label: "Acquisition Method",
                        value: part.acquisition_method_code,
                      },
                      {
                        label: "AMSC Suffix Code",
                        value: part.amsc_suffix_code,
                      },
                      {
                        label: "Inventory Mgmt Strategy",
                        value: part.inventory_management_strategy_code,
                      },
                      {
                        label: "Item Mgmt Code",
                        value: part.item_management_code,
                      },
                      {
                        label: "Item Mgmt Activity",
                        value: part.item_management_activity,
                      },
                      {
                        label: "Acquisition Advice Code",
                        value: part.acquisition_advice_code,
                      },
                      {
                        label: "Primary Inventory Ctrl Activity",
                        value: part.primary_inventory_control_activity,
                      },
                      {
                        label: "PICA Level of Authority",
                        value: part.pica_level_of_authority,
                      },
                      {
                        label: "Secondary Inventory Ctrl Activity",
                        value: part.secondary_inventory_control_activity,
                      },
                      {
                        label: "SICA Level of Authority",
                        value: part.sica_level_of_authority,
                      },
                      { label: "Submitter", value: part.submitter },
                      {
                        label: "Authorized Collaborator",
                        value: part.authorized_collaborator,
                      },
                      {
                        label: "Supporting Collaborator",
                        value: part.supporting_collaborator,
                      },
                      {
                        label: "Authorized Receiver",
                        value: part.authorized_receiver,
                      },
                      {
                        label: "Supporting Receiver",
                        value: part.supporting_receiver,
                      },
                      {
                        label: "Designated Support Point",
                        value: part.designated_support_point,
                      },
                      { label: "Former MOE Rule", value: part.former_moe_rule },
                      { label: "Date Assigned", value: part.date_assigned },
                      { label: "MOE Rule (FLIS)", value: part.moe_rule_vfm },
                      { label: "AAC", value: part.aac },
                      { label: "SOSM", value: part.sosm },
                      { label: "Unit of Issue", value: part.unit_of_issue },
                      {
                        label: "Controlled Inventory Code",
                        value: part.controlled_inventory_code,
                      },
                      { label: "Shelf Life", value: part.shelf_life_code },
                      {
                        label: "Replenishment Code",
                        value: part.replenishment_code,
                      },
                      {
                        label: "Mgmt Control Code",
                        value: part.management_control_code,
                      },
                      { label: "Use Status", value: part.use_status_code },
                      {
                        label: "Effective Date",
                        value: part.row_effective_date,
                      },
                      {
                        label: "Row Observation Date (FM)",
                        value: part.row_obs_date_fm,
                      },
                      {
                        label: "Row Observation Date (MR)",
                        value: part.row_obs_date_mr,
                      },
                      { label: "Code", value: part.code },
                      {
                        label: "Literal",
                        value: capitalizeWords(part.literal),
                      },
                      {
                        label: "Description",
                        value: capitalizeWords(part.description),
                      },
                      { label: "Regs", value: capitalizeWords(part.regs) },
                      { label: "MRC", value: part.mrc },
                      {
                        label: "Requirements Statement",
                        value: part.requirements_statement,
                      },
                      {
                        label: "Clear Text Reply",
                        value: part.clear_text_reply,
                      },
                      { label: "NIIN Formatted", value: part.niin_formatted },

                      // v_h6_name_inc
                      { label: "INC Status", value: part.inc_status },
                      { label: "Concept No", value: part.concept_no },
                      { label: "FIIG", value: part.fiig },
                      { label: "APP Key", value: part.app_key },
                      { label: "Condition Code", value: part.cond_code },
                      { label: "Type Code", value: part.type_code },
                      {
                        label: "Establish/Cancel Date",
                        value: part.dt_estb_canc
                          ? moment(new Date(part.dt_estb_canc)).format(
                              "M/DD/YYYY"
                            )
                          : undefined,
                      },
                      {
                        label: "Definition",
                        value: capitalizeWords(part.definition),
                      },

                      { label: "Related INC", value: part.related_inc },
                      {
                        label: "Related Item Name",
                        value: capitalizeWords(part.related_item_name),
                      },
                    ]
                      .filter((row) => isDefined(row.value))
                      .map((row, i) => (
                        <TableRow key={i}>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            {row.label}
                          </TableCell>
                          <TableCell>{row.value}</TableCell>
                        </TableRow>
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
