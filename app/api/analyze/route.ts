import { NextRequest, NextResponse } from 'next/server';
import { getAIResponse } from '@/lib/gemini';

interface StockData {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  changePercent: number;
  pe: number;
  beta: number;
}

const stockDatabase: Record<string, Partial<StockData>> = {
  RELIANCE: { name: 'Reliance Industries', sector: 'Conglomerate', price: 2856, pe: 28.5, beta: 0.87 },
  TCS: { name: 'Tata Consultancy Services', sector: 'IT', price: 4125, pe: 26.8, beta: 0.92 },
  HDFCBANK: { name: 'HDFC Bank', sector: 'Banking', price: 1723, pe: 19.2, beta: 1.12 },
  INFY: { name: 'Infosys', sector: 'IT', price: 1845, pe: 25.6, beta: 0.95 },
  ICICIBANK: { name: 'ICICI Bank', sector: 'Banking', price: 1124, pe: 21.3, beta: 1.08 },
  SBIN: { name: 'State Bank of India', sector: 'Banking', price: 812, pe: 14.8, beta: 1.25 },
  BHARTIARTL: { name: 'Bharti Airtel', sector: 'Telecom', price: 1425, pe: 32.4, beta: 0.78 },
  ITC: { name: 'ITC Ltd', sector: 'FMCG', price: 465, pe: 22.1, beta: 0.65 },
  HINDUNILVR: { name: 'Hindustan Unilever', sector: 'FMCG', price: 2795, pe: 56.2, beta: 0.42 },
  KOTAKBANK: { name: 'Kotak Mahindra Bank', sector: 'Banking', price: 1785, pe: 22.4, beta: 1.05 },
  BAJFINANCE: { name: 'Bajaj Finance', sector: 'NBFC', price: 7245, pe: 34.2, beta: 1.35 },
  ASIANPAINT: { name: 'Asian Paints', sector: 'Chemicals', price: 3185, pe: 52.8, beta: 0.75 },
  TITAN: { name: 'Titan Company', sector: 'Jewellery', price: 3580, pe: 38.5, beta: 0.92 },
  HCLTECH: { name: 'HCL Technologies', sector: 'IT', price: 1685, pe: 22.4, beta: 0.85 },
  WIPRO: { name: 'Wipro', sector: 'IT', price: 545, pe: 18.5, beta: 0.78 },
  TECHMAH: { name: 'Tech Mahindra', sector: 'IT', price: 1580, pe: 19.8, beta: 1.02 },
  SUNPHARMA: { name: 'Sun Pharma', sector: 'Pharmaceuticals', price: 1685, pe: 28.5, beta: 0.75 },
  ULTC: { name: 'Ultratech Cement', sector: 'Cement', price: 10850, pe: 38.2, beta: 0.88 },
  NTPC: { name: 'NTPC', sector: 'Power', price: 385, pe: 12.5, beta: 0.65 },
  ONGC: { name: 'ONGC', sector: 'Oil & Gas', price: 285, pe: 9.5, beta: 0.85 },
  IOC: { name: 'Indian Oil Corp', sector: 'Oil & Gas', price: 165, pe: 10.2, beta: 0.72 },
  HDFCLIFE: { name: 'HDFC Life Insurance', sector: 'Insurance', price: 685, pe: 45.2, beta: 0.95 },
  SBILIFE: { name: 'SBI Life Insurance', sector: 'Insurance', price: 1895, pe: 38.5, beta: 0.88 },
  CIPLA: { name: 'Cipla', sector: 'Pharmaceuticals', price: 1485, pe: 25.2, beta: 0.62 },
  MARUTI: { name: 'Maruti Suzuki', sector: 'Automobile', price: 12580, pe: 28.5, beta: 0.82 },
  'M&M': { name: 'Mahindra & Mahindra', sector: 'Automobile', price: 3185, pe: 24.2, beta: 1.05 },
  EICHERMOT: { name: 'Eicher Motors', sector: 'Automobile', price: 4580, pe: 28.5, beta: 0.75 },
  TVSMOTOR: { name: 'TVS Motor', sector: 'Automobile', price: 2580, pe: 22.5, beta: 1.12 },
  HEROMOTOCO: { name: 'Hero MotoCorp', sector: 'Automobile', price: 4580, pe: 18.2, beta: 0.85 },
  BAJAJ_AUTO: { name: 'Bajaj Auto', sector: 'Automobile', price: 9280, pe: 16.5, beta: 0.72 },
  ADANIPORTS: { name: 'Adani Ports', sector: 'Infrastructure', price: 1485, pe: 28.5, beta: 0.95 },
  ADANIENT: { name: 'Adani Enterprises', sector: 'Conglomerate', price: 3280, pe: 85.2, beta: 1.25 },
  ADANIGREEN: { name: 'Adani Green Energy', sector: 'Power', price: 1580, pe: 125.5, beta: 1.35 },
  ADANITRANS: { name: 'Adani Transmission', sector: 'Power', price: 2850, pe: 145.2, beta: 1.18 },
  DRREDDY: { name: 'Dr. Reddy\'s', sector: 'Pharmaceuticals', price: 5680, pe: 22.8, beta: 0.58 },
  DIVISLAB: { name: 'Divi\'s Labs', sector: 'Pharmaceuticals', price: 4580, pe: 32.5, beta: 0.68 },
  COALINDIA: { name: 'Coal India', sector: 'Mining', price: 385, pe: 8.5, beta: 0.75 },
  POWERGRID: { name: 'Power Grid', sector: 'Power', price: 285, pe: 10.8, beta: 0.58 },
  BPCL: { name: 'Bharat Petroleum', sector: 'Oil & Gas', price: 625, pe: 11.5, beta: 0.68 },
  TATASTEEL: { name: 'Tata Steel', sector: 'Metals', price: 1580, pe: 12.5, beta: 1.15 },
  TATAMOTORS: { name: 'Tata Motors', sector: 'Automobile', price: 785, pe: 8.5, beta: 1.25 },
  BRITANNIA: { name: 'Britannia Industries', sector: 'FMCG', price: 5285, pe: 42.5, beta: 0.55 },
  NESTLEIND: { name: 'Nestle India', sector: 'FMCG', price: 2585, pe: 48.5, beta: 0.45 },
  SBU: { name: 'SBI', sector: 'ETF', price: 725, pe: 0, beta: 0.95 },
  NIFTYBEES: { name: 'Nifty BeES ETF', sector: 'ETF', price: 985, pe: 0, beta: 0.98 },
  GOLDBEES: { name: 'Gold BeES ETF', sector: 'ETF', price: 5680, pe: 0, beta: 0.15 },
  SILVERBEES: { name: 'Silver BeES ETF', sector: 'ETF', price: 845, pe: 0, beta: 0.25 },
  LIQUIDBEES: { name: 'Liquid BeES ETF', sector: 'ETF', price: 1185, pe: 0, beta: 0.05 },
  MIDCAPBEES: { name: 'Midcap BeES ETF', sector: 'ETF', price: 425, pe: 0, beta: 1.05 },
  GOLDM: { name: 'Gold (MCX)', sector: 'Commodity', price: 78500, pe: 0, beta: 0.1 },
  SILVERM: { name: 'Silver (MCX)', sector: 'Commodity', price: 92500, pe: 0, beta: 0.15 },
  CRUDEOIL: { name: 'Crude Oil', sector: 'Commodity', price: 5680, pe: 0, beta: 0.35 },
  NATURALGAS: { name: 'Natural Gas', sector: 'Commodity', price: 185, pe: 0, beta: 0.45 },
  USDINR: { name: 'USD/INR', sector: 'Forex', price: 83.25, pe: 0, beta: 0.02 },
  EURINR: { name: 'EUR/INR', sector: 'Forex', price: 89.85, pe: 0, beta: 0.02 },
  GBPINR: { name: 'GBP/INR', sector: 'Forex', price: 105.25, pe: 0, beta: 0.02 },
  TATAARM: { name: 'Tata Arm Ltd', sector: 'IPO', price: 265, pe: 0, beta: 1.0 },
  OYOLIFE: { name: 'Oyo Life', sector: 'IPO', price: 125, pe: 0, beta: 1.0 },
  LERTHPRO: { name: 'Leroth Pro', sector: 'IPO', price: 85, pe: 0, beta: 1.0 },
};

