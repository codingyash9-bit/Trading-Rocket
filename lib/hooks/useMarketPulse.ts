import { useState, useEffect, useCallback, useRef } from 'react';

interface MarketPulseData {
  ticker: string;
  name: string;
  type: string;
  price: number;
  change_percent: number;
  trend: 'Bullish' | 'Bearish' | 'Sideways';
  momentum: 'Strong' | 'Weak';
  volatility: 'Low' | 'Medium' | 'High';
  sentiment: number;
  technical: {
    rsi: number;
    sma20: number | null;
    sma50: number | null;
    signal: 'Buy' | 'Sell' | 'Hold';
    breakout: string;
    support: number;
    resistance: number;
  };
  insight: string;
  timestamp: string;
}

interface MarketSummary {
  overall_market: 'Bullish' | 'Bearish' | 'Sideways';
  avg_sentiment: number;
  asset_count: number;
  trends: Record<string, number>;
  safe_assets: string[];
  aggressive_assets: string[];
  pulses: MarketPulseData[];
  timestamp: string;
}

interface UseMarketPulseReturn {
  data: MarketPulseData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

interface UseMarketSummaryReturn {
  data: MarketSummary | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://trading-rocket.onrender.com/api/pulse';

export function useTickerPulse(ticker: string): UseMarketPulseReturn {
  const [data, setData] = useState<MarketPulseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/ticker/${ticker}`);
      const json = await res.json();
      
      if (json.success) {
        setData(json.pulse);
        setError(null);
      } else {
        setError(json.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, [ticker]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}

export function useMarketSummary(): UseMarketSummaryReturn {
  const [data, setData] = useState<MarketSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/summary`);
      const json = await res.json();
      
      if (json.success) {
        setData(json.summary);
        setError(null);
      } else {
        setError(json.error || 'Failed to fetch summary');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}

export function useCategoryPulse(category: string) {
  const [pulses, setPulses] = useState<MarketPulseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/category/${category}`);
      const json = await res.json();
      
      if (json.success) {
        setPulses(json.summary?.pulses || []);
        setError(null);
      } else {
        setError(json.error || 'Failed to fetch');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { pulses, loading, error, refresh: fetchData };
}

export function useLivePrice(ticker: string, useCache = true) {
  const [price, setPrice] = useState<number | null>(null);
  const [change, setChange] = useState<number>(0);
  const [changePercent, setChangePercent] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/ticker/${ticker}/live?use_cache=${useCache}`);
      const json = await res.json();
      
      if (json.success) {
        setPrice(json.pulse.price);
        setChange(json.pulse.change_percent);
        setChangePercent(json.pulse.change_percent);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, [ticker, useCache]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { price, change: changePercent, loading, error, refresh: fetchData };
}

export function useMultiPulse(tickers: string[]) {
  const [pulses, setPulses] = useState<MarketPulseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/multi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tickers, period: '1d' }),
      });
      const json = await res.json();
      
      if (json.success) {
        setPulses(json.summary?.pulses || []);
        setError(null);
      } else {
        setError(json.error || 'Failed to fetch');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, [tickers]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { pulses, loading, error, refresh: fetchData };
}