import { z } from 'zod';

// Fundamental Analysis Schema
export const FinancialRatiosSchema = z.object({
  peRatio: z.number().describe('Price-to-Earnings ratio'),
  pbRatio: z.number().describe('Price-to-Book ratio'),
  roe: z.number().describe('Return on Equity percentage'),
  debtToEquity: z.number().describe('Debt to Equity ratio'),
  currentRatio: z.number().describe('Current ratio'),
  quickRatio: z.number().describe('Quick ratio'),
  operatingMargin: z.number().describe('Operating margin percentage'),
  netMargin: z.number().describe('Net profit margin percentage'),
  dividendYield: z.number().describe('Dividend yield percentage'),
  eps: z.number().describe('Earnings per share in INR'),
});

export const FundamentalAnalysisSchema = z.object({
  ticker: z.string(),
  companyName: z.string(),
  analysisDate: z.string(),
  sector: z.string(),
  industry: z.string(),
  revenue: z.object({
    quarterly: z.number().describe('Quarterly revenue in Crores'),
    yearly: z.number().describe('Yearly revenue in Crores'),
    yoyGrowth: z.number().describe('Year-over-Year growth percentage'),
    QoQGrowth: z.number().describe('Quarter-over-Quarter growth percentage'),
  }),
  profitability: z.object({
    operatingProfit: z.number().describe('Operating profit in Crores'),
    netProfit: z.number().describe('Net profit in Crores'),
    ebitda: z.number().describe('EBITDA in Crores'),
    grossMargin: z.number().describe('Gross margin percentage'),
  }),
  balanceSheet: z.object({
    totalAssets: z.number().describe('Total assets in Crores'),
    totalLiabilities: z.number().describe('Total liabilities in Crores'),
    netWorth: z.number().describe('Net worth in Crores'),
    reservesAndSurplus: z.number().describe('Reserves and surplus in Crores'),
  }),
  cashFlow: z.object({
    operatingCashFlow: z.number().describe('Operating cash flow in Crores'),
    investingCashFlow: z.number().describe('Investing cash flow in Crores'),
    financingCashFlow: z.number().describe('Financing cash flow in Crores'),
    freeCashFlow: z.number().describe('Free cash flow in Crores'),
  }),
  ratios: FinancialRatiosSchema,
  valuationSignals: z.object({
    isOvervalued: z.boolean(),
    isUndervalued: z.boolean(),
    fairValue: z.number().describe('Fair value estimate in INR'),
    marginOfSafety: z.number().describe('Margin of safety percentage'),
    riskSignals: z.array(z.string()),
  }),
  narrative: z.string().describe('Detailed narrative analysis'),
  recommendation: z.enum(['Strong Buy', 'Buy', 'Hold', 'Sell', 'Strong Sell']),
  confidenceScore: z.number().min(0).max(100),
});

// Quantitative Analysis Schema
export const QuantitativeAnalysisSchema = z.object({
  ticker: z.string(),
  companyName: z.string(),
  analysisDate: z.string(),
  technicalIndicators: z.object({
    sma20: z.number().describe('20-day Simple Moving Average in INR'),
    sma50: z.number().describe('50-day Simple Moving Average in INR'),
    sma200: z.number().describe('200-day Simple Moving Average in INR'),
    ema12: z.number().describe('12-day Exponential Moving Average in INR'),
    ema26: z.number().describe('26-day Exponential Moving Average in INR'),
    rsi: z.number().describe('Relative Strength Index (0-100)'),
    macd: z.object({
      value: z.number(),
      signal: z.number(),
      histogram: z.number(),
    }),
    bollingerBands: z.object({
      upper: z.number(),
      middle: z.number(),
      lower: z.number(),
    }),
    atr: z.number().describe('Average True Range'),
    adx: z.number().describe('Average Directional Index'),
  }),
  statisticalMetrics: z.object({
    volatility: z.number().describe('Historical volatility percentage'),
    beta: z.number().describe('Beta coefficient relative to NIFTY 50'),
    alpha: z.number().describe('Alpha percentage'),
    sharpeRatio: z.number().describe('Sharpe ratio'),
    sortinoRatio: z.number().describe('Sortino ratio'),
    maxDrawdown: z.number().describe('Maximum drawdown percentage'),
    standardDeviation: z.number().describe('Standard deviation percentage'),
  }),
  probabilityModels: z.object({
    priceUpProbability: z.number().min(0).max(1).describe('Probability of price increase'),
    priceDownProbability: z.number().min(0).max(1).describe('Probability of price decrease'),
    expectedReturn: z.number().describe('Expected return percentage'),
    valueAtRisk: z.number().describe('VaR at 95% confidence in INR'),
    conditionalVaR: z.number().describe('Conditional VaR in INR'),
    winRate: z.number().describe('Historical win rate percentage'),
    riskRewardRatio: z.number().describe('Risk/Reward ratio'),
  }),
  patternAnalysis: z.object({
    detectedPatterns: z.array(z.object({
      pattern: z.string(),
      confidence: z.number().min(0).max(100),
      direction: z.enum(['bullish', 'bearish', 'neutral']),
      targetPrice: z.number().optional(),
    })),
    supportLevels: z.array(z.number()),
    resistanceLevels: z.array(z.number()),
  }),
  mathematicalModels: z.object({
    blackScholes: z.object({
      callPrice: z.number().optional(),
      putPrice: z.number().optional(),
      impliedVolatility: z.number(),
    }).optional(),
    monteCarloPaths: z.number(),
    confidenceInterval: z.object({
      lower: z.number(),
      upper: z.number(),
    }),
  }),
  signals: z.object({
    primarySignal: z.enum(['bullish', 'bearish', 'neutral']),
    strength: z.number().min(0).max(100),
    explanation: z.string(),
  }),
});

