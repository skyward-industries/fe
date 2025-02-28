import { NextResponse } from "next/server";

const products = {
  "1": [
    { id: "101", name: "Laptop", price: "$1200", description: "16GB RAM, SSD storage." },
    { id: "102", name: "Smartphone", price: "$800", description: "5G, OLED display." },
  ],
  "2": [
    { id: "201", name: "Vacuum Cleaner", price: "$200", description: "HEPA filter, cordless." },
    { id: "202", name: "Air Conditioner", price: "$500", description: "Remote control, energy efficient." },
  ],
};

// ✅ Fix: Ensure params exist before using them
export async function GET(_, props: { params?: Promise<{ groupId?: string; productId?: string }> }) {
  const params = await props.params;
  if (!params?.groupId || !params?.productId) {
    return NextResponse.json({ error: "Missing groupId or productId parameter" }, { status: 400 });
  }

  const groupProducts = products[params.groupId] || [];
  const product = groupProducts.find((p) => p.id === params.productId);

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}
