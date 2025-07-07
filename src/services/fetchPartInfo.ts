export async function fetchPartInfo(nsn: string): Promise<PartInfo[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/partInfo/${nsn}`);
    if (!res.ok) {
      throw new Error("Part not found");
    }
    return res.json(); // array of parts
  } catch (error) {
    console.error("Error fetching part info:", error);
    throw new Error("Failed to fetch part");
  }
}
