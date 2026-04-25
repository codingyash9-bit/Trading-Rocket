import { SignalType, SentimentSource } from './common';
import { SentimentAnalysis } from './analysis';

export interface RadarSignal {
  type: SignalType;
  source: string;
  timestamp: string;
  description: string;
}

export interface TrackedCompany {
  id: string;
  ticker: string;
  exchange: 'NSE' | 'BSE';
  name: string;
  addedPrice: number;
  lastPrice: number;
  changePercent: number;
  addedAt: string;
  lastUpdated: string;
  recentSignals: RadarSignal[];
  sentimentScore: number;
  sentimentLabel: SentimentAnalysis['overallSentiment']['label'];
  alerts: string[];
}

export interface RadarChartData {
  dimension: string;
  value: number;
  maxValue: number;
}
