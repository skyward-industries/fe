import { notFound } from "next/navigation";
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
  Button,
} from "@mui/material";
import Link from "next/link";
import { fetchSubgroups, Subgroup } from "@/services/fetchSubgroups"; // Function to fetch subgroups

interface SubgroupPageProps {
  params: Promise<{ groupId: string; groupName: string }>;
}
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { groupId: string; groupName: string };
}): Promise<Metadata> {
  const decodedName = decodeURIComponent(params.groupName.replaceAll("-", " "));
  const title = `${decodedName} Categories | Skyward Industries`;
  const description = `Explore NSN subcategories under ${decodedName}. Find FSC groups related to ${decodedName} in the Skyward Industries catalog.`;

  const canonicalUrl = `https://skywardparts.com/catalog/${params.groupId}/${params.groupName}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Skyward Parts",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function SubgroupPage(props: SubgroupPageProps) {
  const params = await props.params;
  const { groupId, groupName } = params;
  const subgroups: Subgroup[] = await fetchSubgroups(groupId);
  if (!subgroups || subgroups.length === 0) {
    notFound();
  }

  return (
    <Container maxWidth="xl" sx={{ my: 4 }}>
      <Typography
        variant="h4"
        fontWeight="bold"
        textAlign="center"
        gutterBottom
      >
        {decodeURIComponent(groupName.replaceAll("-", " ").replace(/\b\w/g, (char) => char.toUpperCase()))}
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        textAlign="center"
        gutterBottom
      >
        Explore the categories under{" "}
        {decodeURIComponent(groupName.replaceAll("-", " "))}.
      </Typography>
      <TableContainer
        component={Paper}
        sx={{ maxHeight: "70vh", overflowY: "auto", borderRadius: 2 }}
      >
        <Table stickyHeader>
          <TableHead sx={{ backgroundColor: "primary.dark" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                Subgroup Name
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", color: "white", textAlign: "center" }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subgroups.map((subgroup) => (
              <TableRow key={subgroup.id} hover>
                <TableCell>{subgroup.fsc_title}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    sx={{ fontWeight: "bold" }}
                  >
                    <Link
                      href={`/catalog/${groupId}/${encodeURIComponent(groupName)
                        .replace(/\s+/g, "-")
                        ?.replace(/,/g, "")
                        ?.toLowerCase()}/${
                        subgroup.fsc
                      }/nsn-${encodeURIComponent(
                        subgroup.fsc_title
                          ?.replace(/\s+/g, "-")
                          ?.replace(/,/g, "")
                          ?.toLowerCase()
                      )}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      View NSN
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
