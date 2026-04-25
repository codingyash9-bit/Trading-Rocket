// app/api/wargame/detect/route.ts
import { NextRequest, NextResponse } from 'next/server';

const STOCKS = [
  'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'SBIN', 'BHARTIARTL',
  'ITC', 'HINDUNILVR', 'KOTAKBANK', 'BAJFINANCE', 'ASIANPAINT', 'TITAN',
  'HCLTECH', 'WIPRO', 'TECHMAH', 'SUNPHARMA', 'ULTC', 'NTPC', 'ONGC',
  'IOC', 'HDFCLIFE', 'SBILIFE', 'CIPLA', 'MARUTI', 'M&M', 'EICHERMOT',
  'TVSMOTOR', 'HEROMOTOCO', 'BAJAJ_AUTO', 'ADANIPORTS', 'ADANIENT',
  'ADANIGREEN', 'ADANITRANS', 'DRREDDY', 'DIVISLAB', 'COALINDIA',
  'POWERGRID', 'BPCL', 'TATASTEEL', 'TATAMOTORS', 'BRITANNIA', 'NESTLEIND'
];

const MOCK_EARNINGS: Record<string, { daysUntil: number; basePrice: number }> = {
  TCS: { daysUntil: 5, basePrice: 4125 },
  INFY: { daysUntil: 12, basePrice: 1845 },
  RELIANCE: { daysUntil: 18, basePrice: 2856 },
  HDFCBANK: { daysUntil: 22, basePrice: 1723 },
  BAJFINANCE: { daysUntil: 8, basePrice: 7245 },
  TATAMOTORS: { daysUntil: 15, basePrice: 785 },
  MARUTI: { daysUntil: 25, basePrice: 12580 },
  SUNPHARMA: { daysUntil: 3, basePrice: 1685 },
};

const SECTORS: Record<string, string> = {
  RELIANCE: 'Conglomerate', TCS: 'IT', HDFCBANK: 'Banking', INFY: 'IT',
  ICICIBANK: 'Banking', SBIN: 'Banking', BHARTIARTL: 'Telecom', ITC: 'FMCG',
  HINDUNILVR: 'FMCG', KOTAKBANK: 'Banking', BAJFINANCE: 'NBFC', ASIANPAINT: 'Chemicals',
  TITAN: 'Jewellery', HCLTECH: 'IT', WIPRO: 'IT', TECHMAH: 'IT', SUNPHARMA: 'Pharmaceuticals',
  ULTC: 'Cement', NTPC: 'Power', ONGC: 'Oil & Gas', IOC: 'Oil & Gas', HDFCLIFE: 'Insurance',
  SBILIFE: 'Insurance', CIPLA: 'Pharmaceuticals', MARUTI: 'Automobile', 'M&M': 'Automobile',
  EICHERMOT: 'Automobile', TVSMOTOR: 'Automobile', HEROMOTOCO: 'Automobile',
  BAJAJ_AUTO: 'Automobile', ADANIPORTS: 'Infrastructure', ADANIENT: 'Conglomerate',
  ADANIGREEN: 'Power', ADANITRANS: 'Power', DRREDDY: 'Pharmaceuticals', DIVISLAB: 'Pharmaceuticals',
  COALINDIA: 'Mining', POWERGRID: 'Power', BPCL: 'Oil & Gas', TATASTEEL: 'Metals',
  TATAMOTORS: 'Automobile', BRITANNIA: 'FMCG', NESTLEIND: 'FMCG'
};

export async function GET(request: NextRequest) {
  try {
    const earningsEvents = [];

    for (const ticker of STOCKS) {
      const mockData = MOCK_EARNINGS[ticker];
      const daysUntil = mockData?.daysUntil ?? Math.floor(Math.random() * 30) + 1;
      const basePrice = mockData?.basePrice ?? 1000;
      const sector = SECTORS[ticker] || 'Unknown';

      if (daysUntil <= 30) {
        const earningsDate = new Date();
        earningsDate.setDate(earningsDate.getDate() + daysUntil);

        earningsEvents.push({
          event_id: `wg-${ticker}-${Date.now()}`,
          ticker,
          earnings_date: earningsDate.toISOString(),
          days_until: daysUntil,
          status: 'PENDING',
          company_name: ticker,
          current_price: basePrice,
          sector
        });
      }
    }

    earningsEvents.sort((a, b) => a.days_until - b.days_until);

    return NextResponse.json({
      success: true,
      events: earningsEvents,
      cached: false,
      total_scanned: STOCKS.length
    });
  } catch (error) {
    console.error('Wargame detect error:', error);
    return NextResponse.json({ success: false, events: [], error: 'Detection failed' }, { status: 500 });
  }
}