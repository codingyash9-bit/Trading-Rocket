export type RiskTolerance = 'Conservative' | 'Moderate' | 'Aggressive';
export type TimeHorizon = 'Short-term' | 'Medium-term' | 'Long-term';
export type AnalysisTab = 'overview' | 'fundamentals' | 'technical' | 'verdict';
export type SignalType = 'bullish' | 'bearish' | 'neutral';
export type SentimentSource = 'news' | 'twitter' | 'reddit' | 'instagram';

export const INDICES = ['NIFTY 50', 'SENSEX', 'NIFTY BANK', 'NIFTY IT', 'NIFTY FMCG', 'USD/INR'] as const;
export type IndexSymbol = typeof INDICES[number];

export interface ProcessingLog {
  timestamp: string;
  message: string;
  type: 'info' | 'processing' | 'complete' | 'warning' | 'error';
  progress?: number;
}
