export interface Subgroup {
  id: string;
  fsg: string;
  fsc: string;
  fsg_title: string;
  fsg_notes?: string | null;
  fsc_title: string;
  fsc_notes?: string | null;
  fsc_inclusions?: string | null;
  fsc_exclusions?: string | null;
}

export async function fetchSubgroups(fsg: string) {
  const baseUrl = process.env.INTERNAL_API_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/subgroups/${fsg}`);
  if (!res.ok) throw new Error('Failed to fetch subgroups');
  return res.json();
}
