// app/api/wargame/resolve/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAIResponse } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event_id, ticker, scenarios, position, actual_price_move, actual_direction, trigger_hit } = body;

    if (!event_id || !actual_price_move || !actual_direction) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const outcome = {
      id: `outcome-${Date.now()}`,
      event_id,
      actual_price_move: parseFloat(actual_price_move),
      actual_direction,
      trigger_hit: trigger_hit || null,
      created_at: new Date().toISOString()
    };

    let verdict = 'PARTIAL';
    let total_score = 50;
    let breakdown = {
      direction_score: 20,
      price_range_score: 15,
      trigger_score: 10,
      probability_score: 5
    };

    if (scenarios && position) {
      const selectedScenario = scenarios.find((s: any) => s.type === position.scenario_type);
      
      if (selectedScenario) {
        const scenarioType = selectedScenario.type;
        const positionType = position.position_type;
        const actualMove = Math.abs(outcome.actual_price_move);

        if (scenarioType === 'BULL' && positionType === 'LONG' && actual_direction === 'BULLISH') {
          breakdown.direction_score = 40;
        } else if (scenarioType === 'BEAR' && positionType === 'SHORT' && actual_direction === 'BEARISH') {
          breakdown.direction_score = 40;
        } else if (scenarioType === 'BASE' && actual_direction === 'NEUTRAL') {
          breakdown.direction_score = 40;
        } else {
          breakdown.direction_score = 0;
        }

        if (actualMove >= selectedScenario.price_move_low && actualMove <= selectedScenario.price_move_high) {
          breakdown.price_range_score = 30;
        } else {
          breakdown.price_range_score = Math.max(0, 30 - Math.abs(actualMove - selectedScenario.price_move_high) * 2);
        }

        if (trigger_hit && selectedScenario.trigger) {
          const triggerMatch = selectedScenario.trigger.toLowerCase().includes(trigger_hit.toLowerCase()) ||
                              trigger_hit.toLowerCase().includes(selectedScenario.trigger.toLowerCase().split(' ')[0]);
          breakdown.trigger_score = triggerMatch ? 20 : 10;
        }

        if (selectedScenario.probability >= 40 && selectedScenario.probability <= 50) {
          breakdown.probability_score = 10;
        } else if (selectedScenario.probability >= 30 && selectedScenario.probability <= 60) {
          breakdown.probability_score = 7;
        } else {
          breakdown.probability_score = 4;
        }

        total_score = breakdown.direction_score + breakdown.price_range_score + breakdown.trigger_score + breakdown.probability_score;

        if (total_score >= 80) verdict = 'SHARP';
        else if (total_score >= 60) verdict = 'SOLID';
        else if (total_score >= 35) verdict = 'PARTIAL';
        else verdict = 'WRONG';
      }
    }

    const score = {
      direction_score: breakdown.direction_score,
      price_range_score: breakdown.price_range_score,
      trigger_score: breakdown.trigger_score,
      probability_score: breakdown.probability_score,
      total_score,
      verdict
    };

    return NextResponse.json({
      success: true,
      outcome,
      score,
      verdict
    });
  } catch (error) {
    console.error('Resolve wargame error:', error);
    return NextResponse.json({ error: 'Failed to resolve wargame' }, { status: 500 });
  }
}