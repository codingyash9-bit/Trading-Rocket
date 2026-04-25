import { NextRequest, NextResponse } from 'next/server';
import { getAIResponse } from '@/lib/gemini';

// ─── Agent System Prompts ───────────────────────────────────────────────────

const MARKET_ANALYSIS_PROMPT = `You are a senior quantitative analyst at a tier-1 institutional trading desk specializing in Indian equity markets (NSE/BSE). Deliver Bloomberg-grade market intelligence — precise, structured, and actionable.

When analyzing any market, stock, or sector:
- Draw from fundamental indicators, technical signals, macro conditions, and sectoral flows
- Contextualize within Indian market micro-structure: FII/DII activity, SEBI dynamics, RBI policy impact
- Eliminate noise. Prioritize signal.

ALWAYS respond in this EXACT schema with markdown headings:

**SUMMARY**
One paragraph. The definitive market narrative — no hedging, no filler.

**KEY INSIGHTS**
- [Insight 1]: specific, data-anchored observation
- [Insight 2]: trend, momentum, or structural shift
- [Insight 3]: catalyst or inflection point to watch

**RISKS**
- [Risk 1]: downside scenario with trigger condition
- [Risk 2]: macro or policy risk
- [Risk 3]: liquidity or sentiment risk

**ACTIONABLE TAKEAWAYS**
- [Action 1]: what a trader/investor should do right now
- [Action 2]: position or sector adjustment
- [Action 3]: level to watch (support/resistance/event)

**CONFIDENCE_SCORE**: [integer 0-100]

Tone: Institutional. Authoritative. Zero fluff.`;

const PORTFOLIO_ANALYSIS_PROMPT = `You are a CFA-chartered portfolio strategist with deep expertise in Indian capital markets. Analyze portfolios through multi-dimensional lenses: risk-adjusted returns, factor exposure, concentration risk, and strategic alignment.

When evaluating any portfolio:
- Assess allocation efficiency, sector concentration, beta exposure
- Identify hidden correlations and tail risks
- Benchmark against NIFTY 50 or relevant index
- Provide both tactical and strategic recommendations

ALWAYS respond in this EXACT schema with markdown headings:

**SUMMARY**
Portfolio health in one paragraph — overall posture, risk profile, and strategic coherence.

**KEY INSIGHTS**
- [Allocation]: top-heavy sectors or underweight opportunities
- [Performance]: return attribution — what's driving alpha/beta
- [Exposure]: factor tilt (growth/value/momentum) and quality of holdings

**RISKS**
- [Concentration Risk]: over-exposure to single stock, sector, or theme
- [Drawdown Risk]: vulnerable positions under stress scenarios
- [Macro Sensitivity]: how inflation, rate cycles, or INR moves impact this portfolio

**ACTIONABLE TAKEAWAYS**
- [Rebalance]: specific position to trim or add
- [Hedge]: tail risk mitigation — what and how
- [Opportunity]: undervalued entry or rotation play

**CONFIDENCE_SCORE**: [integer 0-100]

Tone: Consultative. Precise. No generic advice.`;

const TRADING_SIGNALS_PROMPT = `You are an elite quantitative signals analyst combining technical analysis, order flow intelligence, and momentum modeling for Indian equity and derivatives markets.

When generating trading signals:
- Apply multi-timeframe confluence (daily + weekly structure, intraday trigger)
- Reference price action, volume, RSI, MACD, VWAP, and key levels
- Provide clear entry, target, and stop-loss levels in INR
- Assign a conviction score based on signal quality

ALWAYS respond in this EXACT schema with markdown headings:

**SUMMARY**
Signal narrative in 2–3 sentences. Setup type, timeframe, and directional bias.

**KEY INSIGHTS**
- [Setup]: pattern or structure identified (breakout, reversal, continuation)
- [Confluence]: supporting factors aligning with the signal
- [Momentum]: volume and indicator confirmation

**RISKS**
- [Invalidation]: the exact condition that breaks this signal
- [Whipsaw Risk]: false breakout / liquidity trap potential
- [Event Risk]: earnings, results, or macro events that could override technicals

**ACTIONABLE TAKEAWAYS**
- **Entry Zone**: ₹X – ₹Y
- **Target 1**: ₹T1 | **Target 2**: ₹T2
- **Stop-Loss**: ₹SL (hard)
- **Timeframe**: Intraday / Swing / Positional

**CONFIDENCE_SCORE**: [integer 0-100]

Tone: Decisive. Quantitative. Trader-grade precision.`;

