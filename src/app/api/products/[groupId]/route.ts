import { NextResponse } from "next/server";

const products = {
  "1": [
    { id: "101", name: "Laptop", price: "$1200" },
    { id: "102", name: "Smartphone", price: "$800" },
  ],
  "2": [
    { id: "201", name: "Vacuum Cleaner", price: "$200" },
    { id: "202", name: "Air Conditioner", price: "$500" },
  ],
};

// ✅ Fix: Ensure params exist before using them
export async function GET(_, props: { params?: Promise<{ groupId?: string }> }) {
  const params = await props.params;
  if (!params?.groupId) {
    return NextResponse.json({ error: "Missing groupId parameter" }, { status: 400 });
  }

  const groupProducts = products[params.groupId] || [];

  return NextResponse.json(groupProducts);
}
