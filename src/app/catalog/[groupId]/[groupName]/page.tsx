import { Container, Typography, Card, CardContent } from "@mui/material";
import Link from "next/link";

async function fetchProducts(groupId: string) {
  const res = await fetch(`http://localhost:3000/api/products/${groupId}`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export default async function ProductsPage(props: { params: Promise<{ groupId: string; groupName: string }> }) {
  const params = await props.params;
  const products = await fetchProducts(params.groupId);
  const formattedGroupName = decodeURIComponent(params.groupName.replace("-", " "));

  return (
    <Container>
      <Typography variant="h2">{formattedGroupName} Products</Typography>
      {products.map((product) => (
        <Card key={product.id} sx={{ marginY: 2 }}>
          <CardContent>
            <Typography variant="h5">{product.name}</Typography>
            <Typography>{product.price}</Typography>
            <Link href={`/catalog/${params.groupId}/${params.groupName}/${product.id}`}>
              View Details
            </Link>
          </CardContent>
        </Card>
      ))}
      <Link href="/catalog">Back to Categories</Link>
    </Container>
  );
}
