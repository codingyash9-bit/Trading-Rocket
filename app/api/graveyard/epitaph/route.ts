// app/api/graveyard/epitaph/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAIResponse } from '@/lib/gemini';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const predictionId = searchParams.get('prediction_id');

    if (!predictionId) {
      return NextResponse.json({ error: 'Prediction ID required' }, { status: 400 });
    }

    const mockData: Record<string, { ticker: string; direction: string; confidence: number; reason: string }> = {
      'grave-INFY-0': { ticker: 'INFY', direction: 'BULLISH', confidence: 85, reason: 'Revenue miss of 3%' },
      'grave-TATASTEEL-1': { ticker: 'TATASTEEL', direction: 'BEARISH', confidence: 78, reason: 'China demand surge' },
      'grave-BHARTIARTL-2': { ticker: 'BHARTIARTL', direction: 'BULLISH', confidence: 72, reason: 'ARPU guidance cut' },
    };

    const mock = mockData[predictionId] || {
      ticker: 'UNKNOWN',
      direction: 'BULLISH',
      confidence: 50,
      reason: 'market volatility'
    };

    const prompt = `Write a brutally honest epitaph for a failed trading signal.
Ticker: ${mock.ticker}
Predicted: ${mock.direction}
Confidence: ${mock.confidence}%
Reason for failure: ${mock.reason}

Rules:
- One sentence only
- Past tense
- Maximum 15 words
- Format: "[Ticker] called [BULLISH/BEARISH] at [confidence]% confidence — killed by [reason]."
- No hedging, no softening. Be direct and cutting.`;

    const aiResponse = await getAIResponse(prompt);

    let epitaph = aiResponse.trim();
    if (epitaph.length > 150) {
      epitaph = `${mock.ticker} called ${mock.direction} at ${mock.confidence}% confidence — killed by ${mock.reason}.`;
    }

    return NextResponse.json({
      success: true,
      epitaph,
      cached: false,
      prediction_id: predictionId
    });
  } catch (error) {
    console.error('Epitaph generation error:', error);
    return NextResponse.json({
      epitaph: `${mockData[predictionId || '']?.ticker || 'UNKNOWN'} called ${mockData[predictionId || '']?.direction || 'BULLISH'} at ${mockData[predictionId || '']?.confidence || 50}% confidence — killed by ${mockData[predictionId || '']?.reason || 'market forces'}.`,
      cached: false
    });
  }
}