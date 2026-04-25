'use client';

import React, { useState, useRef, useCallback, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import NeuralBackground from '@/components/NeuralBackground';
import ProjectionChart from '@/components/ProjectionChart';
import DownloadPDFButton from '@/components/DownloadPDFButton';
import { generateProjectionData } from '@/lib/projectionEngine';
import type { ProjectionInput } from '@/lib/projectionEngine';
import { api } from '@/lib/api-client';

interface ChartAnalysis {
  stockName: string;
  symbol: string;
  currentPrice: number;
  predictedTrend: 'BULLISH' | 'BEARISH' | 'SIDEWAYS' | 'NEUTRAL';
  confidence: number;
  timeframeAnalysis: {
    '1D': { trend: string; signal: string; support: number; resistance: number };
    '1M': { trend: string; signal: string; support: number; resistance: number };
    '6M': { trend: string; signal: string; support: number; resistance: number };
    '1Y': { trend: string; signal: string; support: number; resistance: number };
  };
  volatility?: {
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY HIGH';
    atr: number;
    atrPercent: number;
    bollingerWidth: number;
    priceSwing: number;
    analysis: string;
  };
  riskRatio?: {
    riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
    stopLossPercent: number;
    riskScore: number;
    maxDrawdown: number;
    positionRisk: string;
    recommendation: string;
  };
  investmentStrategy: {
    recommendedEntry: number;
    stopLoss: number;
    targetPrice: number;
    riskRewardRatio: number;
    positionSize: number;
    investmentType: 'LONG_TERM' | 'MID_TERM' | 'SHORT_TERM';
  };
  technicalIndicators: {
    rsi: number;
    macd: string;
    movingAverages: string;
    volumeAnalysis: string;
  };
  summary: string;
  keyLevels: {
    strongSupport: number[];
    strongResistance: number[];
    pivotPoints: number[];
  };
}

interface UploadedImage {
  file: File;
  preview: string;
  timeframe: string;
}

interface AnalysisResponse {
  success: boolean;
  error?: string;
  analysis: ChartAnalysis;
  metadata: {
    budget: string;
    investmentType: string;
    imagesProcessed: number;
    timestamp: string;
  };
}

const TIMEFRAMES = [
  { id: '1D', label: '1 Day', color: '#60a5fa' },
  { id: '1M', label: '1 Month', color: '#a78bfa' },
  { id: '6M', label: '6 Months', color: '#f43f5e' },
  { id: '1Y', label: '1 Year', color: '#06b6d4' },
];

const INVESTMENT_TYPES = [
  { id: 'SHORT_TERM', label: 'Short Term', desc: 'Days to weeks', color: '#f43f5e' },
  { id: 'MID_TERM', label: 'Mid Term', desc: 'Weeks to months', color: '#f59e0b' },
  { id: 'LONG_TERM', label: 'Long Term', desc: 'Months to years', color: '#10b981' },
];

const LOADING_STEPS = [
  'Capturing chart patterns...',
  'Analyzing candlestick formations...',
  'Processing volume indicators...',
  'Calculating RSI & MACD...',
  'Identifying support/resistance levels...',
  'Evaluating moving averages...',
  'Generating prediction models...',
  'Synthesizing investment strategy...',
];

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const BackButton: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname !== '/chart-analysis') return null;

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => router.push('/features')}
      className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-200"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Back
    </motion.button>
  );
};

function trendToColor(trend: string): string {
  const t = trend.toLowerCase();
  if (t.includes('bullish') || t.includes('buy') || t.includes('up')) return '#10b981';
  if (t.includes('bearish') || t.includes('sell') || t.includes('down')) return '#f43f5e';
  return '#f59e0b';
}

function signalToIcon(signal: string): string {
  const s = signal.toLowerCase();
  if (s.includes('strong buy') || s.includes('bullish')) return '🟢';
  if (s.includes('buy')) return '🟢';
  if (s.includes('strong sell') || s.includes('bearish')) return '🔴';
  if (s.includes('sell')) return '🔴';
  return '🟡';
}

