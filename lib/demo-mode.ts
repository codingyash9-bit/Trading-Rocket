'use client';

export const DEMO_MODE = true;

export const DEMO_CONFIG = {
  enabled: DEMO_MODE,
  simulateDelay: true,
  delayMs: 800,
  showBanner: true,
  bannerMessage: '🚀 Demo Mode - Using simulated data',
};

export const mockStocks = {
  RELIANCE: { symbol: 'RELIANCE', price: 2847.65, change: 2.34, changePercent: 0.82 },
  TCS: { symbol: 'TCS', price: 4123.45, change: -15.20, changePercent: -0.37 },
  HDFCBANK: { symbol: 'HDFCBANK', price: 1542.30, change: 28.50, changePercent: 1.88 },
  INFY: { symbol: 'INFY', price: 1823.60, change: -8.40, changePercent: -0.46 },
  TATAMOTORS: { symbol: 'TATAMOTORS', price: 712.25, change: 15.80, changePercent: 2.27 },
  ICICIBANK: { symbol: 'ICICIBANK', price: 1058.90, change: 12.30, changePercent: 1.18 },
  SBIN: { symbol: 'SBIN', price: 678.45, change: -5.20, changePercent: -0.76 },
  BHARTIARTL: { symbol: 'BHARTIARTL', price: 1456.75, change: 22.50, changePercent: 1.57 },
};

export const mockNews = [
  {
    title: 'RBI keeps repo rate unchanged at 6.5%',
    summary: 'RBI maintains status quo amid inflation concerns',
    source: 'Economic Times',
    url: '#',
    publishedAt: new Date().toISOString(),
  },
  {
    title: 'NIFTY hits all-time high of 22850',
    summary: 'Indian markets rally on strong foreign inflows',
    source: 'Mint',
    url: '#',
    publishedAt: new Date().toISOString(),
  },
  {
    title: 'IT sector sees renewed FII interest',
    summary: 'Foreign investors betting big on Indian IT stocks',
    source: 'Business Standard',
    url: '#',
    publishedAt: new Date().toISOString(),
  },
];

export const mockAnalysis = {
  sentiment: 'bullish',
  confidence: 78,
  recommendation: 'BUY',
  targetPrice: 3200,
  stopLoss: 2650,
  timeframe: '3-6 months',
  keyReasons: [
    'Strong Q4 results beat expectations',
    'Margin expansion in core business',
    'Favorable sector tailwinds',
  ],
};

export const mockMarketPulse = {
  nifty: { value: 22850.45, change: 125.30, changePercent: 0.55 },
  sensex: { value: 75623.12, change: 412.50, changePercent: 0.55 },
  bankNifty: { value: 48234.67, change: -89.23, changePercent: -0.18 },
  finNifty: { value: 21456.89, change: 234.56, changePercent: 1.10 },
  gainers: [
    { symbol: 'TATAMOTORS', price: 712.25, change: 2.27 },
    { symbol: 'HDFCBANK', price: 1542.30, change: 1.88 },
    { symbol: 'BHARTIARTL', price: 1456.75, change: 1.57 },
  ],
  losers: [
    { symbol: 'SBIN', price: 678.45, change: -0.76 },
    { symbol: 'TCS', price: 4123.45, change: -0.37 },
    { symbol: 'INFY', price: 1823.60, change: -0.46 },
  ],
};

export const mockPredictions = [
  { id: '1', ticker: 'RELIANCE', direction: 'BULLISH', confidence: 82, outcome: 'success' },
  { id: '2', ticker: 'TATAMOTORS', direction: 'BULLISH', confidence: 75, outcome: 'success' },
  { id: '3', ticker: 'INFY', direction: 'BEARISH', confidence: 68, outcome: 'failure' },
  { id: '4', ticker: 'HDFCBANK', direction: 'BULLISH', confidence: 71, outcome: 'success' },
  { id: '5', ticker: 'TCS', direction: 'BEARISH', confidence: 65, outcome: 'failure' },
];

export const mockWargame = {
  activeScenarios: [
    {
      id: 's1',
      ticker: 'RELIANCE',
      event: 'Q4 Results',
      probability: 72,
      direction: 'BULLISH',
      impact: 'High',
      timeframe: '1 week',
    },
    {
      id: 's2',
      ticker: 'RBI Policy',
      event: 'Repo Rate Decision',
      probability: 65,
      direction: 'NEUTRAL',
      impact: 'Medium',
      timeframe: '2 weeks',
    },
  ],
  historicalScenarios: [
    { id: 'h1', ticker: 'TATAMOTORS', event: 'Q3 Results', resolved: true, outcome: 'success' },
    { id: 'h2', ticker: 'INFY', event: 'Guidance Update', resolved: true, outcome: 'failure' },
  ],
};

export const mockGraveyard = {
  totalGraves: 156,
  successRate: 42,
  recentGraves: [
    { id: 'g1', ticker: 'ADANI', direction: 'BULLISH', confidence: 78, reason: 'Coal scam controversy', date: '2024-01-15' },
    { id: 'g2', ticker: 'ZOMATO', direction: 'BULLISH', confidence: 82, reason: 'Guidance miss', date: '2024-02-10' },
    { id: 'g3', ticker: 'PAYTM', direction: 'BEARISH', confidence: 75, reason: 'RBI restrictions', date: '2024-03-05' },
  ],
  patterns: [
    { pattern: 'Earnings Miss', count: 45, successRate: 28 },
    { pattern: 'Guidance Cut', count: 38, successRate: 35 },
    { pattern: 'Sector Rotation', count: 32, successRate: 42 },
  ],
};

export async function fetchWithDemoFallback<T>(apiCall: () => Promise<T>, mockData: T): Promise<T> {
  if (!DEMO_MODE) {
    try {
      return await apiCall();
    } catch {
      return mockData;
    }
  }

  if (DEMO_CONFIG.simulateDelay) {
    await new Promise((resolve) => setTimeout(resolve, DEMO_CONFIG.delayMs));
  }

  return mockData;
}

export function getMockData(key: keyof typeof mockStocks) {
  return mockStocks[key] || mockStocks.RELIANCE;
}

export function formatDemoPrice(price: number): string {
  return `₹${price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDemoChange(change: number, changePercent: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`;
}