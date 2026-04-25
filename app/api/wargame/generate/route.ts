// app/api/wargame/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAIResponse } from '@/lib/gemini';

interface Scenario {
  type: 'BULL' | 'BASE' | 'BEAR';
  probability: number;
  price_move_low: number;
  price_move_high: number;
  trigger: string;
  killer_condition: string;
  reasoning: string;
}

const STOCK_INFO: Record<string, { name: string; sector: string; basePrice: number }> = {
  RELIANCE: { name: 'Reliance Industries', sector: 'Conglomerate', basePrice: 2856 },
  TCS: { name: 'Tata Consultancy Services', sector: 'IT', basePrice: 4125 },
  HDFCBANK: { name: 'HDFC Bank', sector: 'Banking', basePrice: 1723 },
  INFY: { name: 'Infosys', sector: 'IT', basePrice: 1845 },
  BAJFINANCE: { name: 'Bajaj Finance', sector: 'NBFC', basePrice: 7245 },
  TATAMOTORS: { name: 'Tata Motors', sector: 'Automobile', basePrice: 785 },
  MARUTI: { name: 'Maruti Suzuki', sector: 'Automobile', basePrice: 12580 },
  SUNPHARMA: { name: 'Sun Pharma', sector: 'Pharmaceuticals', basePrice: 1685 },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticker, earnings_date, quarter = 'Q1' } = body;

    if (!ticker) {
      return NextResponse.json({ error: 'Ticker required' }, { status: 400 });
    }

    const stockInfo = STOCK_INFO[ticker] || { name: ticker, sector: 'Unknown', basePrice: 1000 };
    const recentReactions = '+2.3%, -1.8%, +3.2%, -0.5%';

    const prompt = `You are a pre-earnings scenario analyst for ${ticker} (${stockInfo.name}) listed on Indian NSE/BSE.

Sector: ${stockInfo.sector}
Current Price: ₹${stockInfo.basePrice}
Earnings Date: ${new Date(earnings_date || Date.now()).toLocaleDateString()}
Quarter: ${quarter}

Recent quarterly price reactions: ${recentReactions}

Generate exactly 3 scenarios for this earnings event:

Return this EXACT JSON format (no other text):
{
  "scenarios": [
    {
      "type": "BULL",
      "probability": 30,
      "price_move_low": 5.0,
      "price_move_high": 12.0,
      "trigger": "Revenue growth exceeds 20% YoY",
      "killer_condition": "Disappointing margins despite revenue beat",
      "reasoning": "Strong demand in key segments and festive season sales"
    },
    {
      "type": "BASE",
      "probability": 45,
      "price_move_low": -2.0,
      "price_move_high": 4.0,
      "trigger": "EPS in line with estimates (±5%)",
      "killer_condition": "Guidance cuts or weak outlook",
      "reasoning": "Steady performance with mixed segmental results"
    },
    {
      "type": "BEAR",
      "probability": 25,
      "price_move_low": -10.0,
      "price_move_high": -3.0,
      "trigger": "Revenue misses by more than 10%",
      "killer_condition": "Sustained margin pressure and inventory buildup",
      "reasoning": "Competitive pressures and input cost inflation"
    }
  ]
}

RULES:
- Probabilities must sum to exactly 100
- BASE probability must be between 35-55
- BULL and BEAR minimum probability is 10 each
- Each price move range must be minimum 4 percentage points wide
- BULL low must be positive (above 0)
- BEAR high must be negative (below 0)
- BASE must straddle zero (low negative, high positive)
- Trigger names must be a specific metric and threshold
- NO hedging words: could, might, may, potentially
- Be specific and confident`;

    const aiResponse = await getAIResponse(prompt);
    
    let scenarios: Scenario[] = [
      {
        type: 'BULL',
        probability: 30,
        price_move_low: 5.0,
        price_move_high: 12.0,
        trigger: 'Revenue growth exceeds 20% YoY',
        killer_condition: 'Disappointing margins despite revenue beat',
        reasoning: 'Strong demand in key segments'
      },
      {
        type: 'BASE',
        probability: 45,
        price_move_low: -2.0,
        price_move_high: 4.0,
        trigger: 'EPS in line with estimates (±5%)',
        killer_condition: 'Guidance cuts or weak outlook',
        reasoning: 'Steady performance with mixed results'
      },
      {
        type: 'BEAR',
        probability: 25,
        price_move_low: -10.0,
        price_move_high: -3.0,
        trigger: 'Revenue misses by more than 10%',
        killer_condition: 'Sustained margin pressure',
        reasoning: 'Competitive pressures and cost inflation'
      }
    ];
    
    try {
      if (aiResponse && aiResponse !== 'No response from AI') {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.scenarios && Array.isArray(parsed.scenarios)) {
            scenarios = parsed.scenarios;
          }
        }
      }
    } catch (e) {
      console.log('Using fallback scenarios due to parse error');
    }

    return NextResponse.json({
      success: true,
      event_id: `wg-${ticker}-${Date.now()}`,
      scenarios,
      ticker,
      earnings_date,
      quarter
    });
  } catch (error) {
    console.error('Generate scenarios error:', error);
    return NextResponse.json({ error: 'Failed to generate scenarios' }, { status: 500 });
  }
}