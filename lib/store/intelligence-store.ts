'use client';

import { create } from 'zustand';
import { 
  AnalysisTab, 
  FundamentalAnalysis, 
  QuantitativeAnalysis, 
  SentimentAnalysis, 
  StrategicAnalysis, 
  PowerVerdict 
} from '../types';

interface StockIntelligenceStore {
  currentTicker: string | null;
  currentExchange: 'NSE' | 'BSE';
  activeTab: AnalysisTab;
  fundamentalAnalysis: FundamentalAnalysis | null;
  quantitativeAnalysis: QuantitativeAnalysis | null;
  sentimentAnalysis: SentimentAnalysis | null;
  strategicAnalysis: StrategicAnalysis | null;
  powerVerdict: PowerVerdict | null;
  isLoading: boolean;
  isGeneratingVerdict: boolean;
  analysisError: string | null;
  
  setCurrentStock: (ticker: string | null, exchange: 'NSE' | 'BSE') => void;
  setActiveTab: (tab: AnalysisTab) => void;
  setFundamentalAnalysis: (analysis: FundamentalAnalysis | null) => void;
  setQuantitativeAnalysis: (analysis: QuantitativeAnalysis | null) => void;
  setSentimentAnalysis: (analysis: SentimentAnalysis | null) => void;
  setStrategicAnalysis: (analysis: StrategicAnalysis | null) => void;
  setPowerVerdict: (verdict: PowerVerdict | null) => void;
  setLoading: (loading: boolean) => void;
  setGeneratingVerdict: (generating: boolean) => void;
  setError: (error: string | null) => void;
  resetAnalysis: () => void;
}

export const useStockIntelligenceStore = create<StockIntelligenceStore>((set) => ({
  currentTicker: null,
  currentExchange: 'NSE',
  activeTab: 'overview',
  fundamentalAnalysis: null,
  quantitativeAnalysis: null,
  sentimentAnalysis: null,
  strategicAnalysis: null,
  powerVerdict: null,
  isLoading: false,
  isGeneratingVerdict: false,
  analysisError: null,
  
  setCurrentStock: (ticker, exchange) => set({
    currentTicker: ticker,
    currentExchange: exchange,
  }),
  
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  setFundamentalAnalysis: (analysis) => set({ fundamentalAnalysis: analysis }),
  setQuantitativeAnalysis: (analysis) => set({ quantitativeAnalysis: analysis }),
  setSentimentAnalysis: (analysis) => set({ sentimentAnalysis: analysis }),
  setStrategicAnalysis: (analysis) => set({ strategicAnalysis: analysis }),
  setPowerVerdict: (verdict) => set({ powerVerdict: verdict }),
  setLoading: (loading) => set({ isLoading: loading }),
  setGeneratingVerdict: (generating) => set({ isGeneratingVerdict: generating }),
  setError: (error) => set({ analysisError: error }),
  
  resetAnalysis: () => set({
    fundamentalAnalysis: null,
    quantitativeAnalysis: null,
    sentimentAnalysis: null,
    strategicAnalysis: null,
    powerVerdict: null,
    analysisError: null,
  }),
}));
