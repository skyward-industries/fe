// @ts-ignore
import { fetchSubgroups, Subgroup } from "@/services/fetchSubgroups";
// @ts-ignore
import { capitalizeWords } from "@/utils/capitalizeWords";
// @ts-ignore
import { slugify } from "@/utils/slugify";
// @ts-ignore
import { ArrowLeft } from "@mui/icons-material";
import {
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

interface SubgroupPageProps {
  params: Promise<{ groupId: string; groupName: string }>;
}

// Function to dynamically generate metadata
export async function generateMetadata(
  props: SubgroupPageProps
): Promise<Metadata> {
  const params = await props.params;
  const decodedGroupName = params.groupName
    .replaceAll("-", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
  return {
    title: `${decodedGroupName} | Subgroups`,
    description: `Explore the subcategories under ${decodedGroupName} at Skyward Industries.`,
    alternates: {
      canonical: `https://www.skywardparts.com/catalog/${
        params.groupId
      }/${slugify(params.groupName)}`,
    },
  };
}

export default async function SubgroupPage(props: SubgroupPageProps) {
  const params = await props.params;
  const { groupId, groupName } = params;
  const decodedGroupName = groupName
    .replaceAll("-", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
  const subgroups: Subgroup[] = await fetchSubgroups(groupId);

  if (!subgroups || subgroups.length === 0) {
    notFound();
  }
  const uniqueSubgroups = Array.from(
  new Map(subgroups.map((sg) => [sg.id, sg])).values()
);

  return (
    <Container maxWidth="xl" sx={{ my: 4 }}>
      <Button
        variant="outlined"
        sx={{ mb: 2, fontWeight: "bold" }}
        startIcon={<ArrowLeft />}
      >
        <Link
          href={`/catalog/`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          Back
        </Link>
      </Button>
      <Typography
        variant="h4"
        fontWeight="bold"
        textAlign="center"
        gutterBottom
      >
        {decodedGroupName}
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        textAlign="center"
        gutterBottom
      >
        Explore the categories under {decodedGroupName}.
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
            {uniqueSubgroups.map((subgroup) => (
              <TableRow key={subgroup.id} hover>
                <TableCell>{capitalizeWords(subgroup.fsc_title)}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    sx={{ fontWeight: "bold" }}
                  >
                    <Link
                      href={`/catalog/${groupId}/${slugify(groupName)}/${
                        subgroup.fsc
                      }/${slugify(subgroup.fsc_title)}`}
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
