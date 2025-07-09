// src/app/api/nsn-parts/[nsn]/route.ts
// This is an App Router API Route. It runs on the server.

import { NextResponse } from 'next/server';

// @ts-ignore
import { getPartsByNSN } from '@/lib/db'; // Import getPartsByNSN from your db.js file
// Handle GET requests to /api/nsn-parts/[nsn]
export async function GET(request: Request, { params }: { params: { nsn: string } }) {
  // --- SERVER-SIDE DEBUGGING LOG ---
  // This log will appear in your SERVER TERMINAL (where npm run dev is running)
  console.log('API Route: Request received for NSN:', params.nsn);
  // --- END DEBUGGING LOG ---

  try {
    const { nsn } = params; // Extract the NSN from the URL parameters (e.g., '6105-00-858-3626')

    // Basic validation: Ensure NSN parameter is provided
    if (!nsn) {
      console.error('API Route: NSN parameter is missing.');
      return NextResponse.json({ message: 'NSN parameter is required.' }, { status: 400 });
    }

    // Call the database function to fetch parts for the given NSN
    const parts = await getPartsByNSN(nsn);

    // --- SERVER-SIDE DEBUGGING LOG ---
    console.log(`API Route: Found ${parts.length} record(s) for NSN: ${nsn}`);
    if (parts.length > 0) {
      console.log("API Route: First part object from DB:", parts[0]);
    }
    // --- END DEBUGGING LOG ---

    // Return the fetched data as a JSON response
    return NextResponse.json(parts, { status: 200 });

  } catch (error: any) {
    // Catch any errors that occur during database interaction or processing
    console.error('API Error in /api/nsn-parts/[nsn]:', error);
    // Return an error response to the client
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message || String(error) },
      { status: 500 }
    );
  }
}