const ROCKET_AI_PROMPT = `You are Rocket AI, an elite financial intelligence assistant for Indian markets (NSE/BSE). You combine deep market knowledge with institutional-grade clarity.

You provide:
- Deep stock analysis with quantitative and qualitative signals
- Real-world market insights contextualized for Indian investors
- RBI, SEBI, and regulatory impact analysis
- Commodity and forex analysis in Indian context

ALWAYS respond in this EXACT schema with markdown headings:

**SUMMARY**
Direct, authoritative answer in one paragraph.

**KEY INSIGHTS**
- Three specific, data-driven observations

**RISKS**
- Three material risks or concerns

**ACTIONABLE TAKEAWAYS**
- Three concrete next steps for the user

**CONFIDENCE_SCORE**: [integer 0-100]

Tone: Institutional. Authoritative. Premium fintech clarity.`;

// ─── Agent Router ───────────────────────────────────────────────────────────

function detectAgentMode(message: string): { prompt: string; agentLabel: string } {
  const lower = message.toLowerCase();

  const isPortfolio =
    lower.includes('portfolio') ||
    lower.includes('allocation') ||
    lower.includes('holdings') ||
    lower.includes('rebalance') ||
    lower.includes('diversif');

  const isSignals =
    lower.includes('signal') ||
    lower.includes('entry') ||
    lower.includes('stop loss') ||
    lower.includes('target') ||
    lower.includes('buy call') ||
    lower.includes('trade setup') ||
    lower.includes('breakout') ||
    lower.includes('swing');

  const isMarket =
    lower.includes('nifty') ||
    lower.includes('sensex') ||
    lower.includes('market') ||
    lower.includes('sector') ||
    lower.includes('fii') ||
    lower.includes('dii') ||
    lower.includes('rbi') ||
    lower.includes('macro') ||
    lower.includes('outlook');

  if (isPortfolio) return { prompt: PORTFOLIO_ANALYSIS_PROMPT, agentLabel: 'Portfolio Analysis AI' };
  if (isSignals)   return { prompt: TRADING_SIGNALS_PROMPT,    agentLabel: 'Trading Signals AI' };
  if (isMarket)    return { prompt: MARKET_ANALYSIS_PROMPT,     agentLabel: 'Market Analysis AI' };

  return { prompt: ROCKET_AI_PROMPT, agentLabel: 'Rocket AI' };
}

// ─── Fallback Responses ─────────────────────────────────────────────────────

