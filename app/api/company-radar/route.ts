import { NextRequest, NextResponse } from 'next/server';

const YAHOO_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';

const STOCK_DB: Record<string, { name: string; sector?: string }> = {
  RELIANCE: { name: 'Reliance Industries', sector: 'Conglomerate' },
  TCS: { name: 'Tata Consultancy Services', sector: 'IT Services' },
  HDFCBANK: { name: 'HDFC Bank', sector: 'Banking' },
  INFY: { name: 'Infosys', sector: 'IT Services' },
  ICICIBANK: { name: 'ICICI Bank', sector: 'Banking' },
  SBIN: { name: 'State Bank of India', sector: 'Banking' },
  BHARTIARTL: { name: 'Bharti Airtel', sector: 'Telecom' },
  ITC: { name: 'ITC', sector: 'FMCG' },
  HINDUNILVR: { name: 'Hindustan Unilever', sector: 'FMCG' },
  KOTAKBANK: { name: 'Kotak Mahindra Bank', sector: 'Banking' },
  BAJFINANCE: { name: 'Bajaj Finance', sector: 'NBFC' },
  ASIANPAINT: { name: 'Asian Paints', sector: 'Chemicals' },
  TITAN: { name: 'Titan Company', sector: 'Jewellery' },
  HCLTECH: { name: 'HCL Technologies', sector: 'IT Services' },
  WIPRO: { name: 'Wipro', sector: 'IT Services' },
  TECHMAH: { name: 'Tech Mahindra', sector: 'IT Services' },
  SUNPHARMA: { name: 'Sun Pharma', sector: 'Pharmaceuticals' },
  ULTC: { name: 'Ultratech Cement', sector: 'Cement' },
  NTPC: { name: 'NTPC', sector: 'Power' },
  ONGC: { name: 'ONGC', sector: 'Oil & Gas' },
  IOC: { name: 'Indian Oil Corp', sector: 'Oil & Gas' },
  MARUTI: { name: 'Maruti Suzuki', sector: 'Automobile' },
  'M&M': { name: 'Mahindra & Mahindra', sector: 'Automobile' },
  CIPLA: { name: 'Cipla', sector: 'Pharmaceuticals' },
  DRREDDY: { name: "Dr. Reddy's", sector: 'Pharmaceuticals' },
  DIVISLAB: { name: "Divi's Labs", sector: 'Pharmaceuticals' },
  HDFCLIFE: { name: 'HDFC Life Insurance', sector: 'Insurance' },
  SBILIFE: { name: 'SBI Life Insurance', sector: 'Insurance' },
  TATASTEEL: { name: 'Tata Steel', sector: 'Metals' },
  TATAMOTORS: { name: 'Tata Motors', sector: 'Automobile' },
  NIFTYBEES: { name: 'Nifty BeES ETF', sector: 'ETF' },
  GOLDBEES: { name: 'Gold BeES ETF', sector: 'ETF' },
  SILVERBEES: { name: 'Silver BeES ETF', sector: 'ETF' },
  GOLDM: { name: 'Gold (MCX)', sector: 'Commodity' },
  SILVERM: { name: 'Silver (MCX)', sector: 'Commodity' },
  CRUDEOIL: { name: 'Crude Oil', sector: 'Commodity' },
  USDINR: { name: 'USD/INR', sector: 'Forex' },
  EURINR: { name: 'EUR/INR', sector: 'Forex' },
};

const trackedStocks = new Map<string, any>();

function getSignals(change: number, changePercent: number): { sentiment: 'positive' | 'negative' | 'neutral'; signals: string[] } {
  const signals: string[] = [];
  let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';

  if (changePercent > 1) {
    signals.push('Strong rally');
    sentiment = 'positive';
  } else if (changePercent > 0.3) {
    signals.push('Bullish momentum');
    sentiment = 'positive';
  } else if (changePercent < -1) {
    signals.push('Sharp decline');
    sentiment = 'negative';
  } else if (changePercent < -0.3) {
    signals.push('Bearish pressure');
    sentiment = 'negative';
  }

  if (changePercent > -0.3 && changePercent < 0.3) {
    signals.push('In consolidation');
    sentiment = 'neutral';
  }

  return { sentiment, signals };
}

async function fetchStockData(symbol: string) {
  const stockInfo = STOCK_DB[symbol];
  if (!stockInfo) return null;

  try {
    const url = `${YAHOO_URL}/${symbol}.NS?interval=1d&range=5d`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });

    if (!res.ok) return null;

    const data = await res.json();
    const result = data.chart?.result?.[0];
    if (!result?.meta) return null;

    const meta = result.meta;
    const price = meta.regularMarketPrice || 0;
    const change = meta.regularMarketChange || 0;
    const changePercent = meta.regularMarketChangePercent || 0;

    const { sentiment, signals } = getSignals(change, changePercent);

    return {
      symbol,
      name: stockInfo.name,
      exchange: 'NSE',
      price,
      change: change.toFixed(2),
      changePercent: changePercent.toFixed(2),
      dayHigh: meta.regularMarketDayHigh || 0,
      dayLow: meta.regularMarketDayLow || 0,
      yearHigh: meta.fiftyTwoWeekHigh || 0,
      yearLow: meta.fiftyTwoWeekLow || 0,
      volume: meta.regularMarketVolume || 0,
      marketCap: meta.marketCap || 0,
      pe: meta.peRatio || 0,
      sentiment,
      signals,
      key_news: [],
      updated_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}

export async function GET() {
  const stocks = Array.from(trackedStocks.keys());

  if (stocks.length === 0) {
    return NextResponse.json({ message: 'No tracked stocks', stocks: [] });
  }

  const results = await Promise.all(stocks.map(async (symbol) => {
    const tracked = trackedStocks.get(symbol);
    const data = await fetchStockData(symbol);

    if (data) {
      const result = { ...data, last_analysis: tracked?.last_analysis ?? null };
      return result;
    }

    return tracked;
  }));

  return NextResponse.json({ stocks: results.filter(Boolean) });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { symbol, price, changePercent, analysis, name, sector } = body;

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol required' }, { status: 400 });
  }

  const upperSymbol = symbol.toUpperCase();
  let stockInfo = STOCK_DB[upperSymbol];

  if (!stockInfo) {
    stockInfo = { name: name || upperSymbol, sector: sector || 'Stock' };
  }

  const changeP = parseFloat(changePercent) || 0;
  const { sentiment, signals } = getSignals(changeP, changeP);

  const stockData = {
    symbol: upperSymbol,
    name: stockInfo.name,
    exchange: stockInfo.sector === 'Commodity' ? 'MCX' : stockInfo.sector === 'Forex' ? 'FX' : 'NSE',
    sector: stockInfo.sector,
    price: price || 0,
    change: ((changeP * (price || 100)) / 100).toFixed(2),
    changePercent: changeP.toFixed(2),
    sentiment,
    signals,
    last_analysis: analysis,
    key_news: [],
    updated_at: new Date().toISOString(),
  };

  trackedStocks.set(upperSymbol, stockData);

  return NextResponse.json({ success: true, stock: stockData });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol')?.toUpperCase();

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol required' }, { status: 400 });
  }

  trackedStocks.delete(symbol);

  return NextResponse.json({ success: true, message: `Removed ${symbol}` });
}