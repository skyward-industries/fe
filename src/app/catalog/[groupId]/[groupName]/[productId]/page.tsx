import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
} from "@mui/material";
import { fetchProductById } from "@/services/fetchProductById";
import SelectionButton from "@/components/Selection";

export default async function ProductDetailPage(props: {
  params: Promise<{ groupId: string; groupName: string; productId: string }>;
}) {
  const params = await props.params;
  const product = await fetchProductById(params.groupId, params.productId);
  const formattedGroupName = decodeURIComponent(
    params.groupName.replace("-", " ")
  );
  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      {/* Product Header */}
      <Box display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
      <Typography variant="h4" fontWeight="bold">
        {product.name}
      </Typography>
      <SelectionButton item={product} />
      </Box>
      <Typography variant="subtitle1" color="textSecondary">
        NSN: {product.nsn} | Part Number: {product.partNumber}
      </Typography>
      <Typography variant="subtitle2">Group: {formattedGroupName}</Typography>
      <Typography sx={{ my: 2 }}>
        Manufacturer: {product.manufacturer}
      </Typography>

      {/* Specifications Table */}
      <Typography variant="h6" sx={{ mt: 3 }}>
        Specifications
      </Typography>
      <TableContainer component={Paper} sx={{ mt: 1 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Characteristic</TableCell>
              <TableCell>Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {product.specifications.map((spec, index) => (
              <TableRow key={index}>
                <TableCell>{spec.characteristic}</TableCell>
                <TableCell>{spec.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Freight Information Table */}
      <Typography variant="h6" sx={{ mt: 3 }}>
        Freight Information
      </Typography>
      <TableContainer component={Paper} sx={{ mt: 1 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Category</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {product.freightInfo.map((info, index) => (
              <TableRow key={index}>
                <TableCell>{info.category}</TableCell>
                <TableCell>{info.code}</TableCell>
                <TableCell>{info.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Cross Reference Table */}
      <Typography variant="h6" sx={{ mt: 3 }}>
        Cross Reference
      </Typography>
      <TableContainer component={Paper} sx={{ mt: 1 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Part Number</TableCell>
              <TableCell>CAGE Code</TableCell>
              <TableCell>Manufacturer</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {product.manufacturers.map((manufacturer, index) => (
              <TableRow key={index}>
                <TableCell>{manufacturer.partNumber}</TableCell>
                <TableCell>{manufacturer.cageCode}</TableCell>
                <TableCell>{manufacturer.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