const fallbackResponses: Record<string, string> = {
  'gold': `**SUMMARY**
Gold prices are influenced by USD strength, inflation expectations, and festival demand in India. The yellow metal remains a key safe-haven in volatile global conditions.

**KEY INSIGHTS**
- USD/INR: Weaker rupee directly pushes domestic gold prices higher
- Festival Season: Dhanteras/Diwali cycle drives peak physical demand
- Global Rates: Elevated global rates cap gold's upside in the near term

**RISKS**
- A sharp USD rally could suppress INR-denominated gold prices
- RBI rate hike signals may reduce safe-haven appeal
- Improved global risk sentiment could trigger outflows from gold

**ACTIONABLE TAKEAWAYS**
- Accumulate on dips toward ₹74,000–75,000/10g range
- Use GOLDBEES ETF for liquid, low-cost gold exposure
- Watch USD/INR at 84.50 as the key inflection level

**CONFIDENCE_SCORE**: 72`,

  'nifty': `**SUMMARY**
NIFTY 50 is navigating a consolidation phase post-rally with mixed signals from FII flows and global risk sentiment. The index awaits a decisive catalyst to break out of the 22,200–22,800 range.

**KEY INSIGHTS**
- FII activity has turned cautiously net-negative in recent sessions
- RBI's policy stance remains the primary domestic swing factor
- IT and Banking sectors are diverging — creating rotation opportunities

**RISKS**
- A break below 22,000 would invalidate the medium-term bullish structure
- Global crude oil spike could pressure India's macro balance
- Earnings disappointments in heavyweight names pose index-level downside

**ACTIONABLE TAKEAWAYS**
- Stay overweight banking (HDFCBANK, ICICIBANK) and underweight FMCG
- Accumulate quality IT on dips — structural demand remains intact
- Watch 22,800 as the bull-case trigger; 22,000 as the stop-loss level

**CONFIDENCE_SCORE**: 68`,

  'default': `**SUMMARY**
Indian markets continue in a technical consolidation phase, driven by a balance of FII outflows and resilient domestic institutional buying. Quality fundamentals are the primary screen in this environment.

**KEY INSIGHTS**
- FII/DII flows are in a tug-of-war — DII absorption is keeping markets stable
- RBI monetary policy and US Fed actions remain the key macro variables
- Q4 earnings season will be the next major pricing catalyst

**RISKS**
- Sustained FII selling could break near-term technical support
- Global recession fears, if amplified, will hit export-oriented sectors
- INR depreciation beyond 85 would compress import-heavy sectors

**ACTIONABLE TAKEAWAYS**
- Focus on domestic consumption themes (FMCG, auto, banking) over global cyclicals
- Reduce mid-cap exposure if NIFTY Midcap 150 fails to hold recent highs
- Keep 10–15% cash for deployment on meaningful corrections

**CONFIDENCE_SCORE**: 65`
};

function getFallbackResponse(query: string): string {
  const lower = query.toLowerCase();
  if (lower.includes('gold') || lower.includes('silver') || lower.includes('commodity')) return fallbackResponses['gold'];
  if (lower.includes('nifty') || lower.includes('sensex') || lower.includes('index') || lower.includes('market')) return fallbackResponses['nifty'];
  return fallbackResponses['default'];
}

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    if (!message?.trim()) {
      return Response.json({ error: 'Message required' }, { status: 400 });
    }
    const { prompt: systemPrompt, agentLabel } = detectAgentMode(message);
    const fullPrompt = systemPrompt + '\n\nUser: ' + message + '\n\nAssistant:';
    let reply = '';
    let confidenceScore = null;
    try {
      reply = await getAIResponse(fullPrompt);
      const confidenceMatch = reply.match(/\*\*CONFIDENCE_SCORE\*\*:\s*(\d+)/);
      if (confidenceMatch) {
        confidenceScore = parseInt(confidenceMatch[1], 10);
        reply = reply.replace(/\*\*CONFIDENCE_SCORE\*\*:\s*\d+\n?/, '').trim();
      }
    } catch (e) {
      console.error(e);
      return Response.json({ success: true, message: { role: 'assistant', content: '⚠️ Temporary system load.\n\n' + getFallbackResponse(message), sources: [agentLabel], confidence: 60 } });
    }
    if (!reply || reply === 'No response from AI') {
      return Response.json({ success: true, message: { role: 'assistant', content: '⚠️ Temporary processing delay.\n\n' + getFallbackResponse(message), sources: [agentLabel], confidence: 60 } });
    }
    return Response.json({ success: true, message: { role: 'assistant', content: reply, sources: [agentLabel], confidence: confidenceScore } });
  } catch (error) {
    let query = '';
    try { query = await request.clone().json().then(j => j.message); } catch (e) {}
    const fallback = getFallbackResponse(query);
    let agentLabel = 'Rocket AI';
    try { agentLabel = detectAgentMode(query).agentLabel; } catch (e) {}
    return Response.json({ success: true, message: { role: 'assistant', content: '⚠️ Error.\n\n' + fallback, sources: [agentLabel], confidence: 60 } });
  }
}
