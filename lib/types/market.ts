import { IndexSymbol } from './common';

export interface MarketIndex {
  symbol: IndexSymbol;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  previousClose: number;
}

export interface StockQuote {
  ticker: string;
  exchange: 'NSE' | 'BSE';
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  dayHigh: number;
  dayLow: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number; // in Crores
  pe: number;
  beta: number;
  lastUpdated: string;
}

export interface StockSearchResult {
  ticker: string;
  name: string;
  exchange: 'NSE' | 'BSE';
  sector: string;
  matchScore: number;
}

export interface TickerItem {
  symbol: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface MacroImpactEvent {
  id: string;
  headline: string;
  source: string;
  publishedAt: string;
  globalMarket: string;
  impactedSectors: string[];
  impactLevel: 'High' | 'Medium' | 'Low';
  impactDirection: 'Positive' | 'Negative' | 'Mixed';
  summary: string;
}
