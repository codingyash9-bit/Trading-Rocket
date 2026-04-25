import { NextRequest, NextResponse } from 'next/server';
import { getAIResponse } from '@/lib/gemini';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query required' }, { status: 400 });
  }

  const prompt = `You are a financial analyst for Indian equity markets. Return ONLY valid JSON for "${query}". Include: name, exchange, sector, isin, ipoPrice, listedYear, cmp, change, changePct, kpis object with Market Cap P/E Ratio P/B Ratio ROE Dividend Yield 52W High 52W Low Beta, balanceSheet object with assets liabilities incomeStatement keyRatios (each as array of [label value] pairs), about (2-3 paragraphs), timeline array of [year event] (at least 6), futurePlans array (at least 5), signals array of {label value type}. JSON only. Analyse: ${query}`;

  try {
    const response = await getAIResponse(prompt);
    let jsonStr = response.trim().replace(/^```json/, '').replace(/```$/g, '').replace(/^```/g, '');
    
    // Try to parse to ensure it's valid JSON
    try {
      const data = JSON.parse(jsonStr);
      return NextResponse.json(data);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError, 'Raw response:', response);
      return NextResponse.json({ error: 'Invalid AI response format' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('AI Fetch Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch AI response' }, { status: 500 });
  }
}
