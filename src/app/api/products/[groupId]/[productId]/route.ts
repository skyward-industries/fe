import { NextResponse } from "next/server";

// Mock data with detailed product information, now including groupId
const products = {
  "1": [
    {
      id: "101",
      groupId: "1",
      name: "Filtering Disk Fluid",
      nsn: "1650-00-127-8507",
      partNumber: "01-8507",
      specifications: [
        { characteristic: "Material", value: "Aluminum Alloy 6061-T6" },
        { characteristic: "Fitting Media Drain", value: "Hexagonal Pressing Nozzle" },
        { characteristic: "Body Diameter", value: "5.2 inches" },
        { characteristic: "Finish", value: "Anodized Coating" },
      ],
      freightInfo: [
        { category: "Hazardous", code: "9", description: "Miscellaneous Dangerous Goods" },
        { category: "Weight", code: "30", description: "Lightweight" },
        { category: "Origin", code: "5X", description: "Oklahoma Air Logistics Center" },
      ],
      manufacturers: [{ partNumber: "01-8507", cageCode: "36427", name: "Mock Inc." }],
    },
  ],
  "2": [
    {
      id: "201",
      groupId: "2",
      name: "Radar Antenna Assembly",
      nsn: "5840-01-432-1115",
      partNumber: "RAA-1115",
      specifications: [
        { characteristic: "Frequency Range", value: "8.5 - 12.5 GHz" },
        { characteristic: "Beamwidth", value: "2.5°" },
      ],
      freightInfo: [
        { category: "Hazardous", code: "N/A", description: "Safe for air transport" },
        { category: "Weight", code: "32kg", description: "Heavy-duty packaging" },
      ],
      manufacturers: [{ partNumber: "RAA-1115", cageCode: "78234", name: "Raytheon Technologies" }],
    },
  ],
};

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