// Sentiment Analysis Schema
export const SentimentItemSchema = z.object({
  id: z.string(),
  headline: z.string(),
  source: z.enum(['news', 'twitter', 'reddit', 'instagram']),
  sourceName: z.string(),
  url: z.string().optional(),
  publishedAt: z.string(),
  sentiment: z.number().min(-1).max(1),
  sentimentLabel: z.enum(['Very Negative', 'Negative', 'Neutral', 'Positive', 'Very Positive']),
  relevance: z.number().min(0).max(1),
  keyEntities: z.array(z.string()),
  excerpt: z.string(),
});

export const SentimentAnalysisSchema = z.object({
  ticker: z.string(),
  companyName: z.string(),
  analysisDate: z.string(),
  overallSentiment: z.object({
    score: z.number().min(-1).max(1),
    label: z.enum(['Very Negative', 'Negative', 'Neutral', 'Positive', 'Very Positive']),
    confidence: z.number().min(0).max(100),
    trend: z.enum(['improving', 'stable', 'declining']),
  }),
  sourceBreakdown: z.object({
    news: z.object({
      sentiment: z.number(),
      count: z.number(),
      articles: z.array(SentimentItemSchema),
    }),
    twitter: z.object({
      sentiment: z.number(),
      count: z.number(),
      tweets: z.array(SentimentItemSchema),
    }),
    reddit: z.object({
      sentiment: z.number(),
      count: z.number(),
      posts: z.array(SentimentItemSchema),
    }),
    instagram: z.object({
      sentiment: z.number(),
      count: z.number(),
      posts: z.array(SentimentItemSchema),
    }),
  }),
  keyThemes: z.array(z.object({
    theme: z.string(),
    frequency: z.number(),
    sentiment: z.number(),
  })),
  influencerAnalysis: z.array(z.object({
    name: z.string(),
    handle: z.string(),
    followers: z.number(),
    sentiment: z.number(),
    reach: z.number(),
  })),
  eventImpact: z.array(z.object({
    event: z.string(),
    date: z.string(),
    sentimentChange: z.number(),
    priceCorrelation: z.number(),
  })),
  narrative: z.string(),
  warningFlags: z.array(z.string()).optional(),
});

