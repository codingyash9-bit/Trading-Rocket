import type {
  FormatterConfig,
  StockQuote,
  MarketIndex,
  TickerItem,
  SentimentAnalysis,
  SignalType,
} from './types';

// ============================================================================
// CURRENCY FORMATTING - INDIAN NUMBER SYSTEM
// ============================================================================

export const CURRENCY_SYMBOL = '₹';

export function formatINR(value: number, decimals: number = 2): string {
  if (value === null || value === undefined || isNaN(value)) {
    return `${CURRENCY_SYMBOL}--`;
  }
  return `${CURRENCY_SYMBOL}${value.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function formatINRCompact(value: number): string {
  if (value === null || value === undefined || isNaN(value)) {
    return `${CURRENCY_SYMBOL}--`;
  }

  if (value >= 10000000) {
    return `${CURRENCY_SYMBOL}${(value / 10000000).toFixed(2)} Cr`;
  } else if (value >= 100000) {
    return `${CURRENCY_SYMBOL}${(value / 100000).toFixed(2)} L`;
  } else if (value >= 1000) {
    return `${CURRENCY_SYMBOL}${(value / 1000).toFixed(2)} K`;
  }
  return `${CURRENCY_SYMBOL}${value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatCrores(value: number, decimals: number = 2): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '-- Cr';
  }
  return `${value.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} Cr`;
}

export function formatLakhs(value: number, decimals: number = 2): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '-- L';
  }
  return `${value.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} L`;
}

export function formatMarketCap(crores: number): string {
  if (crores >= 100000) {
    return `${(crores / 100000).toFixed(2)} Lk Cr`;
  } else if (crores >= 1000) {
    return `${(crores / 100).toFixed(2)} K Cr`;
  }
  return `${crores.toLocaleString('en-IN')} Cr`;
}

// ============================================================================
// PERCENTAGE FORMATTING
// ============================================================================

export function formatPercent(value: number, decimals: number = 2): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '--%';
  }
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

export function formatPercentSimple(value: number, decimals: number = 2): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '--%';
  }
  return `${value.toFixed(decimals)}%`;
}

// ============================================================================
// VOLUME FORMATTING
// ============================================================================

