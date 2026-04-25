// app/api/graveyard/pattern-analysis/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') || 'demo-user';

    const patterns = [
      { pattern: 'Head & Shoulders', count: 3, avg_confidence: 82, sector_breakdown: { IT: 2, Finance: 1 } },
      { pattern: 'Double Top', count: 2, avg_confidence: 75, sector_breakdown: { Metals: 1, Telecom: 1 } },
      { pattern: 'Breakout Failure', count: 2, avg_confidence: 78, sector_breakdown: { Telecom: 1, Infrastructure: 1 } },
      { pattern: 'RSI Divergence', count: 2, avg_confidence: 85, sector_breakdown: { NBFC: 1, Banking: 1 } },
      { pattern: 'Moving Average Crossover', count: 2, avg_confidence: 72, sector_breakdown: { Banking: 1, IT: 1 } },
      { pattern: 'Support Breach', count: 1, avg_confidence: 68, sector_breakdown: { Pharmaceuticals: 1 } },
      { pattern: 'Gap Fill', count: 1, avg_confidence: 65, sector_breakdown: { Conglomerate: 1 } },
      { pattern: 'MACD Signal', count: 1, avg_confidence: 77, sector_breakdown: { Automobile: 1 } },
      { pattern: 'Fibonacci Retracement', count: 1, avg_confidence: 80, sector_breakdown: { IT: 1 } },
      { pattern: 'Trend Line Break', count: 1, avg_confidence: 70, sector_breakdown: { Infrastructure: 1 } },
    ];

    return NextResponse.json({
      success: true,
      patterns
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch pattern analysis' }, { status: 500 });
  }
}