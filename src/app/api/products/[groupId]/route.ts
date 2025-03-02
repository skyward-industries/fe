import { NextResponse } from "next/server";

// Mock product data with groupId included
const products = {
  "1": [
    {
      id: "101",
      name: "Hydraulic Filter Element",
      nsn: "1650-00-127-8507",
      partNumber: "HF-8507",
      manufacturer: "Parker Aerospace",
      price: "$245.99",
      availability: "In Stock",
      groupId: "1",
    },
    {
      id: "102",
      name: "Aviation Fuel Pump",
      nsn: "2915-01-092-9850",
      partNumber: "FP-9850",
      manufacturer: "Eaton Corporation",
      price: "$1,295.00",
      availability: "Low Stock",
      groupId: "1",
    },
  ],
  "2": [
    {
      id: "201",
      name: "Radar Antenna Assembly",
      nsn: "5840-01-432-1115",
      partNumber: "RAA-1115",
      manufacturer: "Raytheon Technologies",
      price: "$5,950.00",
      availability: "In Stock",
      groupId: "2",
    },
  ],
  "3": [
    {
      id: "301",
      name: "Tactical Communication Radio",
      nsn: "5820-01-370-4460",
      partNumber: "TCR-4460",
      manufacturer: "Harris Corporation",
      price: "$8,200.00",
      availability: "In Stock",
      groupId: "3",
    },
  ],
};

// API endpoint for fetching products based on `groupId`
export async function GET(_, props: { params: Promise<{ groupId: string }> }) {
  const params = await props.params;
  if (!params?.groupId) {
    return NextResponse.json({ error: "Missing groupId parameter" }, { status: 400 });
  }

  return NextResponse.json(products[params.groupId] || []);
}
