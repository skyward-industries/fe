"use client";

import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from "@mui/material";
import { useSelection } from "@/context/SelectionContext";

export default function CartPage() {
  const { selectedItems, removeItem, clearSelection } = useSelection();

  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
        Selected Products
      </Typography>

      {selectedItems.length === 0 ? (
        <Typography textAlign="center">No items selected.</Typography>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product Name</TableCell>
                  <TableCell>NSN</TableCell>
                  <TableCell>Part Number</TableCell>
                  <TableCell>Remove</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.nsn || "N/A"}</TableCell>
                    <TableCell>{item.partNumber || "N/A"}</TableCell>
                    <TableCell>
                      <Button variant="outlined" color="error" size="small" onClick={() => removeItem(item.id)}>
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Submission Form */}
          <Button variant="contained" color="primary" sx={{ mt: 3 }} fullWidth>
            Submit Request
          </Button>
          <Button variant="outlined"  sx={{ mt: 2 }} fullWidth onClick={clearSelection}>
            Clear Selection
          </Button>
        </>
      )}
    </Container>
  );
}
