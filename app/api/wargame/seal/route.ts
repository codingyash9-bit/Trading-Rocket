// app/api/wargame/seal/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event_id, scenario_type, position_type, entry_price } = body;

    if (!event_id || !scenario_type || !position_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['BULL', 'BASE', 'BEAR'].includes(scenario_type)) {
      return NextResponse.json({ error: 'Invalid scenario type' }, { status: 400 });
    }

    if (!['LONG', 'SHORT'].includes(position_type)) {
      return NextResponse.json({ error: 'Invalid position type' }, { status: 400 });
    }

    const position = {
      id: `pos-${Date.now()}`,
      event_id,
      scenario_type,
      position_type,
      entry_price: entry_price || null,
      is_locked: true,
      created_at: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: 'Position sealed successfully',
      position
    });
  } catch (error) {
    console.error('Seal position error:', error);
    return NextResponse.json({ error: 'Failed to seal position' }, { status: 500 });
  }
}