const DropZone: React.FC<{
  timeframe: string;
  label: string;
  color: string;
  value: UploadedImage | null;
  onChange: (img: UploadedImage | null) => void;
}> = ({ timeframe, label, color, value, onChange }) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const timeframes = {
    '1D': { icon: '📅', iconColor: '#60a5fa' },
    '1M': { icon: '🗓️', iconColor: '#a78bfa' },
    '6M': { icon: '📆', iconColor: '#f43f5e' },
    '1Y': { icon: '📊', iconColor: '#06b6d4' },
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const preview = URL.createObjectURL(file);
    onChange({ file, preview, timeframe });
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="relative cursor-pointer group"
      style={{ borderRadius: 14 }}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
      />
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
        className="relative overflow-hidden"
        style={{
          border: `2px dashed ${dragging ? color : value ? color : 'rgba(255,255,255,0.12)'}`,
          borderRadius: 14,
          background: dragging ? `${color}20` : value 
            ? `linear-gradient(135deg, ${color}15, rgba(0,0,0,0.2))` 
            : 'rgba(255,255,255,0.02)',
          transition: 'all 0.25s ease',
          minHeight: 120,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
          boxShadow: dragging 
            ? `0 0 30px ${color}40, inset 0 0 20px ${color}10` 
            : '0 4px 20px rgba(0,0,0,0.3)',
        }}
      >
        {value ? (
          <div className="relative w-full">
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.6) 100%)', borderRadius: 8, zIndex: 1 }} />
            <img 
              src={value.preview} 
              alt={label} 
              style={{ 
                width: '100%', 
                height: 85, 
                objectFit: 'cover', 
                borderRadius: 10,
                border: `2px solid ${color}40`,
              }} 
            />
            <div style={{ 
              position: 'absolute', 
              top: 6, 
              right: 6, 
              width: 24, 
              height: 24, 
              borderRadius: '50%', 
              background: 'rgba(244,63,94,0.95)', 
              border: 'none', 
              color: '#fff', 
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
              onClick={(e) => { e.stopPropagation(); onChange(null); }}
            >
              ×
            </div>
            <div style={{ 
              position: 'absolute', 
              bottom: 6, 
              left: 6, 
              background: 'rgba(0,0,0,0.7)', 
              padding: '3px 8px', 
              borderRadius: 6,
              fontSize: 9,
              color: color,
              fontFamily: 'monospace',
              letterSpacing: '0.05em',
            }}>
              {timeframes[timeframe as keyof typeof timeframes]?.icon || '📈'} {label}
            </div>
            <div style={{ 
              position: 'absolute', 
              top: 6, 
              left: 6,
              fontSize: 16,
            }}>
              ✓
            </div>
          </div>
        ) : (
          <>
            <div style={{ 
              fontSize: 32, 
              marginBottom: 8,
              color: color,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
            }}>
              {timeframes[timeframe as keyof typeof timeframes]?.icon || '📈'}
            </div>
            <p style={{ 
              fontSize: 12, 
              color: 'rgba(255,255,255,0.8)', 
              textAlign: 'center',
              fontWeight: 600,
              letterSpacing: '0.02em',
            }}>
              {label}
            </p>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 6, 
              marginTop: 8,
              padding: '4px 10px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 20,
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
              </svg>
              <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                DROP CHART
              </p>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

const LoadingAnimation: React.FC = () => {
  const [stepIdx, setStepIdx] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => setStepIdx((i) => (i + 1) % LOADING_STEPS.length), 1500);
    const dotInterval = setInterval(() => setDots((d) => d.length >= 3 ? '' : d + '.'), 400);
    return () => { clearInterval(interval); clearInterval(dotInterval); };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: 30 }}>
      <div style={{ position: 'relative', width: 100, height: 100 }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid transparent', borderTopColor: '#10b981', animation: 'spin 1s linear infinite' }} />
        <div style={{ position: 'absolute', inset: 12, borderRadius: '50%', border: '3px solid transparent', borderTopColor: '#06b6d4', animation: 'spin 0.7s linear infinite reverse' }} />
        <div style={{ position: 'absolute', inset: 24, borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#60a5fa', animation: 'spin 0.5s linear infinite' }} />
        <div style={{ position: 'absolute', inset: 36, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.6), transparent 70%)' }} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.15em', color: 'rgba(16,185,129,0.8)', fontFamily: 'monospace', marginBottom: 8 }}>CHART ANALYSIS ENGINE</p>
        <AnimatePresence mode="wait">
          <motion.p key={stepIdx} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }} style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>
            {LOADING_STEPS[stepIdx]}{dots}
          </motion.p>
        </AnimatePresence>
      </div>
      <div style={{ width: 280, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: 'linear-gradient(90deg, #10b981, #06b6d4, #60a5fa)', borderRadius: 3, animation: 'progress 12s linear forwards' }} />
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes progress { 0% { width: 0%; } 100% { width: 95%; } }
      `}</style>
    </div>
  );
};

const ResultsDashboard: React.FC<{ analysis: ChartAnalysis; meta: { budget: string; investmentType: string; imagesProcessed: number; timestamp: string } }> = ({ analysis, meta }) => {
  const strategy = analysis.investmentStrategy;
  const trendColor = trendToColor(analysis.predictedTrend);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} style={{ maxWidth: 1100 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(8,12,20,0.92)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 16, padding: '20px 24px', marginBottom: 20, backdropFilter: 'blur(20px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.10em', background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}>CHART ANALYSIS</span>
              <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontFamily: 'monospace', background: strategy.positionSize > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)', color: strategy.positionSize > 0 ? '#10b981' : '#f43f5e', border: `1px solid ${strategy.positionSize > 0 ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)'}` }}>{meta.investmentType}</span>
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: 'rgba(255,255,255,0.95)', letterSpacing: '-0.02em' }}>{analysis.stockName} <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)' }}>{analysis.symbol}</span></h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>Current Price: ₹{analysis.currentPrice.toLocaleString()}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', marginBottom: 4 }}>PREDICTION</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 32, fontWeight: 900, color: trendColor, letterSpacing: '-0.02em' }}>{analysis.predictedTrend}</span>
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>Confidence: {analysis.confidence}%</p>
          </div>
        </div>
      </motion.div>

      {/* Investment Strategy */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(6,182,212,0.05) 100%)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 14, padding: '18px 22px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 18 }}>💼</span>
          <span style={{ fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.10em', color: '#10b981', fontWeight: 700 }}>INVESTMENT STRATEGY</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
          {[
            { label: 'Entry Price', value: `₹${strategy.recommendedEntry.toLocaleString()}`, color: '#10b981' },
            { label: 'Stop Loss', value: `₹${strategy.stopLoss.toLocaleString()}`, color: '#f43f5e' },
            { label: 'Target Price', value: `₹${strategy.targetPrice.toLocaleString()}`, color: '#06b6d4' },
            { label: 'Risk:Reward', value: `1:${strategy.riskRewardRatio}`, color: '#a78bfa' },
            { label: 'Position Size', value: strategy.positionSize > 0 ? `₹${strategy.positionSize.toLocaleString()}` : 'N/A', color: '#f59e0b' },
            { label: 'Budget', value: meta.budget, color: '#60a5fa' },
          ].map((item) => (
            <div key={item.label} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>{item.label}</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: item.color, fontFamily: 'monospace' }}>{item.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Timeframe Analysis */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.12em', color: 'rgba(96,165,250,0.7)', marginBottom: 12 }}>▸ TIMEFRAME ANALYSIS</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
          {Object.entries(analysis.timeframeAnalysis).map(([tf, data], idx) => (
            <motion.div key={tf} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + idx * 0.05 }} style={{ background: 'rgba(8,12,20,0.85)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>{tf}</span>
                <span style={{ fontSize: 14 }}>{signalToIcon(data.signal)}</span>
              </div>
              <p style={{ fontSize: 11, color: trendToColor(data.trend), marginBottom: 6 }}>{data.trend}</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>{data.signal}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: 'monospace' }}>
                <span style={{ color: '#10b981' }}>S: ₹{data.support}</span>
                <span style={{ color: '#f43f5e' }}>R: ₹{data.resistance}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Key Levels */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.12em', color: 'rgba(167,139,250,0.7)', marginBottom: 12 }}>▸ KEY LEVELS</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <div style={{ background: 'rgba(8,12,20,0.85)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 10, padding: 14 }}>
            <p style={{ fontSize: 10, color: '#10b981', marginBottom: 8, letterSpacing: '0.05em' }}>SUPPORT LEVELS</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {analysis.keyLevels.strongSupport.map((level, i) => (
                <span key={i} style={{ padding: '4px 10px', background: 'rgba(16,185,129,0.15)', borderRadius: 6, fontSize: 12, fontFamily: 'monospace', color: '#10b981' }}>₹{level}</span>
              ))}
            </div>
          </div>
          <div style={{ background: 'rgba(8,12,20,0.85)', border: '1px solid rgba(244,63,94,0.15)', borderRadius: 10, padding: 14 }}>
            <p style={{ fontSize: 10, color: '#f43f5e', marginBottom: 8, letterSpacing: '0.05em' }}>RESISTANCE LEVELS</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {analysis.keyLevels.strongResistance.map((level, i) => (
                <span key={i} style={{ padding: '4px 10px', background: 'rgba(244,63,94,0.15)', borderRadius: 6, fontSize: 12, fontFamily: 'monospace', color: '#f43f5e' }}>₹{level}</span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Technical Indicators */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.12em', color: 'rgba(245,158,11,0.7)', marginBottom: 12 }}>▸ TECHNICAL INDICATORS</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          {[
            { label: 'RSI', value: `${analysis.technicalIndicators.rsi}`, desc: analysis.technicalIndicators.rsi > 70 ? 'Overbought' : analysis.technicalIndicators.rsi < 30 ? 'Oversold' : 'Neutral', color: analysis.technicalIndicators.rsi > 70 ? '#f43f5e' : analysis.technicalIndicators.rsi < 30 ? '#10b981' : '#f59e0b' },
            { label: 'MACD', value: analysis.technicalIndicators.macd, desc: '', color: '#a78bfa' },
            { label: 'Moving Averages', value: analysis.technicalIndicators.movingAverages, desc: '', color: '#06b6d4' },
            { label: 'Volume', value: analysis.technicalIndicators.volumeAnalysis, desc: '', color: '#60a5fa' },
          ].map((item) => (
            <div key={item.label} style={{ background: 'rgba(8,12,20,0.85)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 12 }}>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>{item.label}</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: item.color, fontFamily: 'monospace' }}>{item.value}</p>
              {item.desc && <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{item.desc}</p>}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Volatility Analysis */}
      {analysis.volatility && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.12em', color: 'rgba(249,115,22,0.7)', marginBottom: 12 }}>▸ VOLATILITY ANALYSIS</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
            <div style={{ background: 'rgba(8,12,20,0.85)', border: '1px solid rgba(249,115,22,0.15)', borderRadius: 10, padding: 12 }}>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>Volatility Level</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: analysis.volatility.level === 'LOW' ? '#10b981' : analysis.volatility.level === 'MEDIUM' ? '#f59e0b' : analysis.volatility.level === 'HIGH' ? '#f97316' : '#ef4444', fontFamily: 'monospace' }}>{analysis.volatility.level}</p>
            </div>
            <div style={{ background: 'rgba(8,12,20,0.85)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 12 }}>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>ATR</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#f59e0b', fontFamily: 'monospace' }}>₹{analysis.volatility.atr} ({analysis.volatility.atrPercent}%)</p>
            </div>
            <div style={{ background: 'rgba(8,12,20,0.85)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 12 }}>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>Price Swing</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#f59e0b', fontFamily: 'monospace' }}>{analysis.volatility.priceSwing}%</p>
            </div>
            <div style={{ background: 'rgba(8,12,20,0.85)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 12 }}>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>Bollinger Width</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#f59e0b', fontFamily: 'monospace' }}>₹{analysis.volatility.bollingerWidth}</p>
            </div>
          </div>
          <div style={{ marginTop: 10, padding: 12, background: 'rgba(249,115,22,0.05)', borderRadius: 8, border: '1px solid rgba(249,115,22,0.1)' }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{analysis.volatility.analysis}</p>
          </div>
        </motion.div>
      )}

      {/* Risk Ratio Analysis */}
      {analysis.riskRatio && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.12em', color: 'rgba(239,68,68,0.7)', marginBottom: 12 }}>▸ RISK RATIO ANALYSIS</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
            <div style={{ background: 'rgba(8,12,20,0.85)', border: `1px solid ${analysis.riskRatio.riskLevel === 'LOW' ? 'rgba(16,185,129,0.2)' : analysis.riskRatio.riskLevel === 'MODERATE' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}`, borderRadius: 10, padding: 12 }}>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>Risk Level</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: analysis.riskRatio.riskLevel === 'LOW' ? '#10b981' : analysis.riskRatio.riskLevel === 'MODERATE' ? '#f59e0b' : analysis.riskRatio.riskLevel === 'HIGH' ? '#f97316' : '#ef4444', fontFamily: 'monospace' }}>{analysis.riskRatio.riskLevel}</p>
            </div>
            <div style={{ background: 'rgba(8,12,20,0.85)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 12 }}>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>Stop Loss Risk</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#ef4444', fontFamily: 'monospace' }}>{analysis.riskRatio.stopLossPercent}%</p>
            </div>
            <div style={{ background: 'rgba(8,12,20,0.85)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 12 }}>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>Risk Score</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#ef4444', fontFamily: 'monospace' }}>{analysis.riskRatio.riskScore}/10</p>
            </div>
            <div style={{ background: 'rgba(8,12,20,0.85)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 12 }}>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>Max Drawdown</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#ef4444', fontFamily: 'monospace' }}>{analysis.riskRatio.maxDrawdown}%</p>
            </div>
          </div>
          <div style={{ marginTop: 10, padding: 12, background: 'rgba(239,68,68,0.05)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.1)' }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, marginBottom: 6 }}>{analysis.riskRatio.positionRisk}</p>
            <p style={{ fontSize: 12, fontWeight: 600, color: analysis.riskRatio.recommendation.includes('Caution') ? '#ef4444' : analysis.riskRatio.recommendation.includes('strict') ? '#f59e0b' : '#10b981' }}>💡 {analysis.riskRatio.recommendation}</p>
          </div>
        </motion.div>
      )}

      {/* Summary */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} style={{ background: 'linear-gradient(135deg, rgba(96,165,250,0.08) 0%, rgba(167,139,250,0.05) 100%)', border: '1px solid rgba(96,165,250,0.15)', borderRadius: 14, padding: '18px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 16 }}>📋</span>
          <span style={{ fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.10em', color: '#60a5fa', fontWeight: 700 }}>ANALYSIS SUMMARY</span>
        </div>
        <p style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(255,255,255,0.7)' }}>{analysis.summary}</p>
      </motion.div>

      {/* Footer */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} style={{ marginTop: 24, padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)', fontFamily: 'monospace' }}>Chart Analysis v1.0</span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)', fontFamily: 'monospace' }}>ANALYSIS COMPLETED · {new Date(meta.timestamp).toLocaleString()}</span>
        </div>
        <DownloadPDFButton analysis={analysis as any} meta={meta} />
      </motion.div>
    </motion.div>
  );
};

// ─── Projection Panel ──────────────────────────────────────────────────────────

const ProjectionPanel: React.FC<{ analysis: ChartAnalysis }> = ({ analysis }) => {
  const trend = analysis.predictedTrend === 'BULLISH'
    ? 'bullish'
    : analysis.predictedTrend === 'BEARISH'
    ? 'bearish'
    : 'sideways';

  const strategy = analysis.investmentStrategy;
  const currentPrice = analysis.currentPrice;

  const input: ProjectionInput = {
    currentPrice,
    trend,
    entryRange: [
      Math.min(strategy.recommendedEntry, currentPrice * 0.99),
      Math.max(strategy.recommendedEntry, currentPrice * 1.01),
    ],
    stopLoss: strategy.stopLoss,
    target1: strategy.targetPrice,
    // Derive T2 from keyLevels resistance or extrapolate
    target2: analysis.keyLevels.strongResistance[0]
      ?? strategy.targetPrice * 1.08,
    confidenceScore: analysis.confidence,
  };

  const projData = generateProjectionData(input);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      style={{ marginTop: 24 }}
    >
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <span style={{ fontSize: 18 }}>📈</span>
        <span style={{ fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.10em', color: '#06b6d4', fontWeight: 700 }}>AI PRICE PROJECTION ENGINE</span>
        <span style={{ fontSize: 9, fontFamily: 'monospace', padding: '2px 8px', borderRadius: 12, background: 'rgba(6,182,212,0.1)', color: 'rgba(6,182,212,0.7)', border: '1px solid rgba(6,182,212,0.2)' }}>30-DAY FORWARD</span>
      </div>

      <div id="projection-chart-container">
        <ProjectionChart
          id="projection-chart"
          data={projData}
          stockName={`${analysis.stockName}${analysis.symbol ? ' · ' + analysis.symbol : ''}`}
          trend={trend}
          confidenceScore={analysis.confidence}
        />
      </div>

      {/* Engine footnote */}
      <p style={{ marginTop: 12, fontSize: 10, color: 'rgba(255,255,255,0.15)', fontFamily: 'monospace', textAlign: 'right' }}>
        Projection generated by Graphical Representation Engine v1.0 · For educational purposes only
      </p>
    </motion.div>
  );
};

function ChartAnalysisInner() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isDemo = searchParams.get('demo') === 'true';
  const isStandalone = pathname === '/chart-analysis';

  const [stockName, setStockName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [budget, setBudget] = useState('');
  const [investmentType, setInvestmentType] = useState('MID_TERM');
  const [images, setImages] = useState<{ [key: string]: UploadedImage | null }>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ChartAnalysis | null>(null);
  const [meta, setMeta] = useState<{ budget: string; investmentType: string; imagesProcessed: number; timestamp: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-trigger demo analysis when ?demo=true
  useEffect(() => {
    if (isDemo && !result && !loading) {
      setStockName('Reliance Industries');
      setSymbol('RELIANCE');
      setBudget('100000');
      setInvestmentType('MID_TERM');
      // Small delay so fields render before submit fires
      const t = setTimeout(() => triggerDemo(), 400);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemo]);

  const triggerDemo = () => {
    const basePrice = 2847;
    const budgetNum = 100000;
    const demoData: ChartAnalysis = {
      stockName: 'Reliance Industries',
      symbol: 'RELIANCE',
      currentPrice: basePrice,
      predictedTrend: 'BULLISH',
      confidence: 78,
      timeframeAnalysis: {
        '1D': { trend: 'Sideways', signal: 'Hold', support: 2790, resistance: 2900 },
        '1M': { trend: 'Bullish', signal: 'Buy on Dip', support: 2650, resistance: 3050 },
        '6M': { trend: 'Strong Bullish', signal: 'Accumulate', support: 2400, resistance: 3300 },
        '1Y': { trend: 'Strong Bullish', signal: 'Long Term Buy', support: 2100, resistance: 3700 },
      },
      volatility: {
        level: 'MEDIUM',
        atr: 85,
        atrPercent: 3.0,
        bollingerWidth: 210,
        priceSwing: 3.2,
        analysis: 'Reliance Industries exhibits MEDIUM volatility with daily swings of approximately 3.0%. The stock is suitable for moderate risk takers. The ATR suggests normal price movement with no extreme volatility spikes expected in the near term.',
      },
      riskRatio: {
        riskLevel: 'MODERATE',
        stopLossPercent: 7.3,
        riskScore: 5,
        maxDrawdown: 15,
        positionRisk: 'With a 7.3% stop loss and MEDIUM volatility, this position carries MODERATE risk. The risk-reward ratio is favorable at 1:3 with potential for 21% upside against 7.3% downside.',
        recommendation: 'Maintain strict stop loss at ₹2,640 and scale into position gradually',
      },
      investmentStrategy: {
        recommendedEntry: 2820,
        stopLoss: 2640,
        targetPrice: 3200,
        riskRewardRatio: 3,
        positionSize: Math.round(budgetNum * 0.30),
        investmentType: 'MID_TERM',
      },
      technicalIndicators: {
        rsi: 58,
        macd: 'Bullish Crossover',
        movingAverages: 'Price above 20 & 50 DMA',
        volumeAnalysis: 'Above average — institutional accumulation',
      },
      summary: 'Reliance Industries is forming a bullish flag pattern on the weekly chart. Strong volume support at ₹2,640. RSI at 58 leaves room for upside. Recommended accumulation zone: ₹2,800–₹2,840 for a target of ₹3,200 in 3–4 months.',
      keyLevels: {
        strongSupport: [2640, 2520, 2380],
        strongResistance: [2950, 3200, 3500],
        pivotPoints: [2847, 2900, 2790],
      },
    };
    setResult(demoData);
    setMeta({ budget: '₹1,00,000', investmentType: 'MID_TERM', imagesProcessed: 0, timestamp: new Date().toISOString() });
    setLoading(false);
  };

  const handleImageChange = (timeframe: string) => (img: UploadedImage | null) => {
    setImages(prev => ({ ...prev, [timeframe]: img }));
  };

  const handleSubmit = async () => {
    if (!stockName.trim()) { setError('Stock name is required'); return; }
    if (!budget.trim()) { setError('Investment budget is required'); return; }
    const hasImages = Object.values(images).some(v => v !== null);
    // In demo mode, skip the image requirement
    if (!hasImages && !isDemo) { setError('Please upload at least one chart image'); return; }
    // If demo mode and no images, use demo data directly
    if (!hasImages && isDemo) { triggerDemo(); return; }
    setError(null);
    setLoading(true);
    setResult(null);

    try {
      const fd = new FormData();
      fd.append('stockName', stockName);
      fd.append('symbol', symbol);
      fd.append('budget', budget);
      fd.append('investmentType', investmentType);
      
      Object.entries(images).forEach(([tf, img]) => {
        if (img) fd.append(tf, img.file);
      });

      const res = await api.post<AnalysisResponse>('/api/chart-analysis', fd);
      
      if (!res.success) {
        throw new Error(res.error || 'Analysis failed');
      }

      const data = res.data;

      if (!data?.success) {
        throw new Error(data?.error || 'Analysis failed');
      }

      setResult(data.analysis);
      setMeta({
        budget: data.metadata.budget,
        investmentType: data.metadata.investmentType,
        imagesProcessed: data.metadata.imagesProcessed,
        timestamp: data.metadata.timestamp,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
    } finally {
      setLoading(false);
    }

  };

  const handleReset = () => {
    setResult(null);
    setMeta(null);
    setError(null);
    setStockName('');
    setSymbol('');
    setBudget('');
    setInvestmentType('MID_TERM');
    setImages({});
  };

  const inputStyle: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 10, padding: '11px 14px', color: 'rgba(255,255,255,0.88)', fontSize: 13, outline: 'none', transition: 'all 0.2s' };
  const labelStyle: React.CSSProperties = { fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.10em', color: 'rgba(255,255,255,0.30)', textTransform: 'uppercase', marginBottom: 6, display: 'block' };

  const containerClasses = isStandalone 
    ? "relative w-screen h-screen overflow-hidden bg-black text-white" 
    : "";

  return (
    <div className={containerClasses}>
      {isStandalone && (
        <>
          <NeuralBackground subtle blurred />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80 pointer-events-none z-[1]" />
        </>
      )}
      
      <BackButton />
      
      {isStandalone ? (
        <main className="relative z-10 w-full h-full overflow-y-auto">
          <div className="flex items-center justify-center min-h-full px-4 md:px-6 pt-16 pb-24">
            <div className="w-full max-w-7xl">
              {renderContent()}
            </div>
          </div>
        </main>
      ) : (
        <div className="w-full max-w-7xl mx-auto">
          {renderContent()}
        </div>
      )}
    </div>
  );

  function renderContent() {
    return (
      <>
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-full text-[10px] font-mono font-semibold tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">AI POWERED</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">Chart Analysis</h1>
              <p className="text-slate-400 text-sm mt-2 max-w-lg">Upload stock chart screenshots and get AI-powered predictions, support/resistance levels, entry/exit points, and investment strategy.</p>
            </motion.div>
            
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-black/60 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-12">
                  <LoadingAnimation />
                </motion.div>
              ) : result && meta ? (
                <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/5 pr-16 sm:pr-0">
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => {
                  const content = `# 📊 CHART ANALYSIS REPORT
**Trading Rocket AI Engine**

---

## 📈 STOCK OVERVIEW
| Field | Value |
|-------|-------|
| **Stock Name** | ${result.stockName} |
| **Symbol** | ${result.symbol || 'N/A'} |
| **Current Price** | ₹${result.currentPrice.toLocaleString()} |
| **Prediction** | ${result.predictedTrend} |
| **Confidence** | ${result.confidence}% |
| **Investment Type** | ${meta.investmentType.replace('_', ' ')} |
| **Budget** | ₹${parseInt(meta.budget.replace(/[^0-9]/g, '') || '50000').toLocaleString()} |

---

## 🎯 INVESTMENT STRATEGY
| Metric | Value |
|--------|-------|
| **Recommended Entry** | ₹${result.investmentStrategy.recommendedEntry.toLocaleString()} |
| **Stop Loss** | ₹${result.investmentStrategy.stopLoss.toLocaleString()} |
| **Target Price** | ₹${result.investmentStrategy.targetPrice.toLocaleString()} |
| **Risk:Reward Ratio** | 1:${result.investmentStrategy.riskRewardRatio} |
| **Position Size** | ₹${result.investmentStrategy.positionSize.toLocaleString()} |

---

## 📊 MULTI-TIMEFRAME ANALYSIS

### Daily (1D)
- **Trend:** ${result.timeframeAnalysis['1D'].trend}
- **Signal:** ${result.timeframeAnalysis['1D'].signal}
- **Support:** ₹${result.timeframeAnalysis['1D'].support.toLocaleString()}
- **Resistance:** ₹${result.timeframeAnalysis['1D'].resistance.toLocaleString()}

### Monthly (1M)
- **Trend:** ${result.timeframeAnalysis['1M'].trend}
- **Signal:** ${result.timeframeAnalysis['1M'].signal}
- **Support:** ₹${result.timeframeAnalysis['1M'].support.toLocaleString()}
- **Resistance:** ₹${result.timeframeAnalysis['1M'].resistance.toLocaleString()}

### 6 Months (6M)
- **Trend:** ${result.timeframeAnalysis['6M'].trend}
- **Signal:** ${result.timeframeAnalysis['6M'].signal}
- **Support:** ₹${result.timeframeAnalysis['6M'].support.toLocaleString()}
- **Resistance:** ₹${result.timeframeAnalysis['6M'].resistance.toLocaleString()}

### Yearly (1Y)
- **Trend:** ${result.timeframeAnalysis['1Y'].trend}
- **Signal:** ${result.timeframeAnalysis['1Y'].signal}
- **Support:** ₹${result.timeframeAnalysis['1Y'].support.toLocaleString()}
- **Resistance:** ₹${result.timeframeAnalysis['1Y'].resistance.toLocaleString()}

---

## 🔑 KEY LEVELS

### Strong Support Levels
${result.keyLevels.strongSupport.map((l: number) => `- ₹${l.toLocaleString()}`).join('\n')}

### Strong Resistance Levels
${result.keyLevels.strongResistance.map((l: number) => `- ₹${l.toLocaleString()}`).join('\n')}

### Pivot Points
${result.keyLevels.pivotPoints.map((l: number) => `- ₹${l.toLocaleString()}`).join('\n')}

---

## 📉 TECHNICAL INDICATORS
| Indicator | Value |
|-----------|-------|
| **RSI (14)** | ${result.technicalIndicators.rsi} |
| **MACD** | ${result.technicalIndicators.macd} |
| **Moving Averages** | ${result.technicalIndicators.movingAverages} |
| **Volume Analysis** | ${result.technicalIndicators.volumeAnalysis} |

---

## 📋 EXECUTIVE SUMMARY
${result.summary}

---

## ⚠️ DISCLAIMER
This report is generated by AI and is for **educational and informational purposes only**. It does not constitute financial advice. Always conduct your own research and consult with a qualified financial advisor before making investment decisions.

---

*Report generated on ${new Date(meta.timestamp).toLocaleString()} by Trading Rocket AI Engine*
*Version 1.0*
`.trim();
                  const blob = new Blob([content], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${result.stockName.replace(/\s+/g, '_')}_Chart_Analysis_Report.md`;
                  a.click();
                  URL.revokeObjectURL(url);
                }} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px', borderRadius: 10, background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))', border: '1px solid rgba(139,92,246,0.3)', color: '#a78bfa', fontSize: 12, fontFamily: 'monospace', cursor: 'pointer', boxShadow: '0 2px 8px rgba(139,92,246,0.15)' }}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
                  DOWNLOAD REPORT
                </motion.button>
<motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleReset} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px', borderRadius: 10, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981', fontSize: 12, fontFamily: 'monospace', cursor: 'pointer' }}>↺ NEW ANALYSIS</motion.button>
                  </div>
                  <div style={{ 
                    maxHeight: 'calc(100vh - 200px)', 
                    overflowY: 'auto', 
                    overflowX: 'hidden',
                    borderRadius: 16, 
                    background: 'rgba(8,12,20,0.95)', 
                    padding: 20,
                    marginTop: 16,
                  }}>
                    <div style={{ maxWidth: '100%', overflowX: 'hidden' }}>
                      <ResultsDashboard analysis={result} meta={meta} />
                      <ProjectionPanel analysis={result} />
                    </div>
                  </div>
                </motion.div>
              ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div style={{ background: 'rgba(8,12,20,0.88)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, backdropFilter: 'blur(24px)', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,0.03)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#06b6d4' }} />
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#60a5fa' }} />
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,0.25)', marginLeft: 8 }}>CHART_ANALYSIS_INPUT.exe</span>
              </div>
              <div style={{ padding: '24px 24px 28px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                  <div>
                    <label style={labelStyle}>Stock Name</label>
                    <input type="text" value={stockName} onChange={(e) => setStockName(e.target.value)} placeholder="e.g. Reliance Industries" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Symbol (Optional)</label>
                    <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="e.g. RELIANCE" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Investment Budget (₹)</label>
                    <input type="text" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. 50000" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Investment Type</label>
                    <select value={investmentType} onChange={(e) => setInvestmentType(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                      {INVESTMENT_TYPES.map(t => <option key={t.id} value={t.id} style={{ background: '#0c1120' }}>{t.label} - {t.desc}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: 8 }}>
                  <label style={{ ...labelStyle, color: 'rgba(16,185,129,0.7)', marginBottom: 14 }}>▸ UPLOAD CHART SCREENSHOTS</label>
                  <div style={{ gridTemplateColumns: 'repeat(4, 1fr)', display: 'grid', gap: 10 }}>
                    {TIMEFRAMES.map(tf => (
                      <DropZone key={tf.id} timeframe={tf.id} label={tf.label} color={tf.color} value={images[tf.id] || null} onChange={handleImageChange(tf.id)} />
                    ))}
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ marginTop: 16, padding: '10px 14px', borderRadius: 10, background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)', color: '#fca5a5', fontSize: 12, fontFamily: 'monospace' }}>⚠ {error}</motion.div>
                  )}
                </AnimatePresence>

                <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                  <motion.button whileHover={{ scale: 1.025 }} whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={loading} className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 border border-emerald-500/30 rounded-xl text-white text-sm font-semibold font-mono tracking-wide uppercase hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-200 disabled:opacity-50">
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    ANALYZE CHARTS
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </>
    );
  }
}

export default function ChartAnalysisPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-40"><div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <ChartAnalysisInner />
    </Suspense>
  );
}
