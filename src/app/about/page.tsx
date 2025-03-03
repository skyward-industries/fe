import { Container, Typography, Grid, Card, CardContent, Box, Divider } from "@mui/material";

export default function AboutPage() {
  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      {/* Title Section */}
      <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
        About Skyward Industries
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" textAlign="center" gutterBottom>
        Leading the way in aerospace, defense, and industrial supply solutions.
      </Typography>

      <Divider sx={{ my: 4 }} />

      {/* Mission & Values Section */}
      <Grid container spacing={4}>
        {/* Our Mission */}
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Our Mission
              </Typography>
              <Typography color="textSecondary">
                At Skyward Industries, we are committed to delivering cutting-edge aerospace and defense components
                to our clients. Our focus is on quality, reliability, and ensuring mission success.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Our Values */}
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Our Values
              </Typography>
              <Typography color="textSecondary">
                Integrity, precision, and innovation drive us forward. We prioritize customer satisfaction,
                ethical sourcing, and sustainability in all our operations.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Company Details Section */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
          Company Overview
        </Typography>
        <Typography variant="body1" color="textSecondary" textAlign="center" sx={{ mx: "auto", maxWidth: "800px" }}>
          Skyward Industries specializes in providing high-quality parts for aerospace, military, and industrial
          applications. With a global reach and an extensive inventory, we support defense contractors, airlines,
          and manufacturing companies worldwide.
        </Typography>
      </Box>

      {/* Contact Information */}
      <Box sx={{ mt: 6, textAlign: "center" }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Contact Us
        </Typography>
        <Typography variant="body1" color="textSecondary">
          📍 123 Aerospace Blvd, Houston, TX 77001
        </Typography>
        <Typography variant="body1" color="textSecondary">
          ✉️ Email: contact@skywardindustries.com
        </Typography>
        <Typography variant="body1" color="textSecondary">
          📞 Phone: +1 (555) 123-4567
        </Typography>
      </Box>
    </Container>
  );
}
