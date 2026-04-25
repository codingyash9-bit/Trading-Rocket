'use client';

import { create } from 'zustand';
import { 
  MarketIndex, 
  StockQuote, 
  TickerItem, 
  MacroImpactEvent 
} from '../types';

interface MarketDataStore {
  indices: MarketIndex[];
  trendingStocks: StockQuote[];
  tickerItems: TickerItem[];
  macroEvents: MacroImpactEvent[];
  lastUpdated: string | null;
  
  setIndices: (indices: MarketIndex[]) => void;
  setTrendingStocks: (stocks: StockQuote[]) => void;
  updateStockPrice: (ticker: string, price: number, change: number, changePercent: number) => void;
  setTickerItems: (items: TickerItem[]) => void;
  setMacroEvents: (events: MacroImpactEvent[]) => void;
}

export const useMarketDataStore = create<MarketDataStore>((set) => ({
  indices: [],
  trendingStocks: [],
  tickerItems: [],
  macroEvents: [],
  lastUpdated: null,
  
  setIndices: (indices) => set({ indices, lastUpdated: new Date().toISOString() }),
  
  setTrendingStocks: (stocks) => set({ trendingStocks: stocks }),
  
  updateStockPrice: (ticker, price, change, changePercent) => set((state) => ({
    trendingStocks: state.trendingStocks.map((stock) =>
      stock.ticker === ticker
        ? { ...stock, price, change, changePercent, lastUpdated: new Date().toISOString() }
        : stock
    ),
    lastUpdated: new Date().toISOString(),
  })),
  
  setTickerItems: (items) => set({ tickerItems: items }),
  
  setMacroEvents: (events) => set({ macroEvents: events }),
}));
