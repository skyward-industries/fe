import { notFound } from "next/navigation";
import { Metadata } from "next";
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
import { fetchSubgroups, Subgroup } from "@/services/fetchSubgroups";

interface SubgroupPageProps {
  params: Promise<{ groupId: string; groupName: string }>;
}

// Function to dynamically generate metadata
export async function generateMetadata(props: SubgroupPageProps): Promise<Metadata> {
  const params = await props.params;
  const decodedGroupName = decodeURIComponent(params.groupName.replaceAll("-", " ").replace(/\b\w/g, (char) => char.toUpperCase()));

  return {
    title: `${decodedGroupName} | Subgroups`,
    description: `Explore the subcategories under ${decodedGroupName} at Skyward Industries.`,
    alternates: {
      canonical: `https://www.skywardparts.com/catalog/${params.groupId}/${params.groupName
        .replace(/\s+/g, "-")
        .replace(/,/g, "")
        .toLowerCase()}`,
    },
  };
}

export default async function SubgroupPage(props: SubgroupPageProps) {
  const params = await props.params;
  const { groupId, groupName } = params;
  const decodedGroupName = decodeURIComponent(groupName.replaceAll("-", " ").replace(/\b\w/g, (char) => char.toUpperCase()));
  const subgroups: Subgroup[] = await fetchSubgroups(groupId);

  if (!subgroups || subgroups.length === 0) {
    notFound();
  }

  return (
    <Container maxWidth="xl" sx={{ my: 4 }}>
      <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
        {decodedGroupName}
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" textAlign="center" gutterBottom>
        Explore the categories under {decodedGroupName}.
      </Typography>
      <TableContainer component={Paper} sx={{ maxHeight: "70vh", overflowY: "auto", borderRadius: 2 }}>
        <Table stickyHeader>
          <TableHead sx={{ backgroundColor: "primary.dark" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>Subgroup Name</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subgroups.map((subgroup) => (
              <TableRow key={subgroup.id} hover>
                <TableCell>{subgroup.fsc_title}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  <Button variant="contained" color="primary" size="small" sx={{ fontWeight: "bold" }}>
                    <Link
                      href={`/catalog/${groupId}/${groupName
                        .replace(/\s+/g, "-")
                        .replace(/,/g, "")
                        .toLowerCase()}/${subgroup.fsc}/nsn-${encodeURIComponent(
                        subgroup.fsc_title.replace(/\s+/g, "-").replace(/,/g, "").toLowerCase()
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
