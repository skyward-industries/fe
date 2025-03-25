import Head from "next/head";
import {
  Box,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  Typography,
} from "@mui/material";

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>About Skyward Industries | Aerospace & Defense Supply</title>
        <meta
          name="description"
          content="Skyward Industries is a trusted aerospace, defense, and industrial supply company. We provide high-quality parts with a commitment to rapid service and reliability."
        />
        <link rel="canonical" href="https://www.skywardparts.com/about" />
        <meta property="og:title" content="About Skyward Industries" />
        <meta
          property="og:description"
          content="Skyward Industries is a trusted aerospace, defense, and industrial supply company."
        />
      </Head>

      <Container maxWidth="lg" sx={{ my: 4 }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          textAlign="center"
          gutterBottom
        >
          About Skyward Industries
        </Typography>
        <Typography
          variant="subtitle1"
          color="textSecondary"
          textAlign="center"
          gutterBottom
        >
          Leading the way in aerospace, defense, and industrial supply solutions.
        </Typography>
        <Divider sx={{ my: 4 }} />
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card sx={{ boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Who We Are
                </Typography>
                <Typography color="textSecondary">
                  Skyward Industries was founded by three friends who share a
                  passion for aerospace and a deep-rooted connection to the
                  Space Coast. Recognizing a gap in the industry for a modern
                  and seamless approach to sourcing aerospace parts, we began
                  our company to revolutionize how businesses obtain the
                  components they need. As a small business with a vast network,
                  we pride ourselves on our customer-first approach, ensuring
                  quick turnaround times on quotes and exceptional service that
                  distinguishes us from our competitors.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  What We Do
                </Typography>
                <Typography color="textSecondary">
                  At Skyward Industries, we serve all members of the aerospace
                  industry, from large corporations to small enterprises. Our
                  mission is straightforward: if you need a part, we are here to
                  help. We leverage our extensive network of manufacturers and
                  vendors, cultivated over several years, to source high-quality
                  aerospace parts tailored to our customers specifications. Our
                  commitment to quality ensures that every part we provide meets
                  the highest standards of excellence.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 6 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            textAlign="center"
            gutterBottom
          >
            What We Believe
          </Typography>
          <Typography
            variant="body1"
            color="textSecondary"
            textAlign="center"
            sx={{ mx: "auto", maxWidth: "800px" }}
          >
            At the core of Skyward Industries is a steadfast belief in the
            importance of customer service, rapid response times, and building
            lasting relationships. We understand that trust and reliability are
            paramount in the aerospace industry. Our vision is to foster strong
            connections with our customers, ensuring that we are their trusted
            partner from RFQ all the way to delivery. We aim to be a dependable
            resource in the aerospace sector, committed to exceeding
            expectations at every turn.
          </Typography>
        </Box>

        {/* Contact Information */}
        <Box sx={{ mt: 6, textAlign: "center" }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Contact Us
          </Typography>
          <Typography variant="body1" color="textSecondary">
            📍 449 Blakey Blvd, Cocoa Beach, FL 32931
          </Typography>
          <Typography variant="body1" color="textSecondary">
            ✉️ Email: admin@skywardparts.com
          </Typography>
          <Typography variant="body1" color="textSecondary">
            📞 Phone: +1 (321) 427-9292
          </Typography>
        </Box>
      </Container>
    </>
  );
}
