// src/services/fetchGroups.ts
import { getGroups as dbGetGroups } from '@/lib/db'; // Import the db function directly

/**
 * Defines the TypeScript interface for a single product group.
 * This should match the columns returned by your `getGroups` SQL query.
 */
export interface Group {
  fsg: string;
  fsg_title: string;
  description: string | null;
}

/**
 * Fetches unique product groups directly from the database.
 * This is the modern, efficient App Router pattern.
 *
 * @returns {Promise<Group[]>} A promise that resolves to an array of unique Group objects.
 */
export async function fetchGroups(): Promise<Group[]> {
  try {
    // Directly call the database function. No API round-trip needed.
    const groups = await dbGetGroups();
    return groups as Group[]; // Cast the result to our defined Group interface
  } catch (error) {
    console.error("Error fetching groups in service layer:", error);
    // Re-throw the error to be handled by Next.js's error boundary
    throw new Error('Failed to retrieve product groups.');
  }
}