// app/api/wargame/active/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') || 'demo-user';

    return NextResponse.json({
      success: true,
      events: []
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch active events' }, { status: 500 });
  }
}