export function formatVolume(value: number): string {
  if (value >= 10000000) {
    return `${(value / 10000000).toFixed(2)} Cr`;
  } else if (value >= 100000) {
    return `${(value / 100000).toFixed(2)} L`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(2)} K`;
  }
  return value.toLocaleString('en-IN');
}

// ============================================================================
// DATE FORMATTING
// ============================================================================

export function formatDateIndian(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTimeIndian(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatTimeIST(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

export function formatRelativeTime(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDateIndian(date);
}

// ============================================================================
// FINANCIAL RATIOS FORMATTING
// ============================================================================

export function formatRatio(value: number, decimals: number = 2): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '--';
  }
  return value.toFixed(decimals);
}

export function formatROE(value: number): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '--%';
  }
  return `${value.toFixed(2)}%`;
}

// ============================================================================
// SIGNAL & SENTIMENT FORMATTING
// ============================================================================

export function getSignalColor(signal: SignalType): string {
  switch (signal) {
    case 'bullish':
      return 'text-emerald-400';
    case 'bearish':
      return 'text-red-400';
    case 'neutral':
    default:
      return 'text-slate-400';
  }
}

export function getSignalBgColor(signal: SignalType): string {
  switch (signal) {
    case 'bullish':
      return 'bg-emerald-500/10 border-emerald-500/20';
    case 'bearish':
      return 'bg-red-500/10 border-red-500/20';
    case 'neutral':
    default:
      return 'bg-slate-500/10 border-slate-500/20';
  }
}

export function getSentimentColor(score: number): string {
  if (score >= 0.6) return 'text-emerald-400';
  if (score >= 0.2) return 'text-emerald-300';
  if (score >= -0.2) return 'text-slate-400';
  if (score >= -0.6) return 'text-red-300';
  return 'text-red-400';
}

export function getSentimentBgColor(score: number): string {
  if (score >= 0.6) return 'bg-emerald-500/10';
  if (score >= 0.2) return 'bg-emerald-500/5';
  if (score >= -0.2) return 'bg-slate-500/5';
  if (score >= -0.6) return 'bg-red-500/5';
  return 'bg-red-500/10';
}

export function getSentimentLabel(score: number): SentimentAnalysis['overallSentiment']['label'] {
  if (score >= 0.6) return 'Very Positive';
  if (score >= 0.2) return 'Positive';
  if (score >= -0.2) return 'Neutral';
  if (score >= -0.6) return 'Negative';
  return 'Very Negative';
}

// ============================================================================
// RECOMMENDATION FORMATTING
// ============================================================================

export function getRecommendationColor(recommendation: string): string {
  switch (recommendation.toUpperCase()) {
    case 'STRONG BUY':
      return 'text-emerald-400';
    case 'BUY':
      return 'text-emerald-300';
    case 'HOLD':
      return 'text-yellow-400';
    case 'UNDER REVIEW':
      return 'text-orange-400';
    case 'REDUCE':
      return 'text-orange-500';
    case 'SELL':
    case 'STRONG SELL':
      return 'text-red-400';
    default:
      return 'text-slate-400';
  }
}

export function getRecommendationBgColor(recommendation: string): string {
  switch (recommendation.toUpperCase()) {
    case 'STRONG BUY':
      return 'bg-emerald-500/20 border-emerald-500/30';
    case 'BUY':
      return 'bg-emerald-500/10 border-emerald-500/20';
    case 'HOLD':
      return 'bg-yellow-500/10 border-yellow-500/20';
    case 'UNDER REVIEW':
      return 'bg-orange-500/10 border-orange-500/20';
    case 'REDUCE':
      return 'bg-orange-500/10 border-orange-500/20';
    case 'SELL':
    case 'STRONG SELL':
      return 'bg-red-500/10 border-red-500/20';
    default:
      return 'bg-slate-500/10 border-slate-500/20';
  }
}

// ============================================================================
// PRICE CHANGE FORMATTING
// ============================================================================

export function formatPriceChange(change: number, changePercent: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${formatINR(change)} (${formatPercent(changePercent)})`;
}

export function getPriceChangeColor(change: number): string {
  if (change > 0) return 'text-emerald-400';
  if (change < 0) return 'text-red-400';
  return 'text-slate-400';
}

export function getPriceChangeBgColor(change: number): string {
  if (change > 0) return 'bg-emerald-500/10';
  if (change < 0) return 'bg-red-500/10';
  return 'bg-slate-500/5';
}

// ============================================================================
// CHART HELPERS
// ============================================================================

