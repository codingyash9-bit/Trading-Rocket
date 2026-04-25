import { FundamentalAnalysis, QuantitativeAnalysis, SentimentAnalysis, StrategicAnalysis, PowerVerdict } from './analysis';

export interface PortfolioReport {
  id: string;
  userId: string;
  ticker: string;
  companyName: string;
  exchange: 'NSE' | 'BSE';
  generatedAt: string;
  reports: {
    fundamental: FundamentalAnalysis | null;
    quantitative: QuantitativeAnalysis | null;
    sentiment: SentimentAnalysis | null;
    strategic: StrategicAnalysis | null;
    verdict: PowerVerdict | null;
  };
  overallScore: number;
  recommendation: PowerVerdict['finalRecommendation'];
  exportedAt?: string;
}
