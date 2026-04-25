// app/api/graveyard/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') || 'demo-user';

    return NextResponse.json({
      success: true,
      total_graves: 10,
      worst_sector: 'IT',
      worst_pattern: 'Head & Shoulders',
      avg_confidence_of_fails: 75.3
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}