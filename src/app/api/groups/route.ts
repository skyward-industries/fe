import { NextResponse } from 'next/server';
import { getGroups } from '@/lib/db';

export async function GET() {
  try {
    const groups = await getGroups();
    return NextResponse.json(groups);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch product groups', detail: error.message || error }, { status: 500 });
  }
}