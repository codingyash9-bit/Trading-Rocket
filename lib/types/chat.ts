export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  attachments?: string[];
  structuredData?: {
    type: 'comparison_table' | 'metrics' | 'prediction' | 'explanation';
    data: Record<string, unknown>;
  };
  sources?: string[];
  confidence?: number;
  error?: boolean;
}

export interface PredictiveInsight {
  event: string;
  probability: number;
  timeframe: string;
  confidenceLevel: 'Low' | 'Medium' | 'High';
  reasoning: string;
  supportingFactors: string[];
  contradictingFactors: string[];
}

export interface AIModelResponse {
  content: string;
  structuredData?: ChatMessage['structuredData'];
  sources?: string[];
  confidence?: number;
}
