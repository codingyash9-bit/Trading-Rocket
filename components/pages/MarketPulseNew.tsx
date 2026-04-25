'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMarketSummary } from '@/lib/hooks/useMarketPulse';
import AetherVisualizer from '@/components/AetherVisualizer';

const SentimentMeter: React.FC<{ value: number }> = ({ value }) => {
  const getColor = (v: number) => {
    if (v >= 70) return '#10b981';
    if (v >= 50) return '#fbbf24';
    if (v >= 30) return '#f97316';
    return '#f43f5e';
  };

  const getLabel = (v: number) => {
    if (v >= 70) return 'Bullish';
    if (v >= 50) return 'Neutral';
    if (v >= 30) return 'Cautious';
    return 'Bearish';
  };

  return (
    <div className="glass-card p-4 rounded-2xl">
      <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Market Sentiment</div>
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 transform -rotate-90">
            <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="none" />
            <circle
              cx="32" cy="32" r="28"
              stroke={getColor(value)}
              strokeWidth="4"
              fill="none"
              strokeDasharray={`${(value / 100) * 176} 176`}
              style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold" style={{ color: getColor(value) }}>{value}</span>
          </div>
        </div>
        <div>
          <div className="text-xl font-semibold" style={{ color: getColor(value) }}>{getLabel(value)}</div>
          <div className="text-sm text-slate-400">out of 100</div>
        </div>
      </div>
    </div>
  );
};

const PulseCard: React.FC<{ pulse: any }> = ({ pulse }) => {
  const isUp = pulse.change_percent >= 0;
  const trendColor = pulse.trend === 'Bullish' ? '#10b981' : pulse.trend === 'Bearish' ? '#f43f5e' : '#fbbf24';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card-hover p-4 rounded-2xl cursor-pointer"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-semibold text-white">{pulse.name}</div>
          <div className="text-xs text-slate-400">{pulse.ticker}</div>
        </div>
        <div className={`text-lg font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isUp ? '+' : ''}{pulse.change_percent.toFixed(2)}%
        </div>
      </div>

      <div className="text-2xl font-bold text-white mb-3">₹{pulse.price?.toLocaleString() || 'N/A'}</div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-slate-500">Trend</span>
          <div className="font-medium" style={{ color: trendColor }}>{pulse.trend}</div>
        </div>
        <div>
          <span className="text-slate-500">Momentum</span>
          <div className="font-medium text-white">{pulse.momentum}</div>
        </div>
        <div>
          <span className="text-slate-500">RSI</span>
          <div className="font-medium text-white">{pulse.technical?.rsi?.toFixed(1) || 'N/A'}</div>
        </div>
        <div>
          <span className="text-slate-500">Signal</span>
          <div className={`font-medium ${pulse.technical?.signal === 'Buy' ? 'text-emerald-400' : pulse.technical?.signal === 'Sell' ? 'text-rose-400' : 'text-amber-400'}`}>
            {pulse.technical?.signal || 'Hold'}
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="text-xs text-slate-400 line-clamp-2">{pulse.insight}</div>
      </div>
    </motion.div>
  );
};

const MarketInsightCard: React.FC<{ insight: string; type?: string }> = ({ insight, type = 'neutral' }) => {
  const iconMap = {
    bullish: '📈',
    bearish: '📉',
    neutral: '💡',
    warning: '⚠️',
  };

  const bgMap = {
    bullish: 'rgba(16,185,129,0.1)',
    bearish: 'rgba(244,63,94,0.1)',
    neutral: 'rgba(59,130,246,0.1)',
    warning: 'rgba(251,191,36,0.1)',
  };

  return (
    <div className="glass-card p-3 rounded-xl flex items-start gap-3" style={{ background: bgMap[type as keyof typeof bgMap] || bgMap.neutral }}>
      <span className="text-lg">{iconMap[type as keyof typeof iconMap] || iconMap.neutral}</span>
      <p className="text-sm text-slate-300 leading-relaxed">{insight}</p>
    </div>
  );
};

export default function MarketPulseNew() {
  const { data, loading, error, refresh } = useMarketSummary();

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-400">Loading market data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6 rounded-2xl text-center">
        <div className="text-rose-400 mb-2">Failed to load market data</div>
        <div className="text-sm text-slate-400">{error}</div>
        <button onClick={refresh} className="btn-secondary mt-4">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Market Pulse</h1>
          <p className="text-slate-400 text-sm">Neural intercept of real-time capital flows</p>
        </div>
        <button onClick={refresh} className="btn-icon">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* 3D Neural Map */}
      <AetherVisualizer />

      {/* Sentiment Meter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SentimentMeter value={data?.avg_sentiment || 50} />
        
        <div className="glass-card p-4 rounded-2xl md:col-span-2">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-3">Market Status</div>
          <div className="flex items-center gap-4">
            <div className={`text-2xl font-bold ${
              data?.overall_market === 'Bullish' ? 'text-emerald-400' : 
              data?.overall_market === 'Bearish' ? 'text-rose-400' : 'text-amber-400'
            }`}>
              {data?.overall_market || 'Loading...'}
            </div>
            <div className="text-sm text-slate-400">
              {data?.asset_count || 0} assets analyzed
            </div>
          </div>
          <div className="mt-3 flex gap-4 text-sm">
            <div>
              <span className="text-slate-500">Bullish: </span>
              <span className="text-emerald-400 font-medium">{data?.trends?.Bullish || 0}</span>
            </div>
            <div>
              <span className="text-slate-500">Bearish: </span>
              <span className="text-rose-400 font-medium">{data?.trends?.Bearish || 0}</span>
            </div>
            <div>
              <span className="text-slate-500">Sideways: </span>
              <span className="text-amber-400 font-medium">{data?.trends?.Sideways || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Safe & Aggressive Assets */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-4 rounded-2xl border-l-2 border-emerald-500">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Safe Assets</div>
          <div className="flex flex-wrap gap-2">
            {(data?.safe_assets || []).map((asset: string) => (
              <span key={asset} className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-mono">{asset}</span>
            ))}
          </div>
        </div>
        <div className="glass-card p-4 rounded-2xl border-l-2 border-blue-500">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">High Volatility</div>
          <div className="flex flex-wrap gap-2">
            {(data?.aggressive_assets || []).map((asset: string) => (
              <span key={asset} className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-mono">{asset}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Asset Cards */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-cyan-500 rounded-full" />
          Active Pulse Monitor
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data?.pulses || []).slice(0, 6).map((pulse: any) => (
            <PulseCard key={pulse.ticker} pulse={pulse} />
          ))}
        </div>
      </div>
    </div>
  );
}
