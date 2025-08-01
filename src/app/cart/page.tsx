"use client";
// @ts-ignore
import { useSelection } from "@/context/SelectionContext";
// @ts-ignore
import { PartInfo } from "@/services/fetchPartInfo";
import {
  Button,
  Container,
  Grid,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { FieldValues, useForm } from "react-hook-form";

export default function CartPage() {
  const { selectedItems, removeItem, clearSelection } = useSelection();
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm();

  const [customParts, setCustomParts] = useState<PartInfo[]>([
    { part_number: "", description: "", date_est: "" },
  ]);

  const [quantities, setQuantities] = useState<{ [key: string]: number }>(
    [...selectedItems, ...customParts].reduce((acc, item) => {
      acc[item.part_number] = 1;
      return acc;
    }, {} as { [key: string]: number })
  );

  const [description, setDescription] = useState<{ [key: string]: string }>(
    [...selectedItems, ...customParts].reduce((acc, item) => {
      acc[item.part_number] = "";
      return acc;
    }, {} as { [key: string]: number })
  );

  const [condition, setCondition] = useState<{ [key: string]: string }>(
    [...selectedItems, ...customParts].reduce((acc, item) => {
      acc[item.part_number] = "";
      return acc;
    }, {} as { [key: string]: string })
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuantityChange = (partNumber: string, value: string) => {
    setQuantities((prev) => ({ ...prev, [partNumber]: Number(value) }));
  };

  const handleDescriptionChange = (partNumber: string, value: string) => {
    setDescription((prev) => ({ ...prev, [partNumber]: value }));
  };

  const handleConditionChange = (partNumber: string, value: string) => {
    setCondition((prev) => ({ ...prev, [partNumber]: value }));
  };

  const handleCustomPartChange = (
    index: number,
    field: keyof PartInfo,
    value: string
  ) => {
    const updatedParts = [...customParts];
    updatedParts[index][field] = value;
    setCustomParts(updatedParts);
  };

  const addCustomPart = () => {
    setCustomParts([
      ...customParts,
      {
        part_number: null,
        description: null,
        date_est: null,
        condition: null,
        quantity: 1,
      },
    ]);
  };

  const removeCustomPart = (index: number) => {
    setCustomParts(customParts.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FieldValues) => {
    setIsSubmitting(true);

    const submissionData = {
      items: [...selectedItems, ...customParts].map((item) => ({
        ...item,
        condition: condition[item.part_number] || "",
        quantity: quantities[item.part_number] || 1,
      })),
      form: data,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/send-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submissionData),
        }
      );
      if (!response.ok) throw new Error("Submission failed");
      reset();
      clearSelection();
      setCustomParts([{ part_number: "", description: "", date_est: "" }]);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Container maxWidth="lg" sx={{ my: 4 }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          textAlign="center"
          gutterBottom
        >
          Selected Parts
        </Typography>

        <TableContainer
          component={Paper}
          sx={{ mt: 2, maxHeight: "40vh", overflowY: "scroll" }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Part Number</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Condition</TableCell>
                <TableCell>Remove</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedItems.map((item: PartInfo) => (
                <TableRow key={item.part_number}>
                  <TableCell>{item.part_number}</TableCell>
                  <TableCell>
                    <TextField
                      value={description[item.part_number]}
                      onChange={(e) =>
                        handleDescriptionChange(item.part_number, e.target.value)
                      }
                      placeholder="Description"
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={quantities[item.part_number]}
                      onChange={(e) =>
                        handleQuantityChange(item.part_number, e.target.value)
                      }
                      inputProps={{ min: 1 }}
                      sx={{ width: 80 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      displayEmpty
                      value={condition[item.part_number] || ""}
                      onChange={(e) =>
                        handleConditionChange(item.part_number, e.target.value)
                      }
                    >
                      <MenuItem value="">Select</MenuItem>
                      <MenuItem value="Any">Any</MenuItem>
                      <MenuItem value="FN">FN</MenuItem>
                      <MenuItem value="NS">NS</MenuItem>
                      <MenuItem value="OH">OH</MenuItem>
                      <MenuItem value="SV">SV</MenuItem>
                      <MenuItem value="AR">AR</MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => removeItem(item.part_number)}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {customParts.map((part, index) => (
                <TableRow key={`custom-${index}`}>
                  <TableCell>
                    <TextField
                      value={part.part_number}
                      onChange={(e) =>
                        handleCustomPartChange(
                          index,
                          "part_number",
                          e.target.value
                        )
                      }
                      placeholder="Enter Part Number"
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={description[part.part_number] || ""}
                      onChange={(e) =>
                        handleDescriptionChange(part.part_number, e.target.value)
                      }
                      placeholder="Description"
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={quantities[part.part_number] || 1}
                      onChange={(e) =>
                        handleQuantityChange(part.part_number, e.target.value)
                      }
                      inputProps={{ min: 1 }}
                      sx={{ width: 80 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      displayEmpty
                      value={condition[part.part_number] || ""}
                      onChange={(e) =>
                        handleConditionChange(part.part_number, e.target.value)
                      }
                    >
                      <MenuItem value="">Select Condition</MenuItem>
                      <MenuItem value="Any">Any</MenuItem>
                      <MenuItem value="FN">FN</MenuItem>
                      <MenuItem value="NS">NS</MenuItem>
                      <MenuItem value="OH">OH</MenuItem>
                      <MenuItem value="SV">SV</MenuItem>
                      <MenuItem value="AR">AR</MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => removeCustomPart(index)}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={addCustomPart}
        >
          Add Custom Part
        </Button>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone Number"
                fullWidth
                {...register("phoneNumber")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email *"
                type="email"
                fullWidth
                {...register("email", { required: "Email is required" })}
                error={!!errors.email}
                helperText={errors.email?.message as string}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="First Name"
                fullWidth
                {...register("firstName", { required: "First Name is required" })}
                error={!!errors.firstName}
                helperText={errors.firstName?.message as string}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Last Name"
                fullWidth
                {...register("lastName", { required: "Last Name is required" })}
                error={!!errors.lastName}
                helperText={errors.lastName?.message as string}
              />{" "}
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Lead Time" fullWidth {...register("leadTime")} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Company Name"
                fullWidth
                {...register("companyName", {
                  required: "Company Name is required",
                })}
                error={!!errors.companyName}
                helperText={errors.companyName?.message as string}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Container>
      <Typography variant="h6" color="textSecondary" align="center" sx={{ mt: 6, fontWeight: 'bold' }}>
        For any questions please contact <a href="mailto:sales@skywardparts.com" style={{ color: 'inherit', textDecoration: 'underline', fontWeight: 'bold' }}>sales@skywardparts.com</a>
      </Typography>
    </>
  );
}
