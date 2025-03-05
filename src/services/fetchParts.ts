export interface Part {
  id: string;
  nsn: string;
  fsg: string;
  fsc: string;
}

export interface Pagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface PartResponse {
  data: Part[];
  pagination: Pagination;
}

export async function fetchParts(fsc: string, page: number = 1, limit: number = 100): Promise<PartResponse> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/parts/${fsc}?page=${page}&limit=${limit}`);

    if (!res.ok) {
      throw new Error(`Failed to fetch parts: ${res.statusText}`);
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching parts:", error);
    throw new Error("Failed to fetch part list");
  }
}
