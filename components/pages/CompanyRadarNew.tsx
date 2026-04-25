'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface StockRadar {
  symbol: string;
  name: string;
  exchange: string;
  price: number;
  change: string;
  changePercent: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  signals?: string[];
  key_news: { headline: string; sentiment: string; source: string; timestamp: string }[];
  last_analysis?: string;
  updated_at: string;
}

const sentimentColors = {
  positive: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  negative: { bg: 'bg-rose-500/20', border: 'border-rose-500/30', text: 'text-rose-400', dot: 'bg-rose-400' },
  neutral: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', text: 'text-yellow-400', dot: 'bg-yellow-400' },
};

const StockCard: React.FC<{ stock: StockRadar; index: number }> = ({ stock, index }) => {
  const colors = sentimentColors[stock.sentiment] || sentimentColors.neutral;
  const isPositive = parseFloat(stock.changePercent || stock.change) >= 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`relative bg-slate-900/60 backdrop-blur-xl rounded-2xl border ${colors.border} overflow-hidden`}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center">
              <span className="text-sm font-mono font-bold text-cyan-400">{stock.symbol.slice(0, 3)}</span>
            </div>
            <div>
              <h3 className="text-white font-semibold">{stock.symbol}</h3>
              <p className="text-xs text-slate-500">{stock.exchange}</p>
            </div>
          </div>
          <div className={`w-3 h-3 rounded-full ${colors.dot} ${stock.sentiment === 'positive' ? 'animate-pulse' : ''}`} />
        </div>
        
        {/* Price */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-2xl font-mono font-bold text-white">₹{stock.price?.toLocaleString('en-IN') || '0'}</p>
            <p className={`text-sm font-mono ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositive ? '+' : ''}{stock.changePercent || stock.change}%
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text} border ${colors.border}`}>
            {stock.sentiment?.toUpperCase() || 'NEUTRAL'}
          </span>
        </div>
        
        {/* Signals */}
        {stock.signals && stock.signals.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {stock.signals.map((signal, i) => (
                <span key={i} className={`px-2 py-0.5 rounded text-xs ${colors.bg} ${colors.text}`}>
                  {signal}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Last Analysis */}
        {stock.last_analysis && (
          <div className="mb-3 text-xs text-slate-400">
            Verdict: <span className={stock.last_analysis.includes('Buy') ? 'text-emerald-400' : stock.last_analysis.includes('Sell') ? 'text-rose-400' : 'text-yellow-400'}>{stock.last_analysis}</span>
          </div>
        )}
        
        {/* Key News */}
        <div className="border-t border-white/10 pt-3">
          <p className="text-xs text-slate-500 mb-2">KEY NEWS</p>
          <div className="space-y-2">
            {stock.key_news?.slice(0, 2).map((news, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                  news.sentiment === 'positive' ? 'bg-emerald-400' : 
                  news.sentiment === 'negative' ? 'bg-rose-400' : 'bg-yellow-400'
                }`} />
                <p className="text-xs text-slate-300 flex-1 line-clamp-2">{news.headline}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
          <span className="text-xs text-slate-500">{stock.key_news?.[0]?.source || 'Market Data'}</span>
          <span className="text-xs text-slate-500">
            {new Date(stock.updated_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const CompanyRadar: React.FC = () => {
  const [stocks, setStocks] = useState<StockRadar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchStocks();
    const interval = setInterval(fetchStocks, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const fetchStocks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/company-radar');
      const data = await res.json();
      
      if (data.stocks && Array.isArray(data.stocks)) {
        setStocks(data.stocks);
      } else if (Array.isArray(data)) {
        setStocks(data);
      } else {
        setError('No tracked stocks. Analyze a stock to add it here.');
      }
    } catch (err) {
      setError('API error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60">Loading radar...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-rose-400">{error}</p>
        <button onClick={fetchStocks} className="mt-4 px-4 py-2 bg-cyan-500 text-white rounded-lg">
          Retry
        </button>
      </div>
    );
  }
  
  const positive = stocks.filter(s => s.sentiment === 'positive').length;
  const negative = stocks.filter(s => s.sentiment === 'negative').length;
  const neutral = stocks.filter(s => s.sentiment === 'neutral').length;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Company Radar</h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitor your tracked stocks with sentiment
          </p>
        </div>
      </motion.div>
      
      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-500">Tracked</p>
          <p className="text-2xl font-mono font-bold text-white">{stocks.length}</p>
        </div>
        <div className="bg-emerald-500/10 backdrop-blur-xl rounded-xl border border-emerald-500/20 p-4">
          <p className="text-sm text-emerald-400">Positive</p>
          <p className="text-2xl font-mono font-bold text-emerald-400">{positive}</p>
        </div>
        <div className="bg-rose-500/10 backdrop-blur-xl rounded-xl border border-rose-500/20 p-4">
          <p className="text-sm text-rose-400">Negative</p>
          <p className="text-2xl font-mono font-bold text-rose-400">{negative}</p>
        </div>
        <div className="bg-yellow-500/10 backdrop-blur-xl rounded-xl border border-yellow-500/20 p-4">
          <p className="text-sm text-yellow-400">Neutral</p>
          <p className="text-2xl font-mono font-bold text-yellow-400">{neutral}</p>
        </div>
      </motion.div>
      
      {/* Stock Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {stocks.map((stock, i) => (
          <StockCard key={stock.symbol} stock={stock} index={i} />
        ))}
      </div>
      
      {/* Empty State */}
      {stocks.length === 0 && (
        <div className="text-center py-16 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-cyan-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No stocks tracked</h3>
          <p className="text-slate-400 max-w-md mx-auto">
            Analyze stocks using the AI chat or add them to start monitoring.
          </p>
        </div>
      )}
    </div>
  );
};

export default CompanyRadar;