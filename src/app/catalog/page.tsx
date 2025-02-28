import { Container, Typography, Card, CardContent } from "@mui/material";
import Link from "next/link";

async function fetchGroups() {
  const res = await fetch("http://localhost:3000/api/groups");
  if (!res.ok) throw new Error("Failed to fetch groups");
  return res.json();
}

export default async function CatalogPage() {
  const groups = await fetchGroups();

  return (
    <Container>
      <Typography variant="h2">Product Categories</Typography>
      {groups.map((group) => (
        <Card key={group.id} sx={{ marginY: 2 }}>
          <CardContent>
            <Typography variant="h5">{group.name}</Typography>
            <Link href={`/catalog/${group.id}/${group.name.toLowerCase().replace(/\s+/g, "-")}`}>
              View Products
            </Link>
          </CardContent>
        </Card>
      ))}
    </Container>
  );
}
