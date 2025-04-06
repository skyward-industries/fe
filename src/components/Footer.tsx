import { Box, Typography, Link, Stack } from "@mui/material";
import NextLink from "next/link";

export default function Footer() {
  return (
    <Box sx={{ textAlign: "center", py: 4, mt: 4, borderTop: "1px solid grey" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="center"
        alignItems="center"
        sx={{ mb: 1 }}
      >
        <Link component={NextLink} href="/about" underline="hover" color="text.secondary">
          About
        </Link>
        <Link component={NextLink} href="/contact" underline="hover" color="text.secondary">
          Contact
        </Link>
        <Link component={NextLink} href="/terms-and-conditions" underline="hover" color="text.secondary">
          Terms & Conditions
        </Link>
        <Link component={NextLink} href="/privacy-policy" underline="hover" color="text.secondary">
          Privacy Policy
        </Link>
      </Stack>
      <Typography variant="body2" color="text.secondary">
        © {new Date().getFullYear()} Skyward Parts. All rights reserved.
      </Typography>
    </Box>
  );
}
