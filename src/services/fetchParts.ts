export interface Part {
  id: string;
  nsn: string;
  fsg: string;
  fsc: string;
  fsc_title: string;
  fsg_title: string;
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

export async function fetchParts(fsc: string, page = 1, limit = 100) {
  const baseUrl = process.env.INTERNAL_API_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/parts/${fsc}?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch parts');
  return res.json();
}