export function generateSparklineData(prices: number[], points: number = 20): string {
  if (prices.length < 2) return '';
  
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  
  const sampledPrices = prices.length > points
    ? prices.filter((_, i) => i % Math.ceil(prices.length / points) === 0)
    : prices;
  
  const pathData = sampledPrices
    .map((price, i) => {
      const x = (i / (sampledPrices.length - 1)) * 100;
      const y = 100 - ((price - min) / range) * 100;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
  
  return pathData;
}

export function calculateTrend(prices: number[]): 'up' | 'down' | 'neutral' {
  if (prices.length < 2) return 'neutral';
  const first = prices[0];
  const last = prices[prices.length - 1];
  const changePercent = ((last - first) / first) * 100;
  
  if (changePercent > 1) return 'up';
  if (changePercent < -1) return 'down';
  return 'neutral';
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function isValidIndianStockTicker(ticker: string): boolean {
  return /^[A-Z]{2,6}$/.test(ticker);
}

export function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && value > 0;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// ============================================================================
// EXPORT HELPERS
// ============================================================================

export function generateExportContent(
  ticker: string,
  companyName: string,
  reports: {
    fundamental?: string;
    quantitative?: string;
    sentiment?: string;
    strategic?: string;
    verdict?: string;
  },
  sources: Array<{ source: string; url?: string; type: string }>,
  disclaimer: string
): string {
  const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  
  let content = `# Trading Rocket - Stock Intelligence Report\n`;
  content += `==========================================\n\n`;
  content += `**Ticker:** ${ticker}\n`;
  content += `**Company:** ${companyName}\n`;
  content += `**Generated:** ${now}\n`;
  content += `**Exchange:** NSE/BSE (Indian Markets)\n\n`;
  
  content += `---\n\n`;
  
  if (reports.fundamental) {
    content += `## Fundamental Analysis\n\n${reports.fundamental}\n\n---\n\n`;
  }
  
  if (reports.quantitative) {
    content += `## Quantitative Analysis\n\n${reports.quantitative}\n\n---\n\n`;
  }
  
  if (reports.sentiment) {
    content += `## Sentiment Analysis\n\n${reports.sentiment}\n\n---\n\n`;
  }
  
  if (reports.strategic) {
    content += `## Strategic Analysis\n\n${reports.strategic}\n\n---\n\n`;
  }
  
  if (reports.verdict) {
    content += `## Power Verdict\n\n${reports.verdict}\n\n---\n\n`;
  }
  
  content += `## Verifiable Data Sources\n\n`;
  sources.forEach((source, index) => {
    content += `${index + 1}. **${source.source}** (${source.type})\n`;
    if (source.url) {
      content += `   URL: ${source.url}\n`;
    }
  });
  content += `\n---\n\n`;
  
  content += `## Disclaimer\n\n${disclaimer}\n\n`;
  content += `---\n\n`;
  content += `*This report was generated by Trading Rocket AI for informational purposes only.*\n`;
  content += `*For NSE/BSE listed securities. Not intended as investment advice.*\n`;
  
  return content;
}

// ============================================================================
// PORTFOLIO ANALYTICS
// ============================================================================

export function calculateReturns(prices: number[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }
  return returns;
}

export function calculateVolatility(prices: number[]): number {
  const returns = calculateReturns(prices);
  if (returns.length < 2) return 0;
  
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (returns.length - 1);
  const stdDev = Math.sqrt(variance);
  
  // Annualize (assuming 252 trading days)
  return stdDev * Math.sqrt(252);
}

export function calculateSharpeRatio(prices: number[], riskFreeRate: number = 0.07): number {
  const returns = calculateReturns(prices);
  if (returns.length < 2) return 0;
  
  const annualizedReturn = (prices[prices.length - 1] / prices[0]) - 1;
  const volatility = calculateVolatility(prices);
  
  if (volatility === 0) return 0;
  return (annualizedReturn - riskFreeRate) / volatility;
}

export function calculateMaxDrawdown(prices: number[]): number {
  if (prices.length < 2) return 0;
  
  let maxDrawdown = 0;
  let peak = prices[0];
  
  for (const price of prices) {
    if (price > peak) {
      peak = price;
    }
    const drawdown = (peak - price) / peak;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }
  
  return maxDrawdown;
}

export function calculateBeta(assetPrices: number[], marketPrices: number[]): number {
  const assetReturns = calculateReturns(assetPrices);
  const marketReturns = calculateReturns(marketPrices);
  
  const minLength = Math.min(assetReturns.length, marketReturns.length);
  if (minLength < 2) return 1;
  
  const ar = assetReturns.slice(0, minLength);
  const mr = marketReturns.slice(0, minLength);
  
  const meanAr = ar.reduce((a, b) => a + b, 0) / minLength;
  const meanMr = mr.reduce((a, b) => a + b, 0) / minLength;
  
  let covariance = 0;
  let marketVariance = 0;
  
  for (let i = 0; i < minLength; i++) {
    const diffAr = ar[i] - meanAr;
    const diffMr = mr[i] - meanMr;
    covariance += diffAr * diffMr;
    marketVariance += diffMr * diffMr;
  }
  
  if (marketVariance === 0) return 1;
  return covariance / marketVariance;
}

// ============================================================================
// MISC HELPERS
// ============================================================================

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function generateId(prefix: string = ''): string {
  return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