interface AnalysisResult {
  fundamental: string;
  technical: string;
  sentiment: string;
  risks: string;
  verdict: string;
}

async function analyzeStockWithLlama(stock: StockData): Promise<AnalysisResult> {
  const prompt = `Analyze ${stock.ticker} (${stock.name}) stock.

Sector: ${stock.sector}
Current Price: ₹${stock.price}
P/E Ratio: ${stock.pe}
Beta: ${stock.beta}

Provide in indian market context:
1. Fundamental Analysis - Revenue, margins, ROE, debt, growth potential
2. Technical View - Trend, support, resistance, indicators  
3. Market Sentiment - FII/DII flow, news, sector outlook
4. Risks - Key risks and concerns
5. Final Verdict - Buy/Hold/Sell with target

Return this EXACT JSON (no other text):
{"fundamental":"text","technical":"text","sentiment":"text","risks":"text","verdict":"BUY"}`;

  try {
    const text = await getAIResponse(prompt);

    if (!text || text === 'No response from AI') {
      throw new Error('AI returned empty response');
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.fundamental || !parsed.verdict) {
      throw new Error('AI response missing required fields');
    }

    return {
      fundamental: parsed.fundamental,
      technical: parsed.technical,
      sentiment: parsed.sentiment,
      risks: parsed.risks,
      verdict: parsed.verdict
    };
  } catch (error) {
    console.error('Analysis error:', error);
    throw new Error('AI analysis failed. Please try again.');
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker')?.toUpperCase() || '';

  if (!ticker) {
    return NextResponse.json({ error: 'Ticker required' }, { status: 400 });
  }

  const stockData = stockDatabase[ticker];
  if (!stockData) {
    return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
  }

  const stock: StockData = {
    ticker,
    name: stockData.name || ticker,
    sector: stockData.sector || 'Unknown',
    price: stockData.price || 100,
    changePercent: 0,
    pe: stockData.pe || 20,
    beta: stockData.beta || 1,
  };

  console.log('>> Analyzing:', ticker);

  const analysis = await analyzeStockWithLlama(stock);

  return NextResponse.json({
    success: true,
    stock: {
      ticker,
      name: stock.name,
      price: stock.price,
      change: 0,
      changePercent: 0,
      dayHigh: stock.price * 1.02,
      dayLow: stock.price * 0.98,
      yearHigh: stock.price * 1.25,
      yearLow: stock.price * 0.7,
      volume: 1000000,
      avgVolume: 2000000,
      marketCap: stock.price * 10000000,
      pe: stock.pe,
      beta: stock.beta,
      eps: stock.price / 20,
      dividend: 1.5,
      sector: stock.sector,
      exchange: 'NSE',
    },
    technical: null,
    fundamental: null,
    aiAnalysis: analysis,
    recommendation: {
      entryPrice: stock.price,
      targetPrice1: stock.price * 1.08,
      targetPrice2: stock.price * 1.15,
      stopLoss: stock.price * 0.96,
      riskReward1: '2.0',
      riskReward2: '3.0',
      quantity: Math.floor(500000 / stock.price),
      investmentAmount: 500000,
      holdingPeriod: 6,
      confidence: 70,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ticker = body.ticker?.toUpperCase();

    if (!ticker) {
      return NextResponse.json({ error: 'Ticker required' }, { status: 400 });
    }

    const stockData = stockDatabase[ticker];
    if (!stockData) {
      return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
    }

    const stock: StockData = {
      ticker,
      name: stockData.name || ticker,
      sector: stockData.sector || 'Unknown',
      price: stockData.price || 100,
      changePercent: 0,
      pe: stockData.pe || 20,
      beta: stockData.beta || 1,
    };

    console.log('>> Analyzing:', ticker);

    const analysis = await analyzeStockWithLlama(stock);

    // Return in frontend-compatible format
    return NextResponse.json({
      success: true,
      stock: {
        ticker,
        name: stock.name,
        price: stock.price,
        change: 0,
        changePercent: 0,
        dayHigh: stock.price * 1.02,
        dayLow: stock.price * 0.98,
        yearHigh: stock.price * 1.25,
        yearLow: stock.price * 0.7,
        volume: 1000000,
        avgVolume: 2000000,
        marketCap: stock.price * 10000000,
        pe: stock.pe,
        beta: stock.beta,
        eps: stock.price / 20,
        dividend: 1.5,
        sector: stock.sector,
        exchange: 'NSE',
      },
      technical: null,
      fundamental: null,
      aiAnalysis: analysis,
      recommendation: {
        entryPrice: stock.price,
        targetPrice1: stock.price * 1.08,
        targetPrice2: stock.price * 1.15,
        stopLoss: stock.price * 0.96,
        riskReward1: '2.0',
        riskReward2: '3.0',
        quantity: Math.floor(500000 / stock.price),
        investmentAmount: 500000,
        holdingPeriod: 6,
        confidence: 70,
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}