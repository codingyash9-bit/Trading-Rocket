import { AnalysisTab } from './common';

export interface FeatureImportance {
  feature: string;
  impact: number; // Positive = green, Negative = red
  description: string;
  sourceExcerpt?: string;
  sourceDocument?: string;
  sourceURL?: string;
}

export interface SourceTrace {
  documentTitle: string;
  documentType: 'SEBI Filing' | 'Financial Statement' | 'News Article' | 'Research Report' | 'Company Filing';
  excerpt: string;
  relevanceScore: number;
  url?: string;
  accessedAt: string;
}

export interface XAIData {
  ticker: string;
  analysisType: AnalysisTab;
  featureImportance: FeatureImportance[];
  sourceTraces: SourceTrace[];
  modelConfidence: number;
  limitations: string[];
  generatedAt: string;
}
