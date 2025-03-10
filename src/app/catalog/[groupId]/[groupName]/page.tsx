import { notFound } from "next/navigation";
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from "@mui/material";
import Link from "next/link";
import { fetchSubgroups, Subgroup } from "@/services/fetchSubgroups"; // Function to fetch subgroups

interface SubgroupPageProps {
  params: Promise<{ groupId: string; groupName: string }>;
}

export default async function SubgroupPage(props: SubgroupPageProps) {
  const params = await props.params;
  const { groupId, groupName } = params; // Extract groupId and groupName from URL
  const subgroups: Subgroup[] = await fetchSubgroups(groupId); // Fetch subgroups for this group
  // If no subgroups are found, return a 404
  if (!subgroups || subgroups.length === 0) {
    notFound();
  }

  return (
    <Container maxWidth="xl" sx={{ my: 4 }}>
      {/* Page Title */}
      <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
        {decodeURIComponent(groupName.replaceAll("-", " "))}
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" textAlign="center" gutterBottom>
        Explore the categories under {decodeURIComponent(groupName.replaceAll("-", " "))}.
      </Typography>
      {/* Table Display */}
      <TableContainer component={Paper} sx={{ maxHeight: "70vh", overflowY: "auto", borderRadius: 2 }}>
        <Table stickyHeader>
          <TableHead sx={{ backgroundColor: "primary.dark" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>Subgroup Name</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {subgroups.map((subgroup) => {
            console.log("🔗 Constructed URL:", 
          `/catalog/${groupId}/${groupName}/${subgroup.fsc}/${subgroup.fsc_title.replace(/\s+/g, "-").replace(/,/g, "")}`
          );

  return (
    <TableRow key={subgroup.id} hover>
      <TableCell>{subgroup.fsc_title}</TableCell>
      <TableCell sx={{ textAlign: "center" }}>
        <Button variant="contained" color="primary" size="small" sx={{ fontWeight: "bold" }}>
          <Link
            href={`/catalog/${groupId}/${encodeURIComponent(groupName)}/${subgroup.fsc}/${encodeURIComponent(subgroup.fsc_title.replace(/,/g, "").replace(/\s+/g, "-"))}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            View NSN
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  );
})}

          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
