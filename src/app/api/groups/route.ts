import { NextResponse } from "next/server";

// Mock categories
const groups = [
  { id: "1", name: "Electronics" },
  { id: "2", name: "Home Appliances" },
];

export async function GET() {
  return NextResponse.json(groups);
}
