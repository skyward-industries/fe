import { NextResponse } from "next/server";

// Mock product categories data
const categories = [
  {
    id: "1",
    name: "Aircraft Components",
    description: "Precision parts and systems for aircraft maintenance and operations.",
    totalProducts: 3,
  },
  {
    id: "2",
    name: "Radar & Communication Systems",
    description: "Advanced radar, antenna, and communication technologies.",
    totalProducts: 2,
  },
  {
    id: "3",
    name: "Navigation & Tactical Equipment",
    description: "Cutting-edge GPS, tactical radios, and military-grade navigation devices.",
    totalProducts: 2,
  },
];

// API endpoint for fetching all product categories
export async function GET() {
  return NextResponse.json(categories);
}
