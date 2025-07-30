import { NextResponse } from 'next/server';
import { getEnhancedPartsByNSN } from '@/lib/dbEnhanced';

export async function GET(
  request: Request,
  { params }: { params: { nsn: string } }
) {
  try {
    const { nsn } = params;
    
    if (!nsn) {
      return NextResponse.json(
        { error: 'NSN parameter is required' },
        { status: 400 }
      );
    }

    // NSN parameter is clean (no prefix removal needed)
    const cleanNSN = nsn;
    
    console.log(`[API Enhanced] Fetching enhanced data for NSN: ${cleanNSN}`);
    
    // Fetch enhanced part data from database
    const parts = await getEnhancedPartsByNSN(cleanNSN);
    
    if (!parts || parts.length === 0) {
      return NextResponse.json(
        { error: 'No parts found for the given NSN' },
        { status: 404 }
      );
    }

    // Return the enhanced parts data
    return NextResponse.json(parts);
    
  } catch (error) {
    console.error('[API Enhanced] Error in enhanced part info route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}