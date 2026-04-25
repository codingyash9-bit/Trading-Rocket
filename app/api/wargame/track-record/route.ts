// app/api/wargame/track-record/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') || 'demo-user';

    return NextResponse.json({
      user_id: userId,
      total_events: 0,
      sharp_count: 0,
      solid_count: 0,
      partial_count: 0,
      wrong_count: 0,
      avg_score: 0,
      win_rate: 0
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch track record' }, { status: 500 });
  }
}