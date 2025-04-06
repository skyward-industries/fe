import {
  Box,
  Container,
  Divider,
  Link,
  List,
  ListItem,
  Typography,
} from "@mui/material";
import Head from "next/head";

export default function PrivacyPolicy() {
  return (
    <Container maxWidth="md" sx={{ py: 6, height: "70vh", overflowY: "scroll" }}>
      <Head>
        <title>Privacy Policy | Skyward Industries, LLC</title>
        <meta
          name="description"
          content="Privacy Policy for Skyward Industries, LLC"
        />
      </Head>

      <Typography variant="h3" gutterBottom>
        Privacy Policy
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Last updated: April 01, 2025
      </Typography>

      <Box mb={4}>
        <Typography paragraph>
          This Privacy Policy describes Our policies and procedures on the
          collection, use and disclosure of Your information when You use the
          Service and tells You about Your privacy rights and how the law
          protects You.
        </Typography>
        <Typography paragraph>
          We use Your Personal data to provide and improve the Service. By using
          the Service, You agree to the collection and use of information in
          accordance with this Privacy Policy.
        </Typography>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h5" gutterBottom>
        Interpretation and Definitions
      </Typography>
      <Typography variant="h6">Interpretation</Typography>
      <Typography paragraph>
        The words of which the initial letter is capitalized have meanings
        defined under the following conditions. The following definitions shall
        have the same meaning regardless of whether they appear in singular or
        in plural.
      </Typography>

      <Typography variant="h6">Definitions</Typography>
      <List>
        <ListItem>
          Account: A unique account created for You to access our Service or
          parts of our Service.
        </ListItem>
        <ListItem>
          Affiliate: An entity that controls, is controlled by or is under
          common control with a party...
        </ListItem>
        <ListItem>
          Company: Refers to Skyward Industries, LLC, 449 Blakey Blvd, Cocoa
          Beach.
        </ListItem>
        <ListItem>
          Cookies: Small files placed on Your computer or device that store
          browsing history and more.
        </ListItem>
        <ListItem>Country: Florida, United States</ListItem>
        <ListItem>
          Device: Any device that can access the Service such as a computer,
          cellphone or tablet.
        </ListItem>
        <ListItem>
          Personal Data: Information that relates to an identified or
          identifiable individual.
        </ListItem>
        <ListItem>Service: Refers to the Website.</ListItem>
        <ListItem>
          Service Provider: Third parties who process data on behalf of the
          Company.
        </ListItem>
        <ListItem>
          Usage Data: Data collected automatically through the Service.
        </ListItem>
        <ListItem>
          Website: Refers to Skyward Industries, LLC, accessible from
          skywardparts.com
        </ListItem>
        <ListItem>
          You: The individual using the Service or the legal entity on behalf of
          which such individual is accessing or using the Service.
        </ListItem>
      </List>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h5" gutterBottom>
        Collecting and Using Your Personal Data
      </Typography>
      <Typography variant="h6">Types of Data Collected</Typography>

      <Typography variant="subtitle1" gutterBottom>
        Personal Data
      </Typography>
      <Typography paragraph>
        While using Our Service, We may ask You to provide Us with certain
        personally identifiable information such as:
      </Typography>
      <List>
        <ListItem>Email address</ListItem>
        <ListItem>First name and last name</ListItem>
        <ListItem>Phone number</ListItem>
        <ListItem>Usage Data</ListItem>
      </List>

      <Typography variant="subtitle1" gutterBottom>
        Usage Data
      </Typography>
      <Typography paragraph>
        Usage Data is collected automatically and may include device IP address,
        browser type/version, pages visited, time/date of visit, time spent, and
        diagnostics.
      </Typography>

      <Typography paragraph>
        Additional mobile device data may include device type, ID, IP, OS,
        browser type, and diagnostic information.
      </Typography>

      <Typography variant="h6" gutterBottom>
        Tracking Technologies and Cookies
      </Typography>
      <Typography paragraph>
        We use Cookies and similar tracking technologies including:
      </Typography>
      <List>
        <ListItem>
          <strong>Browser Cookies:</strong> Refuse or allow via your browser
          settings.
        </ListItem>
        <ListItem>
          <strong>Web Beacons:</strong> Used for analytics and email open stats.
        </ListItem>
      </List>

      <Typography paragraph>
        Cookies may be Persistent or Session. We use both for purposes like
        session maintenance, consent tracking, and preferences.
      </Typography>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6">Use of Your Personal Data</Typography>
      <Typography paragraph>The Company may use your data to:</Typography>
      <List>
        <ListItem>Provide and maintain the Service</ListItem>
        <ListItem>Manage your Account</ListItem>
        <ListItem>Fulfill contracts and transactions</ListItem>
        <ListItem>Contact you (email, SMS, etc.)</ListItem>
        <ListItem>Provide promotional materials (opt-out available)</ListItem>
        <ListItem>Analyze usage and improve offerings</ListItem>
        <ListItem>Transfer during business transactions</ListItem>
      </List>

      <Typography variant="h6">Retention of Your Personal Data</Typography>
      <Typography paragraph>
        Data is retained only as long as necessary, or longer if legally
        required.
      </Typography>

      <Typography variant="h6">Transfer of Your Personal Data</Typography>
      <Typography paragraph>
        Your data may be transferred and processed outside your jurisdiction
        with appropriate safeguards in place.
      </Typography>

      <Typography variant="h6">Delete Your Personal Data</Typography>
      <Typography paragraph>
        You can request deletion or access by logging into your account or
        contacting us.
      </Typography>

      <Typography variant="h6">Disclosure of Your Personal Data</Typography>
      <List>
        <ListItem>Business Transactions</ListItem>
        <ListItem>Law Enforcement (with valid legal request)</ListItem>
        <ListItem>
          Other Legal Requirements (e.g. public safety, fraud protection)
        </ListItem>
      </List>

      <Typography variant="h6">Security of Your Personal Data</Typography>
      <Typography paragraph>
        We strive to protect your data, but no method is 100% secure.
      </Typography>

      <Typography variant="h6">{"Children's Privacy"}</Typography>
      <Typography paragraph>
        We do not knowingly collect data from anyone under 13. Parents can
        contact us to remove such data.
      </Typography>

      <Typography variant="h6">Links to Other Websites</Typography>
      <Typography paragraph>
        We are not responsible for the content or practices of third-party
        sites.
      </Typography>

      <Typography variant="h6">Changes to this Privacy Policy</Typography>
      <Typography paragraph>
        {`Updates will be posted here with an updated "Last updated" date. You should review this page periodically.`}
      </Typography>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h5" gutterBottom>
        Contact Us
      </Typography>
      <Typography paragraph>
        If you have any questions about this Privacy Policy, you can contact us:
      </Typography>
      <List>
        <ListItem>
          By email:{" "}
          <Link href="mailto:Admin@skywardparts.com">
            Admin@skywardparts.com
          </Link>
        </ListItem>
      </List>
    </Container>
  );
}
