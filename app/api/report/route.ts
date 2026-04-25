import { NextRequest, NextResponse } from 'next/server';
import { getAIResponse } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { stockData, technicalIndicators, marketMetrics, prediction, risk, newsArticles } = body;

    if (!stockData || !stockData.ticker) {
      return NextResponse.json({ error: 'Stock data is required' }, { status: 400 });
    }

    const newsSection = newsArticles?.length > 0 
      ? newsArticles.map((a: any, i: number) => `[Article ${i + 1}]
Title: ${a.title}
Source: ${a.source}
Description: ${a.description || 'N/A'}
Published: ${a.published_at || 'N/A'}
Sentiment: ${a.sentiment || 'neutral'}`).join('\n\n')
      : 'No recent news available.';

    const prompt = `You are a senior institutional financial analyst. Generate a detailed stock analysis report.

STOCK: ${stockData.ticker} (${stockData.name || 'N/A'})
Sector: ${stockData.sector || 'Unknown'} | Price: ₹${stockData.price}
Change: ${stockData.change > 0 ? '+' : ''}${stockData.change}% | P/E: ${stockData.pe || 'N/A'}
Beta: ${stockData.beta || 'N/A'} | Market Cap: ₹${((stockData.marketCap || 0) / 10000000).toFixed(0)}Cr

TECHNICAL: RSI=${technicalIndicators?.rsi?.toFixed(1) || 'N/A'}, MACD=${technicalIndicators?.macd?.value?.toFixed(1) || 'N/A'}
SMA20=₹${technicalIndicators?.sma20?.toFixed(0) || 'N/A'}, SMA50=₹${technicalIndicators?.sma50?.toFixed(0) || 'N/A'}
Bollinger: ₹${technicalIndicators?.bollingerBands?.lower?.toFixed(0) || 'N/A'} - ₹${technicalIndicators?.bollingerBands?.upper?.toFixed(0) || 'N/A'}

NEWS: ${newsSection}

Generate a comprehensive report with these sections:
1. Executive Summary - 2-3 sentence investment thesis
2. Technical Analysis - Trend, momentum, key levels, patterns
3. Fundamental Analysis - Strengths, concerns, valuation
4. News & Sentiment Impact - Recent catalysts and risks
5. Risk Assessment - Key risks and warnings
6. Investment Recommendation - Clear BUY/HOLD/SELL with entry, target, stop loss

Write professionally with detailed reasoning. No fake data. Use "Not available" if data is missing.`;

    console.log('>> Generating report for:', stockData.ticker);

    let reportText = '';
    
    try {
      reportText = await getAIResponse(prompt);
    } catch (error) {
      console.error('AI error:', error);
    }

    if (!reportText || reportText === 'No response from AI') {
      const fallback = generateFallbackReport(stockData, technicalIndicators, risk);
      return NextResponse.json({
        success: true,
        ticker: stockData.ticker,
        timestamp: new Date().toISOString(),
        report: fallback,
        source: 'Generated (fallback)'
      });
    }

    return NextResponse.json({
      success: true,
      ticker: stockData.ticker,
      timestamp: new Date().toISOString(),
      report: reportText,
      source: 'Gemini Pro'
    });

  } catch (error) {
    console.error('Report error:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}

function generateFallbackReport(stockData: any, technical: any, risk: string): string {
  const { ticker, name, sector, price, change, changePercent, yearHigh, yearLow, pe, beta, marketCap, exchange } = stockData;
  const { rsi, macd, sma20, sma50, sma200, bollingerBands, adx } = technical || {};
  
  const trend = price > sma20 && sma20 > sma50 ? 'BULLISH' : price < sma20 && sma20 < sma50 ? 'BEARISH' : 'SIDEWAYS';
  const momentum = rsi > 60 ? 'STRONG' : rsi > 40 ? 'MODERATE' : 'WEAK';
  const volatility = adx > 25 ? 'HIGH' : adx > 15 ? 'MODERATE' : 'LOW';
  
  const support = bollingerBands?.lower || price * 0.95;
  const resistance = bollingerBands?.upper || price * 1.08;
  
  const strength = pe < 25 && pe > 10 ? 'STRONG' : pe > 35 ? 'WEAK' : 'MODERATE';
  const growthProspects = rsi > 50 && changePercent > 0 ? 'HIGH' : rsi < 40 ? 'LOW' : 'MODERATE';
  
  let rec = 'HOLD';
  let recColor = 'AMBER';
  if (trend === 'BULLISH' && momentum === 'STRONG') { rec = 'BUY'; recColor = 'EMERALD'; }
  else if (trend === 'BEARISH') { rec = 'SELL'; recColor = 'ROSE'; }
  
  const target = price * 1.12;
  const stopLoss = price * 0.96;
  const riskReward = ((target - price) / (price - stopLoss)).toFixed(1);
  const upside = ((target - price) / price * 100).toFixed(0);
  const downside = ((price - stopLoss) / price * 100).toFixed(0);
 
  return `# 📊 ${ticker} - ${exchange || 'NSE'} Stock Analysis Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 
## 🏢 Company Profile
| Field | Value |
|-------|-------|
| **Name** | ${name || ticker} |
| **Sector** | ${sector || 'N/A'} |
| **Exchange** | ${exchange || 'NSE'} |
| **Market Cap** | ₹${((marketCap || 0) / 10000000).toFixed(0)} Cr |
 
## 💰 Price Data
| Metric | Value |
|--------|-------|
| **Current Price** | ₹${price?.toLocaleString() || 'N/A'} |
| **Day Change** | ${change >= 0 ? '+' : ''}${change?.toFixed(2) || '0.00'}% |
| **52W High** | ₹${yearHigh?.toLocaleString() || 'N/A'} |
| **52W Low** | ₹${yearLow?.toLocaleString() || 'N/A'} |
 
## 📈 Technical Analysis
| Indicator | Value | Interpretation |
|-----------|-------|-------------|
| **Trend** | ${trend} | ${trend === 'BULLISH' ? '↗️ Bullish momentum' : trend === 'BEARISH' ? '↘️ Bearish pressure' : '↔️ Sideways'} |
| **RSI** | ${rsi?.toFixed(1) || 'N/A'} | ${rsi > 70 ? '🔥 Overbought' : rsi < 30 ? '❄️ Oversold' : '⚖️ Neutral'} |
| **SMA 20** | ₹${sma20?.toFixed(0) || 'N/A'} | ${price > sma20 ? '✅ Above' : '❌ Below'} |
| **SMA 50** | ₹${sma50?.toFixed(0) || 'N/A'} | Key moving average |
| **Volatility** | ${volatility} | ${volatility === 'HIGH' ? '📊 High volatility' : '📉 Low volatility'} |
| **Support** | ₹${support?.toFixed(0) || 'N/A'} | Buy zone |
| **Resistance** | ₹${resistance?.toFixed(0) || 'N/A'} | Sell zone |
 
## 💵 Fundamental Analysis
| Metric | Value | Assessment |
|--------|-------|-----------|
| **P/E Ratio** | ${pe || 'N/A'} | ${pe < 20 ? '✅ Undervalued' : pe > 30 ? '⚠️ Premium' : '📊 Fair value'} |
| **Beta** | ${beta || 'N/A'} | ${beta < 1 ? '🛡️ Defensive' : beta > 1 ? '⚔️ Aggressive' : '⚖️ Market-neutral'} |
| **Valuation** | ${strength} | ${strength === 'STRONG' ? '✅ Attractive' : '⚠️ Review'} |
 
## 🎯 Investment Recommendation
╔══════════════════════════════════════════════════════════╗
║  RECOMMENDATION:  [${rec}]                              ║
╠══════════════════════════════════════════════════════════╣
║  Entry Price    │ ₹${price?.toLocaleString() || 'N/A'}                         ║
║  Target Price  │ ₹${target?.toFixed(0)?.toLocaleString() || 'N/A'} (+${upside}%)             ║
║  Stop Loss     │ ₹${stopLoss?.toFixed(0)?.toLocaleString() || 'N/A'} (-${downside}%)             ║
║  Risk/Reward   │ 1:${riskReward}                                  ║
╚══════════════════════════════════════════════════════════╝
 
## ⚠️ Risk Assessment
- 📉 Market volatility risk (Beta: ${beta})
- 🏭 Sector-specific risks
- ${risk || 'Monitor for regulatory changes'}
 
---
*🚀 Analysis generated by Trading Rocket AI*
*For educational purposes only. Not investment advice.*`;
}