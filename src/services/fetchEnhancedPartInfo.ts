import { Part } from './fetchPartInfo';

// Function to fetch enhanced part information for a given NSN
export async function fetchEnhancedPartInfo(nsn: string): Promise<Part[]> {
  try {
    const res = await fetch(`${process.env.INTERNAL_API_URL || 'http://localhost:3000'}/api/partInfo/enhanced/${nsn}`);

    if (!res.ok) {
      const errorData = await res.text();
      throw new Error(`API responded with status ${res.status}. Response: ${errorData}`);
    }

    const data: Part[] = await res.json();
    return data;
  } catch (error: any) {
    console.error("Error fetching enhanced part info in service:", error);
    throw new Error(`Failed to retrieve enhanced NSN part details: ${error.message}`);
  }
}