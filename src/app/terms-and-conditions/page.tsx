import React from 'react';
import Head from 'next/head';
import { Container, Typography, Box, List, ListItem, Link, Divider } from '@mui/material';

export default function TermsAndConditions() {
  return (
    <Container maxWidth="md" sx={{ py: 6, overflowY: "scroll", height: "70vh" }}>
      <Head>
        <title>Terms and Conditions | Skyward Industries, LLC</title>
        <meta name="description" content="Terms and Conditions for Skyward Industries, LLC" />
      </Head>

      <Typography variant="h3" gutterBottom>
        Terms and Conditions
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Last updated: April 01, 2025
      </Typography>

      <Box mb={4}>
        <Typography paragraph>
          Please read these terms and conditions carefully before using Our Service.
        </Typography>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          Interpretation and Definitions
        </Typography>

        <Typography variant="h6" gutterBottom>
          Interpretation
        </Typography>
        <Typography paragraph>
          The words of which the initial letter is capitalized have meanings defined under the following conditions.
        </Typography>

        <Typography variant="h6" gutterBottom>
          Definitions
        </Typography>
        <List>
          <ListItem><strong>Affiliate:</strong>&nbsp;An entity that controls, is controlled by or is under common control with a party...</ListItem>
          <ListItem><strong>Country:</strong>&nbsp;Florida, United States</ListItem>
          <ListItem><strong>Company:</strong>&nbsp;Refers to Skyward Industries, LLC, 449 Blakey Blvd.</ListItem>
          <ListItem><strong>Device:</strong>&nbsp;Any device that can access the Service.</ListItem>
          <ListItem><strong>Service:</strong>&nbsp;Refers to the Website.</ListItem>
          <ListItem><strong>Terms and Conditions:</strong>&nbsp;These Terms that form the agreement between You and the Company.</ListItem>
          <ListItem><strong>Third-party Social Media Service:</strong>&nbsp;Any third-party services or content available via the Service.</ListItem>
          <ListItem><strong>Website:</strong>&nbsp;Refers to Skyward Industries, LLC, accessible from Skywardparts.com</ListItem>
          <ListItem><strong>You:</strong>&nbsp;The individual or entity using the Service.</ListItem>
        </List>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          Acknowledgment
        </Typography>
        <Typography paragraph>
          These Terms govern your use of this Service and form a binding agreement between you and the Company.
        </Typography>
        <Typography paragraph>
          By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part, you may not access the Service.
        </Typography>
        <Typography paragraph>
          You must be over 18 to use the Service.
        </Typography>
        <Typography paragraph>
          Your use is also governed by our <Link href="/privacy-policy">Privacy Policy</Link>.
        </Typography>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          Links to Other Websites
        </Typography>
        <Typography paragraph>
          We are not responsible for content, policies, or practices of third-party websites or services.
        </Typography>
      </Box>

      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          Termination
        </Typography>
        <Typography paragraph>
          We may terminate your access at any time without notice if you breach these Terms.
        </Typography>
      </Box>

      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          Limitation of Liability
        </Typography>
        <Typography paragraph>
          Company liability is limited to the amount paid through the Service or $100. We are not liable for indirect or consequential damages to the extent allowed by law.
        </Typography>
      </Box>

      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          {`"AS IS" and "AS AVAILABLE" Disclaimer`}
        </Typography>
        <Typography paragraph>
          The Service is provided without warranties of any kind. We do not guarantee uninterrupted or error-free operation.
        </Typography>
      </Box>

      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          Governing Law and Dispute Resolution
        </Typography>
        <Typography paragraph>
          All disputes shall be resolved in Brevard County, Florida. You waive rights to jury trials and class actions.
        </Typography>
      </Box>

      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          Severability and Waiver
        </Typography>
        <Typography paragraph>
          If a provision is found unenforceable, the rest remain effective. Failure to enforce a right does not waive it.
        </Typography>
      </Box>

      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          Changes to These Terms and Conditions
        </Typography>
        <Typography paragraph>
          We reserve the right to modify these Terms at any time. Continued use after changes means you accept them.
        </Typography>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Box>
        <Typography variant="h5" gutterBottom>
          Contact Us
        </Typography>
        <Typography paragraph>
          If you have any questions about these Terms and Conditions, You can contact us:
        </Typography>
        <List>
          <ListItem>
            By email: <Link href="mailto:Admin@skywardparts.com">Admin@skywardparts.com</Link>
          </ListItem>
        </List>
      </Box>
    </Container>
  );
}
