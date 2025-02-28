import { Container, Typography } from "@mui/material";
import Link from "next/link";

// Fetch product details
async function fetchProduct(groupId: string, productId: string) {
  const res = await fetch(`http://localhost:3000/api/products/${groupId}/${productId}`);
  if (!res.ok) throw new Error("Product not found");
  return res.json();
}

export default async function ProductDetailPage(
  props: { params?: Promise<{ groupId?: string; groupName?: string; productId?: string }> }
) {
  const params = await props.params;
  // ✅ Ensure `params` is available before using it
  if (!params?.groupId || !params?.groupName || !params?.productId) {
    return (
      <Container>
        <Typography variant="h2">Invalid Product</Typography>
        <Link href="/catalog">Back to Categories</Link>
      </Container>
    );
  }

  const { groupId, groupName, productId } = params;
  const formattedGroupName = decodeURIComponent(groupName.replace("-", " "));

  // ✅ Fetch product AFTER ensuring params exist
  const product = await fetchProduct(groupId, productId);

  return (
    <Container>
      <Typography variant="h2">{product.name}</Typography>
      <Typography variant="h5">{product.price}</Typography>
      <Typography>{product.description}</Typography>

      {/* ✅ Fix: Ensure params exist before using */}
      <Link href={`/catalog/${groupId}/${groupName}`}>
        Back to {formattedGroupName}
      </Link>
    </Container>
  );
}
