import { NextRequest, NextResponse } from 'next/server';

const YAHOO_FINANCE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';

interface StockInfo {
  ticker: string;
  name: string;
  exchange: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  pe: number;
  dayHigh: number;
  dayLow: number;
  yearHigh: number;
  yearLow: number;
}

const stocksDatabase: StockInfo[] = [
  { ticker: 'RELIANCE', name: 'Reliance Industries', exchange: 'NSE', sector: 'Conglomerate', price: 2856, change: 0, changePercent: 0, volume: 0, marketCap: 1950000, pe: 28.5, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'TCS', name: 'Tata Consultancy Services', exchange: 'NSE', sector: 'IT Services', price: 4125, change: 0, changePercent: 0, volume: 0, marketCap: 1545000, pe: 26.8, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'HDFCBANK', name: 'HDFC Bank', exchange: 'NSE', sector: 'Banking', price: 1723, change: 0, changePercent: 0, volume: 0, marketCap: 1280000, pe: 19.2, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'INFY', name: 'Infosys', exchange: 'NSE', sector: 'IT Services', price: 1845, change: 0, changePercent: 0, volume: 0, marketCap: 765000, pe: 25.6, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'ICICIBANK', name: 'ICICI Bank', exchange: 'NSE', sector: 'Banking', price: 1124, change: 0, changePercent: 0, volume: 0, marketCap: 780000, pe: 21.3, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'SBIN', name: 'State Bank of India', exchange: 'NSE', sector: 'Banking', price: 812, change: 0, changePercent: 0, volume: 0, marketCap: 720000, pe: 14.8, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'BHARTIARTL', name: 'Bharti Airtel', exchange: 'NSE', sector: 'Telecom', price: 1425, change: 0, changePercent: 0, volume: 0, marketCap: 820000, pe: 32.4, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'ITC', name: 'ITC', exchange: 'NSE', sector: 'FMCG', price: 465, change: 0, changePercent: 0, volume: 0, marketCap: 580000, pe: 22.1, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'HINDUNILVR', name: 'Hindustan Unilever', exchange: 'NSE', sector: 'FMCG', price: 2795, change: 0, changePercent: 0, volume: 0, marketCap: 585000, pe: 56.2, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'KOTAKBANK', name: 'Kotak Mahindra Bank', exchange: 'NSE', sector: 'Banking', price: 1785, change: 0, changePercent: 0, volume: 0, marketCap: 695000, pe: 22.4, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'BAJFINANCE', name: 'Bajaj Finance', exchange: 'NSE', sector: 'NBFC', price: 7245, change: 0, changePercent: 0, volume: 0, marketCap: 485000, pe: 34.2, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'ASIANPAINT', name: 'Asian Paints', exchange: 'NSE', sector: 'Chemicals', price: 3185, change: 0, changePercent: 0, volume: 0, marketCap: 305000, pe: 52.8, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'TITAN', name: 'Titan Company', exchange: 'NSE', sector: 'Jewellery', price: 3580, change: 0, changePercent: 0, volume: 0, marketCap: 315000, pe: 38.5, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'HCLTECH', name: 'HCL Technologies', exchange: 'NSE', sector: 'IT Services', price: 1685, change: 0, changePercent: 0, volume: 0, marketCap: 465000, pe: 22.4, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'WIPRO', name: 'Wipro', exchange: 'NSE', sector: 'IT Services', price: 545, change: 0, changePercent: 0, volume: 0, marketCap: 285000, pe: 18.5, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'TECHMAH', name: 'Tech Mahindra', exchange: 'NSE', sector: 'IT Services', price: 1580, change: 0, changePercent: 0, volume: 0, marketCap: 145000, pe: 19.8, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'SUNPHARMA', name: 'Sun Pharma', exchange: 'NSE', sector: 'Pharmaceuticals', price: 1685, change: 0, changePercent: 0, volume: 0, marketCap: 195000, pe: 28.5, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'ULTC', name: 'Ultratech Cement', exchange: 'NSE', sector: 'Cement', price: 10850, change: 0, changePercent: 0, volume: 0, marketCap: 285000, pe: 38.2, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'NTPC', name: 'NTPC', exchange: 'NSE', sector: 'Power', price: 385, change: 0, changePercent: 0, volume: 0, marketCap: 385000, pe: 12.5, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'ONGC', name: 'ONGC', exchange: 'NSE', sector: 'Oil & Gas', price: 285, change: 0, changePercent: 0, volume: 0, marketCap: 285000, pe: 8.5, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'IOC', name: 'Indian Oil Corp', exchange: 'NSE', sector: 'Oil & Gas', price: 165, change: 0, changePercent: 0, volume: 0, marketCap: 165000, pe: 7.2, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'COALINDIA', name: 'Coal India', exchange: 'NSE', sector: 'Mining', price: 385, change: 0, changePercent: 0, volume: 0, marketCap: 245000, pe: 8.2, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'ADANIPORTS', name: 'Adani Ports', exchange: 'NSE', sector: 'Infrastructure', price: 1485, change: 0, changePercent: 0, volume: 0, marketCap: 185000, pe: 28.5, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'M&M', name: 'Mahindra & Mahindra', exchange: 'NSE', sector: 'Automobile', price: 3185, change: 0, changePercent: 0, volume: 0, marketCap: 185000, pe: 24.2, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'MARUTI', name: 'Maruti Suzuki', exchange: 'NSE', sector: 'Automobile', price: 12580, change: 0, changePercent: 0, volume: 0, marketCap: 385000, pe: 28.5, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'EICHERMOT', name: 'Eicher Motors', exchange: 'NSE', sector: 'Automobile', price: 4580, change: 0, changePercent: 0, volume: 0, marketCap: 125000, pe: 28.5, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'HEROMOTOCO', name: 'Hero MotoCorp', exchange: 'NSE', sector: 'Automobile', price: 4580, change: 0, changePercent: 0, volume: 0, marketCap: 185000, pe: 18.2, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'BAJAJ_AUTO', name: 'Bajaj Auto', exchange: 'NSE', sector: 'Automobile', price: 9280, change: 0, changePercent: 0, volume: 0, marketCap: 250000, pe: 16.5, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'CIPLA', name: 'Cipla', exchange: 'NSE', sector: 'Pharmaceuticals', price: 1485, change: 0, changePercent: 0, volume: 0, marketCap: 125000, pe: 25.2, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'DRREDDY', name: "Dr. Reddy's", exchange: 'NSE', sector: 'Pharmaceuticals', price: 5680, change: 0, changePercent: 0, volume: 0, marketCap: 95000, pe: 22.8, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'DIVISLAB', name: "Divi's Labs", exchange: 'NSE', sector: 'Pharmaceuticals', price: 4580, change: 0, changePercent: 0, volume: 0, marketCap: 145000, pe: 32.5, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'HDFCLIFE', name: 'HDFC Life Insurance', exchange: 'NSE', sector: 'Insurance', price: 685, change: 0, changePercent: 0, volume: 0, marketCap: 145000, pe: 45.2, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'SBILIFE', name: 'SBI Life Insurance', exchange: 'NSE', sector: 'Insurance', price: 1895, change: 0, changePercent: 0, volume: 0, marketCap: 195000, pe: 38.5, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'TATASTEEL', name: 'Tata Steel', exchange: 'NSE', sector: 'Metals', price: 1580, change: 0, changePercent: 0, volume: 0, marketCap: 185000, pe: 12.5, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'TATAMOTORS', name: 'Tata Motors', exchange: 'NSE', sector: 'Automobile', price: 785, change: 0, changePercent: 0, volume: 0, marketCap: 285000, pe: 8.5, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'BRITANNIA', name: 'Britannia', exchange: 'NSE', sector: 'FMCG', price: 5285, change: 0, changePercent: 0, volume: 0, marketCap: 125000, pe: 42.5, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'NESTLEIND', name: 'Nestle India', exchange: 'NSE', sector: 'FMCG', price: 2585, change: 0, changePercent: 0, volume: 0, marketCap: 245000, pe: 48.5, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
];

const etfDatabase: StockInfo[] = [
  { ticker: 'NIFTYBEES', name: 'Nifty BeES ETF', exchange: 'NSE', sector: 'ETF', price: 985, change: 0, changePercent: 0, volume: 0, marketCap: 0, pe: 0, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'GOLDBEES', name: 'Gold BeES ETF', exchange: 'NSE', sector: 'ETF', price: 5680, change: 0, changePercent: 0, volume: 0, marketCap: 0, pe: 0, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'SILVERBEES', name: 'Silver BeES ETF', exchange: 'NSE', sector: 'ETF', price: 845, change: 0, changePercent: 0, volume: 0, marketCap: 0, pe: 0, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'LIQUIDBEES', name: 'Liquid BeES ETF', exchange: 'NSE', sector: 'ETF', price: 1185, change: 0, changePercent: 0, volume: 0, marketCap: 0, pe: 0, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'MIDCAPBEES', name: 'Midcap BeES ETF', exchange: 'NSE', sector: 'ETF', price: 425, change: 0, changePercent: 0, volume: 0, marketCap: 0, pe: 0, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'POWERGEMS', name: 'Power Grid ETF', exchange: 'NSE', sector: 'ETF', price: 145, change: 0, changePercent: 0, volume: 0, marketCap: 0, pe: 0, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'MON100', name: 'Motilal Oswal MOSt 100', exchange: 'NSE', sector: 'ETF', price: 285, change: 0, changePercent: 0, volume: 0, marketCap: 0, pe: 0, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'KOTAKETF', name: 'Kotak ETF', exchange: 'NSE', sector: 'ETF', price: 825, change: 0, changePercent: 0, volume: 0, marketCap: 0, pe: 0, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
];

const ipoDatabase: StockInfo[] = [
  { ticker: 'TATAARM', name: 'Tata Arm Ltd', exchange: 'NSE', sector: 'IPO', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: 0, pe: 0, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'OYOLIFE', name: 'Oyo Life', exchange: 'NSE', sector: 'IPO', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: 0, pe: 0, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'LERTHPRO', name: 'Leroth Pro', exchange: 'NSE', sector: 'IPO', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: 0, pe: 0, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'BLUEEX', name: 'Blue Express', exchange: 'NSE', sector: 'IPO', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: 0, pe: 0, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'FRESH2LIST', name: 'Fresh2List', exchange: 'NSE', sector: 'IPO', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: 0, pe: 0, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
];

const commodityDatabase: StockInfo[] = [
  { ticker: 'GOLDM', name: 'Gold (MCX)', exchange: 'MCX', sector: 'Commodity', price: 78500, change: 0, changePercent: 0, volume: 0, marketCap: 0, pe: 0, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'SILVERM', name: 'Silver (MCX)', exchange: 'MCX', sector: 'Commodity', price: 92500, change: 0, changePercent: 0, volume: 0, marketCap: 0, pe: 0, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'CRUDEOIL', name: 'Crude Oil', exchange: 'MCX', sector: 'Commodity', price: 5680, change: 0, changePercent: 0, volume: 0, marketCap: 0, pe: 0, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'NATURALGAS', name: 'Natural Gas', exchange: 'MCX', sector: 'Commodity', price: 185, change: 0, changePercent: 0, volume: 0, marketCap: 0, pe: 0, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'COPPER', name: 'Copper', exchange: 'MCX', sector: 'Commodity', price: 785, change: 0, changePercent: 0, volume: 0, marketCap: 0, pe: 0, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'ZINC', name: 'Zinc', exchange: 'MCX', sector: 'Commodity', price: 285, change: 0, changePercent: 0, volume: 0, marketCap: 0, pe: 0, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'ALUMINIUM', name: 'Aluminium', exchange: 'MCX', sector: 'Commodity', price: 245, change: 0, changePercent: 0, volume: 0, marketCap: 0, pe: 0, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'NICKEL', name: 'Nickel', exchange: 'MCX', sector: 'Commodity', price: 1450, change: 0, changePercent: 0, volume: 0, marketCap: 0, pe: 0, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
];

const forexDatabase: StockInfo[] = [
  { ticker: 'USDINR', name: 'USD/INR', exchange: 'FX', sector: 'Forex', price: 83.25, change: 0, changePercent: 0, volume: 0, marketCap: 0, pe: 0, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'EURINR', name: 'EUR/INR', exchange: 'FX', sector: 'Forex', price: 89.85, change: 0, changePercent: 0, volume: 0, marketCap: 0, pe: 0, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'GBPINR', name: 'GBP/INR', exchange: 'FX', sector: 'Forex', price: 105.25, change: 0, changePercent: 0, volume: 0, marketCap: 0, pe: 0, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'JPYINR', name: 'JPY/INR', exchange: 'FX', sector: 'Forex', price: 0.52, change: 0, changePercent: 0, volume: 0, marketCap: 0, pe: 0, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
  { ticker: 'AEDINR', name: 'AED/INR', exchange: 'FX', sector: 'Forex', price: 22.65, change: 0, changePercent: 0, volume: 0, marketCap: 0, pe: 0, dayHigh: 0, dayLow: 0, yearHigh: 0, yearLow: 0 },
];

const stockCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30000;

async function fetchStockPrices(): Promise<any[]> {
  const results = await Promise.all(
    stocksDatabase.map(async (stock) => {
      try {
        const symbol = `${stock.ticker}.NS`;
        const url = `${YAHOO_FINANCE_URL}/${symbol}?interval=1d&range=5d`;
        
        const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        
        if (!response.ok) {
          return { ...stock, fetched: false };
        }
        
        const data = await response.json();
        const result = data.chart?.result?.[0];
        
        if (!result?.meta) {
          return { ...stock, fetched: false };
        }
        
        const meta = result.meta;
        
        return {
          ...stock,
          price: meta.regularMarketPrice || stock.price,
          change: meta.regularMarketChange || 0,
          changePercent: meta.regularMarketChangePercent || 0,
          volume: meta.regularMarketVolume || 0,
          dayHigh: meta.regularMarketDayHigh || 0,
          dayLow: meta.regularMarketDayLow || 0,
          yearHigh: meta.fiftyTwoWeekHigh || 0,
          yearLow: meta.fiftyTwoWeekLow || 0,
          marketCap: meta.marketCap || 0,
          pe: meta.peRatio || stock.pe,
          fetched: true,
        };
      } catch (error) {
        return { ...stock, fetched: false };
      }
    })
  );
  
  return results;
}

async function fetchETFPrices(): Promise<any[]> {
  const etfTickers = ['NIFTYBEES', 'GOLDBEES', 'SILVERBEES', 'LIQUIDBEES', 'MIDCAPBEES', 'POWERGEMS'];
  const results = await Promise.all(
    etfTickers.map(async (ticker) => {
      try {
        const url = `${YAHOO_FINANCE_URL}/${ticker}.NS?interval=1d&range=5d`;
        const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        
        if (!response.ok) {
          const etf = etfDatabase.find(e => e.ticker === ticker);
          return etf ? { ...etf, fetched: false } : null;
        }
        
        const data = await response.json();
        const result = data.chart?.result?.[0];
        const meta = result?.meta;
        
        const etf = etfDatabase.find(e => e.ticker === ticker);
        return {
          ...etf,
          price: meta?.regularMarketPrice || etf?.price || 0,
          change: meta?.regularMarketChange || 0,
          changePercent: meta?.regularMarketChangePercent || 0,
          volume: meta?.regularMarketVolume || 0,
          dayHigh: meta?.regularMarketDayHigh || 0,
          dayLow: meta?.regularMarketDayLow || 0,
          fetched: true,
        };
      } catch {
        const etf = etfDatabase.find(e => e.ticker === ticker);
        return etf ? { ...etf, fetched: false } : null;
      }
    })
  );
  return results.filter(Boolean);
}

async function fetchCommodityPrices(): Promise<any[]> {
  const commodityTickers = [
    { ticker: 'GOLDM', name: 'Gold (MCX)', suffix: 'NS' },
    { ticker: 'SILVERM', name: 'Silver (MCX)', suffix: 'NS' },
    { ticker: 'CRUDEOIL', name: 'Crude Oil', suffix: 'NS' },
    { ticker: 'NATURALGAS', name: 'Natural Gas', suffix: 'NS' },
  ];
  
  const results = await Promise.all(
    commodityTickers.map(async ({ ticker, name, suffix }) => {
      try {
        const url = `${YAHOO_FINANCE_URL}/${ticker}.${suffix}?interval=1d&range=5d`;
        const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        
        if (!response.ok) {
          const c = commodityDatabase.find(c => c.ticker === ticker);
          return c ? { ...c, fetched: false } : null;
        }
        
        const data = await response.json();
        const result = data.chart?.result?.[0];
        const meta = result?.meta;
        
        const c = commodityDatabase.find(c => c.ticker === ticker);
        return {
          ...c,
          name: meta?.symbol?.shortName || name,
          price: meta?.regularMarketPrice || c?.price || 0,
          change: meta?.regularMarketChange || 0,
          changePercent: meta?.regularMarketChangePercent || 0,
          volume: meta?.regularMarketVolume || 0,
          dayHigh: meta?.regularMarketDayHigh || 0,
          dayLow: meta?.regularMarketDayLow || 0,
          fetched: true,
        };
      } catch {
        const c = commodityDatabase.find(c => c.ticker === ticker);
        return c ? { ...c, fetched: false } : null;
      }
    })
  );
  return results.filter(Boolean);
}

async function fetchForexPrices(): Promise<any[]> {
  const forexTickers = [
    { ticker: 'USDINR=X', name: 'USD/INR' },
    { ticker: 'EURINR=X', name: 'EUR/INR' },
    { ticker: 'GBPINR=X', name: 'GBP/INR' },
    { ticker: 'JPYINR=X', name: 'JPY/INR' },
  ];
  
  const results = await Promise.all(
    forexTickers.map(async ({ ticker, name }) => {
      try {
        const url = `${YAHOO_FINANCE_URL}/${ticker}?interval=1d&range=5d`;
        const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        
        if (!response.ok) {
          const f = forexDatabase.find(f => f.ticker === ticker.replace('=X', ''));
          return f ? { ...f, fetched: false } : null;
        }
        
        const data = await response.json();
        const result = data.chart?.result?.[0];
        const meta = result?.meta;
        
        const f = forexDatabase.find(f => f.ticker === ticker.replace('=X', ''));
        return {
          ...f,
          name: meta?.symbol?.shortName || name,
          price: meta?.regularMarketPrice || f?.price || 0,
          change: meta?.regularMarketChange || 0,
          changePercent: meta?.regularMarketChangePercent || 0,
          fetched: true,
        };
      } catch {
        const f = forexDatabase.find(f => f.ticker === ticker.replace('=X', ''));
        return f ? { ...f, fetched: false } : null;
      }
    })
  );
  return results.filter(Boolean);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'stocks';
  
  const now = Date.now();
  const cached = stockCache.get(type);
  
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return NextResponse.json({ success: true, data: cached.data, cached: true });
  }
  
  let data: any[] | { stocks: any[]; etfs: any[]; commodities: any[]; forex: any[] } = [];
  
  if (type === 'stocks') {
    data = await fetchStockPrices();
  } else if (type === 'etfs') {
    data = await fetchETFPrices();
  } else if (type === 'commodities' || type === 'elements') {
    data = await fetchCommodityPrices();
  } else if (type === 'forex') {
    data = await fetchForexPrices();
  } else if (type === 'ipos') {
    data = ipoDatabase;
  } else if (type === 'trending') {
    const prices = await fetchStockPrices();
    data = prices.sort((a, b) => (b.changePercent || 0) - (a.changePercent || 0)).slice(0, 10);
  } else if (type === 'gainers') {
    const prices = await fetchStockPrices();
    data = prices.filter(s => s.changePercent > 0).sort((a, b) => (b.changePercent || 0) - (a.changePercent || 0)).slice(0, 10);
  } else if (type === 'losers') {
    const prices = await fetchStockPrices();
    data = prices.filter(s => s.changePercent < 0).sort((a, b) => (a.changePercent || 0) - (b.changePercent || 0)).slice(0, 10);
  } else if (type === 'most_active') {
    const prices = await fetchStockPrices();
    data = prices.sort((a, b) => (b.volume || 0) - (a.volume || 0)).slice(0, 10);
  } else if (type === 'all') {
    const [stocks, etfs, commodities, forex] = await Promise.all([
      fetchStockPrices(),
      fetchETFPrices(),
      fetchCommodityPrices(),
      fetchForexPrices(),
    ]);
    data = { stocks, etfs, commodities, forex };
  }
  
  stockCache.set(type, { data, timestamp: now });
  
  return NextResponse.json({
    success: true,
    data,
    cached: false,
    timestamp: new Date().toISOString(),
  });
}