// app/api/graveyard/graves/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAIResponse } from '@/lib/gemini';

const GRAVE_DATA = [
  { ticker: 'INFY', sector: 'IT', pattern: 'Head & Shoulders', timeframe: '1W', confidence: 85, predicted_direction: 'BULLISH' as const, invalidation_reason: 'Revenue miss of 3%', predicted_price: 1950, actual_price: 1780 },
  { ticker: 'TATASTEEL', sector: 'Metals', pattern: 'Double Top', timeframe: '3M', confidence: 78, predicted_direction: 'BEARISH' as const, invalidation_reason: 'China demand surge', predicted_price: 1450, actual_price: 1620 },
  { ticker: 'BHARTIARTL', sector: 'Telecom', pattern: 'Breakout Failure', timeframe: '1M', confidence: 72, predicted_direction: 'BULLISH' as const, invalidation_reason: 'ARPU guidance cut', predicted_price: 1550, actual_price: 1380 },
  { ticker: 'ADANIPORTS', sector: 'Infrastructure', pattern: 'Trend Line Break', timeframe: '1D', confidence: 68, predicted_direction: 'BULLISH' as const, invalidation_reason: 'Volume data discrepancy', predicted_price: 1520, actual_price: 1490 },
  { ticker: 'HDFCBANK', sector: 'Banking', pattern: 'Moving Average Crossover', timeframe: '1W', confidence: 75, predicted_direction: 'BULLISH' as const, invalidation_reason: 'NIM compression', predicted_price: 1820, actual_price: 1710 },
  { ticker: 'BAJFINANCE', sector: 'NBFC', pattern: 'RSI Divergence', timeframe: '3M', confidence: 82, predicted_direction: 'BULLISH' as const, invalidation_reason: 'Asset quality deterioration', predicted_price: 7800, actual_price: 6950 },
  { ticker: 'RELIANCE', sector: 'Conglomerate', pattern: 'Gap Fill', timeframe: '1D', confidence: 65, predicted_direction: 'BEARISH' as const, invalidation_reason: 'New energy deal announcement', predicted_price: 2700, actual_price: 2880 },
  { ticker: 'SUNPHARMA', sector: 'Pharmaceuticals', pattern: 'Support Breach', timeframe: '1W', confidence: 71, predicted_direction: 'BEARISH' as const, invalidation_reason: 'USFDA approval surprise', predicted_price: 1580, actual_price: 1720 },
  { ticker: 'MARUTI', sector: 'Automobile', pattern: 'MACD Signal', timeframe: '1M', confidence: 77, predicted_direction: 'BULLISH' as const, invalidation_reason: 'Semiconductor shortage', predicted_price: 13200, actual_price: 12100 },
  { ticker: 'TCS', sector: 'IT', pattern: 'Fibonacci Retracement', timeframe: '3M', confidence: 80, predicted_direction: 'BULLISH' as const, invalidation_reason: 'Merger uncertainty', predicted_price: 4350, actual_price: 4080 },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') || 'demo-user';
    const sector = searchParams.get('sector');
    const pattern = searchParams.get('pattern');
    const timeframe = searchParams.get('timeframe');
    const sort = searchParams.get('sort') || 'date';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let graves = [...GRAVE_DATA];

    if (sector) {
      graves = graves.filter(g => g.sector === sector);
    }
    if (pattern) {
      graves = graves.filter(g => g.pattern === pattern);
    }
    if (timeframe) {
      graves = graves.filter(g => g.timeframe === timeframe);
    }

    if (sort === 'confidence') {
      graves.sort((a, b) => b.confidence - a.confidence);
    } else if (sort === 'ticker') {
      graves.sort((a, b) => a.ticker.localeCompare(b.ticker));
    }

    const total = graves.length;
    const start = (page - 1) * limit;
    const paginatedGraves = graves.slice(start, start + limit).map((g, i) => ({
      id: `grave-${g.ticker}-${i}`,
      ...g,
      verdict: 'INVALIDATED' as const,
      source: 'SIGNAL' as const,
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    }));

    return NextResponse.json({
      success: true,
      graves: paginatedGraves,
      page,
      limit,
      total
    });
  } catch (error) {
    console.error('Graves fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch graves' }, { status: 500 });
  }
}