// Strategic Analysis Schema
export const StrategicAnalysisSchema = z.object({
  ticker: z.string(),
  companyName: z.string(),
  analysisDate: z.string(),
  fnoAnalysis: z.object({
    openInterest: z.object({
      callOI: z.number(),
      putOI: z.number(),
      changeInCallOI: z.number(),
      changeInPutOI: z.number(),
      pcrRatio: z.number().describe('Put-Call Ratio'),
    }),
    maxPain: z.number().describe('Max Pain strike price'),
    impliedVolatility: z.object({
      callIV: z.number(),
      putIV: z.number(),
    }),
    institutionalActivity: z.object({
      fiiNetBuy: z.number().describe('FII Net Buying in Crores'),
      diiNetBuy: z.number().describe('DII Net Buying in Crores'),
      fpiFlow: z.enum(['inflow', 'outflow', 'neutral']),
    }),
  }),
  blockDeals: z.array(z.object({
    date: z.string(),
    transactionType: z.enum(['bulk', 'block']),
    buyer: z.string().optional(),
    seller: z.string().optional(),
    quantity: z.number(),
    price: z.number(),
    value: z.number().describe('Deal value in Crores'),
    exchange: z.enum(['NSE', 'BSE']),
  })).optional(),
  capitalFlow: z.object({
    threeMonthFlow: z.number().describe('3-month capital flow in Crores'),
    sixMonthFlow: z.number().describe('6-month capital flow in Crores'),
    oneYearFlow: z.number().describe('1-year capital flow in Crores'),
    flowTrend: z.enum(['inflow', 'outflow', 'neutral']),
    sectorRotation: z.array(z.object({
      sector: z.string(),
      flowDirection: z.enum(['inflow', 'outflow']),
      strength: z.number(),
    })),
  }),
  entryExitSignals: z.object({
    entrySignal: z.object({
      type: z.enum(['aggressive', 'moderate', 'conservative']),
      priceRange: z.object({
        lower: z.number(),
        upper: z.number(),
      }),
      conviction: z.number().min(0).max(100),
      rationale: z.string(),
    }),
    exitSignal: z.object({
      stopLoss: z.number(),
      targetPrice: z.number(),
      trailingStop: z.number().optional(),
      riskRewardRatio: z.number(),
    }),
    holdingPeriod: z.object({
      minimum: z.string(),
      maximum: z.string(),
      optimal: z.string(),
    }),
  }),
  sebiDisclosures: z.array(z.object({
    filingType: z.string(),
    date: z.string(),
    description: z.string(),
    impact: z.enum(['positive', 'negative', 'neutral']),
  })).optional(),
  narrative: z.string(),
  institutionalVerdict: z.enum(['Accumulate', 'Hold', 'Reduce', 'Sell']),
  confidenceScore: z.number().min(0).max(100),
});

// Power Verdict Schema
export const PowerVerdictSchema = z.object({
  ticker: z.string(),
  companyName: z.string(),
  verdictDate: z.string(),
  executiveSummary: z.string().min(500).describe('500+ word comprehensive summary'),
  signalSynthesis: z.object({
    fundamental: z.enum(['Strong Buy', 'Buy', 'Hold', 'Sell', 'Strong Sell']),
    quantitative: z.enum(['bullish', 'neutral', 'bearish']),
    sentiment: z.enum(['Very Positive', 'Positive', 'Neutral', 'Negative', 'Very Negative']),
    strategic: z.enum(['Accumulate', 'Hold', 'Reduce', 'Sell']),
  }),
  consolidatedScore: z.number().min(0).max(100),
  finalRecommendation: z.enum(['STRONG BUY', 'BUY', 'HOLD', 'UNDER REVIEW', 'REDUCE', 'SELL']),
  keyBullishFactors: z.array(z.string()),
  keyBearishFactors: z.array(z.string()),
  riskFactors: z.array(z.string()),
  targetPrices: z.object({
    threeMonth: z.number().optional(),
    sixMonth: z.number().optional(),
    twelveMonth: z.number().optional(),
  }),
  conflictResolution: z.string().describe('Explanation of how conflicting signals were resolved'),
  verifiiableDataSources: z.array(z.object({
    source: z.string(),
    url: z.string().optional(),
    lastAccessed: z.string(),
    type: z.enum(['SEBI Filing', 'NSE/BSE Data', 'Company Financials', 'News', 'Research Report']),
  })),
  disclaimer: z.string(),
});

export type FinancialRatios = z.infer<typeof FinancialRatiosSchema>;
export type FundamentalAnalysis = z.infer<typeof FundamentalAnalysisSchema>;
export type QuantitativeAnalysis = z.infer<typeof QuantitativeAnalysisSchema>;
export type SentimentItem = z.infer<typeof SentimentItemSchema>;
export type SentimentAnalysis = z.infer<typeof SentimentAnalysisSchema>;
export type StrategicAnalysis = z.infer<typeof StrategicAnalysisSchema>;
export type PowerVerdict = z.infer<typeof PowerVerdictSchema>;
