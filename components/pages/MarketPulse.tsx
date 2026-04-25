'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMarketDataStore } from '../../store';
import type { MarketIndex, StockQuote, MacroImpactEvent } from '../../types';
import {
  formatINR,
  formatPercent,
  getPriceChangeColor,
  getPriceChangeBgColor,
  formatVolume,
  formatRelativeTime,
} from '../../utils';
import AnalysisLoader from './AnalysisLoader';
import AnalysisReport from './AnalysisReport';

type AnalysisState = 'idle' | 'loading' | 'report';

const Ticker: React.FC<{ items: MarketIndex[] }> = ({ items }) => {
  const tickerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.025)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="absolute left-0 top-0 bottom-0 w-16 z-10"
           style={{ background: 'linear-gradient(to right, rgba(8,12,20,0.8), transparent)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-16 z-10"
           style={{ background: 'linear-gradient(to left, rgba(8,12,20,0.8), transparent)' }} />
      <motion.div
        ref={tickerRef}
        className="flex items-center gap-8 py-3 px-6"
        animate={{ x: isPaused ? undefined : [0, -50] }}
        transition={{ x: { duration: 40, repeat: Infinity, ease: 'linear' } }}
      >
        {[...items, ...items].map((item, index) => (
          <div key={`${item.symbol}-${index}`} className="flex items-center gap-2.5 whitespace-nowrap">
            <span className="text-[12px] font-mono font-semibold"
                  style={{ color: 'rgba(255,255,255,0.55)' }}>{item.symbol}</span>
            <span className={`text-[12px] font-mono tabular ${getPriceChangeColor(item.change)}`}
                  style={{ color: 'rgba(255,255,255,0.80)' }}>{formatINR(item.value, 2)}</span>
            <span className={`text-[11px] font-mono tabular px-2 py-0.5 rounded-md ${
              item.change >= 0 ? 'badge-profit' : 'badge-loss'
            }`}>
              {formatPercent(item.changePercent)}
            </span>
            <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.07)', display: 'inline-block', verticalAlign: 'middle' }} />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

const StockCard: React.FC<{ stock: StockQuote; index: number; onClick: () => void }> = ({ stock, index, onClick }) => {
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);
  const prevPrice = useRef(stock.price);

  useEffect(() => {
    if (prevPrice.current !== stock.price) {
      setFlash(stock.price > prevPrice.current ? 'up' : 'down');
      prevPrice.current = stock.price;
      const timer = setTimeout(() => setFlash(null), 550);
      return () => clearTimeout(timer);
    }
  }, [stock.price]);

  const isUp = (stock.change ?? 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.32, ease: [0.16,1,0.3,1] }}
      whileHover={{ y: -3, transition: { duration: 0.22, ease: [0.16,1,0.3,1] } }}
      whileTap={{ scale: 0.975 }}
      onClick={onClick}
      className={`glass-card cursor-pointer overflow-hidden ${
        flash === 'up' ? 'flash-profit' : flash === 'down' ? 'flash-loss' : ''
      }`}
      style={{ padding: 0 }}
    >
      {/* Top accent line */}
      <div className="h-px" style={{
        background: isUp
          ? 'linear-gradient(90deg, transparent, rgba(16,185,129,0.5), transparent)'
          : 'linear-gradient(90deg, transparent, rgba(244,63,94,0.35), transparent)',
      }} />

      <div style={{ padding: '18px 18px 16px' }}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                 style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.12)' }}>
              <span className="text-[11px] font-mono font-bold" style={{ color: '#60a5fa' }}>
                {stock.ticker.slice(0, 3)}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-inter font-semibold leading-none" style={{ color: 'rgba(255,255,255,0.88)' }}>
                {stock.ticker}
              </p>
              <p className="text-[11px] mt-0.5 truncate max-w-[90px]" style={{ color: 'rgba(255,255,255,0.30)' }}>
                {stock.name}
              </p>
            </div>
          </div>
          <span className="chip chip-blue text-[10px]">{stock.exchange}</span>
        </div>

        {/* Price */}
        <motion.p
          key={stock.price.toFixed(2)}
          initial={flash ? { scale: 1.05 } : {}}
          animate={{ scale: 1 }}
          transition={{ duration: 0.25 }}
          className="text-[22px] font-mono font-bold tabular mb-3"
          style={{ color: 'rgba(255,255,255,0.92)', letterSpacing: '-0.03em', lineHeight: 1 }}
        >
          {formatINR(stock.price)}
        </motion.p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className={isUp ? 'badge-profit' : 'badge-loss'}>
            {isUp ? '▲' : '▼'} {formatPercent(Math.abs(stock.changePercent))}
          </span>
          <div className="text-right">
            <p className="text-[10.5px] label-xs">VOL</p>
            <p className="text-[11.5px] font-mono tabular" style={{ color: 'rgba(255,255,255,0.40)' }}>
              {formatVolume(stock.volume)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const MacroImpactCard: React.FC<{ event: MacroImpactEvent; index: number }> = ({ event, index }) => {
  const levelStyle: Record<string, string> = {
    High:   'chip-red',
    Medium: 'chip-yellow',
    Low:    'chip-blue',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.32, ease: [0.16,1,0.3,1] }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="glass-card"
    >
      <div style={{ padding: '18px 20px' }}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="text-[13px] font-inter font-semibold mb-1 leading-snug"
                style={{ color: 'rgba(255,255,255,0.85)' }}>{event.headline}</h4>
            <p className="text-[11.5px]" style={{ color: 'rgba(255,255,255,0.30)' }}>
              {event.source} · {formatRelativeTime(event.publishedAt)}
            </p>
          </div>
          <span className={`chip ${levelStyle[event.impactLevel] || 'chip-blue'} shrink-0`}>
            {event.impactLevel}
          </span>
        </div>
        <p className="text-[12.5px] mb-4 line-clamp-2"
           style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.55 }}>{event.summary}</p>
        <div className="flex flex-wrap gap-1.5">
          {event.impactedSectors.map((s) => (
            <span key={s} className="px-2.5 py-1 rounded-full text-[10.5px] font-medium"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.40)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {s}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const MarketOverviewCard: React.FC<{ index: MarketIndex }> = ({ index }) => {
  const isUp = index.change >= 0;
  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.2, ease: [0.16,1,0.3,1] } }}
      className="glass-card"
      style={{ padding: '16px 18px' }}
    >
      <div className="flex items-start justify-between mb-2.5">
        <p className="text-[11px] label-xs">{index.symbol}</p>
        <span className={isUp ? 'badge-profit' : 'badge-loss'} style={{ fontSize: 10 }}>
          {isUp ? '▲' : '▼'}
        </span>
      </div>
      <p className="text-[19px] font-mono font-bold tabular mb-1"
         style={{ color: 'rgba(255,255,255,0.90)', letterSpacing: '-0.02em' }}>
        {formatINR(index.value, 2)}
      </p>
      <div className="flex items-center gap-2">
        <span className={`text-[12px] font-mono tabular font-semibold ${isUp ? 'num-profit' : 'num-loss'}`}>
          {isUp ? '+' : ''}{formatINR(index.change, 2)}
        </span>
        <span className={`text-[11.5px] font-mono tabular ${isUp ? 'num-profit' : 'num-loss'}`}
              style={{ opacity: 0.7 }}>
          ({formatPercent(index.changePercent)})
        </span>
      </div>
    </motion.div>
  );
};

const MarketPulse: React.FC = () => {
  const { indices, trendingStocks, macroEvents, setIndices, setTrendingStocks, setMacroEvents } = useMarketDataStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'trending' | 'stocks' | 'etfs' | 'commodities' | 'forex' | 'ipos'>('overview');
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [selectedStockForAnalysis, setSelectedStockForAnalysis] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    setLastUpdate(new Date().toISOString());
  }, []);
  const [allStocksData, setAllStocksData] = useState<any[]>([]);
  const [ipoData, setIpoData] = useState<any[]>([]);
  const [elementsData, setElementsData] = useState<any[]>([]);
  const [etfData, setEtfData] = useState<any[]>([]);
  const [forexData, setForexData] = useState<any[]>([]);
  const [gainersData, setGainersData] = useState<any[]>([]);
  const [losersData, setLosersData] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stocksRes, iposRes, elementsRes, etfsRes, forexRes, gainersRes, losersRes] = await Promise.all([
          fetch('/api/stocks'),
          fetch('/api/stocks?type=ipos'),
          fetch('/api/stocks?type=elements'),
          fetch('/api/stocks?type=etfs'),
          fetch('/api/stocks?type=forex'),
          fetch('/api/stocks?type=gainers'),
          fetch('/api/stocks?type=losers'),
        ]);
        
        if (stocksRes.ok) {
          const stocksData = await stocksRes.json();
          if (stocksData.success) {
            setAllStocksData(stocksData.data);
            const formatted = stocksData.data.slice(0, 12).map((s: any) => ({
              ticker: s.ticker,
              exchange: s.exchange,
              name: s.name,
              price: s.price,
              change: s.change,
              changePercent: s.changePercent,
              volume: s.volume,
              avgVolume: s.volume,
              dayHigh: s.dayHigh,
              dayLow: s.dayLow,
              yearHigh: s.yearHigh,
              yearLow: s.yearLow,
              marketCap: s.marketCap,
              pe: s.pe,
              beta: 0.9,
              lastUpdated: new Date().toISOString(),
            }));
            setTrendingStocks(formatted);
          }
        }
        
        if (iposRes.ok) {
          const iposData = await iposRes.json();
          if (iposData.success) setIpoData(iposData.data);
        }
        
        if (elementsRes.ok) {
          const elemsData = await elementsRes.json();
          if (elemsData.success) setElementsData(elemsData.data);
        }
        
        if (etfsRes.ok) {
          const etfResult = await etfsRes.json();
          if (etfResult.success) setEtfData(etfResult.data);
        }
        
        if (forexRes.ok) {
          const forexResult = await forexRes.json();
          if (forexResult.success) setForexData(forexResult.data);
        }
        
        if (gainersRes.ok) {
          const gainersResult = await gainersRes.json();
          if (gainersResult.success) setGainersData(gainersResult.data);
        }
        
        if (losersRes.ok) {
          const losersResult = await losersRes.json();
          if (losersResult.success) setLosersData(losersResult.data);
        }
      } catch (err) {
        console.error('Failed to fetch market data:', err);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const handleStockAnalyze = (ticker: string) => {
    setSelectedStockForAnalysis(ticker);
    setAnalysisState('loading');
  };
  
  const handleAnalysisComplete = () => {
    setAnalysisState('report');
  };
  
  const handleBackToMarket = () => {
    setAnalysisState('idle');
    setSelectedStockForAnalysis(null);
  };
  
  useEffect(() => {
    if (indices.length === 0) {
      setIndices([
        { symbol: 'NIFTY 50', name: 'NIFTY 50', value: 22456.75, change: 156.30, changePercent: 0.70, high: 22512.40, low: 22318.50, previousClose: 22300.45 },
        { symbol: 'SENSEX', name: 'BSE SENSEX', value: 74328.12, change: -89.45, changePercent: -0.12, high: 74521.30, low: 74190.80, previousClose: 74417.57 },
        { symbol: 'NIFTY BANK', name: 'NIFTY BANK', value: 48652.30, change: 234.15, changePercent: 0.48, high: 48780.20, low: 48350.10, previousClose: 48418.15 },
        { symbol: 'NIFTY IT', name: 'NIFTY IT', value: 38456.90, change: -156.20, changePercent: -0.40, high: 38612.50, low: 38290.30, previousClose: 38613.10 },
        { symbol: 'USD/INR', name: 'USD/INR', value: 83.25, change: 0.08, changePercent: 0.10, high: 83.45, low: 83.10, previousClose: 83.17 },
      ]);
    }
  }, []);
  
  useEffect(() => {
    if (trendingStocks.length === 0) {
      setTrendingStocks([
        { ticker: 'RELIANCE', exchange: 'NSE', name: 'Reliance Industries', price: 2856.45, change: 23.50, changePercent: 0.83, volume: 8456320, avgVolume: 7200000, dayHigh: 2872.30, dayLow: 2834.20, yearHigh: 2956.80, yearLow: 2418.50, marketCap: 1934567, pe: 28.5, beta: 0.87, lastUpdated: new Date().toISOString() },
        { ticker: 'TCS', exchange: 'NSE', name: 'Tata Consultancy', price: 4125.60, change: -15.30, changePercent: -0.37, volume: 2341000, avgVolume: 2800000, dayHigh: 4145.20, dayLow: 4108.40, yearHigh: 4256.90, yearLow: 3540.00, marketCap: 1502345, pe: 26.8, beta: 0.92, lastUpdated: new Date().toISOString() },
        { ticker: 'HDFCBANK', exchange: 'NSE', name: 'HDFC Bank', price: 1723.85, change: 12.45, changePercent: 0.73, volume: 5623100, avgVolume: 4800000, dayHigh: 1735.60, dayLow: 1708.20, yearHigh: 1868.50, yearLow: 1520.00, marketCap: 1324567, pe: 19.2, beta: 1.12, lastUpdated: new Date().toISOString() },
        { ticker: 'INFY', exchange: 'NSE', name: 'Infosys', price: 1845.30, change: -8.20, changePercent: -0.44, volume: 3456000, avgVolume: 4100000, dayHigh: 1856.50, dayLow: 1832.10, yearHigh: 1924.00, yearLow: 1580.50, marketCap: 765432, pe: 25.6, beta: 0.95, lastUpdated: new Date().toISOString() },
      ]);
    }
  }, []);
  
  useEffect(() => {
    if (macroEvents.length === 0) {
      setMacroEvents([
        { id: '1', headline: 'RBI Keeps Repo Rate Unchanged at 6.5%', source: 'Reserve Bank of India', publishedAt: new Date(Date.now() - 3600000).toISOString(), globalMarket: 'Global', impactedSectors: ['Banking', 'NBFC', 'Real Estate'], impactLevel: 'Medium', impactDirection: 'Mixed', summary: 'The RBI MPC meeting concluded with status quo on rates, signaling caution amid inflation concerns.' },
        { id: '2', headline: 'US Fed Signals Potential Rate Cut', source: 'Federal Reserve', publishedAt: new Date(Date.now() - 7200000).toISOString(), globalMarket: 'US Markets', impactedSectors: ['IT Services', 'Pharma'], impactLevel: 'High', impactDirection: 'Positive', summary: 'Fed indicated readiness to ease policy if inflation declines.' },
      ]);
    }
  }, []);
  
  useEffect(() => {
    const interval = setInterval(() => setLastUpdate(new Date().toISOString()), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchUpdates = () => {
      if (allStocksData.length > 0) {
        const updated = allStocksData.map((s: any) => ({
          ...s,
          change: (Math.random() - 0.5) * s.price * 0.01,
          changePercent: (Math.random() - 0.5) * 1,
          price: s.price + (Math.random() - 0.5) * s.price * 0.002,
          timestamp: new Date().toISOString(),
        }));
        setAllStocksData(updated);
        if (updated.length > 0) {
          setTrendingStocks(updated.slice(0, 12));
        }
      }
    };
    
    const updateInterval = setInterval(fetchUpdates, 5000);
    return () => clearInterval(updateInterval);
  }, [allStocksData]);
  
  return (
    <div className="space-y-6">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: [0.16,1,0.3,1] }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="heading-xl" style={{ fontSize: 24 }}>Market Pulse</h1>
          <p className="text-[12.5px] mt-1 font-inter tabular"
             style={{ color: 'rgba(255,255,255,0.32)' }}>
            Near real-time · Updated {new Date(lastUpdate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>
        <div className="live-badge">
          <div className="live-dot" />
          <span className="text-[12px] font-mono font-semibold" style={{ color: '#34d399' }}>LIVE</span>
        </div>
      </motion.div>

      {/* Ticker */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}>
        <Ticker items={indices} />
      </motion.div>

      {/* Tab bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14, duration: 0.32, ease: [0.16,1,0.3,1] }}
        className="flex items-center gap-1 w-fit"
        style={{
          padding: '5px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 14,
          backdropFilter: 'blur(16px)',
        }}
      >
        {(['overview', 'trending', 'stocks', 'etfs', 'commodities', 'forex', 'ipos'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="relative px-4 py-2 rounded-[10px] text-[13px] font-inter font-medium transition-all duration-200"
            style={{
              color: activeTab === tab ? 'rgba(255,255,255,0.90)' : 'rgba(255,255,255,0.36)',
              background: activeTab === tab ? 'rgba(59,130,246,0.12)' : 'transparent',
              border: activeTab === tab ? '1px solid rgba(59,130,246,0.18)' : '1px solid transparent',
            }}
          >
            {tab === 'trending' ? 'Trending' : tab === 'etfs' ? 'ETFs' : tab === 'commodities' ? 'Commodities' : tab === 'forex' ? 'Forex' : tab === 'ipos' ? 'IPOs' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </motion.div>
      
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {indices.map((index) => <MarketOverviewCard key={index.symbol} index={index} />)}
          </motion.div>
        )}
        
        {activeTab === 'trending' && (
          <motion.div key="trending" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>Top Gainers</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(gainersData.length > 0 ? gainersData : trendingStocks).slice(0, 6).map((stock: any, i: number) => (
                    <StockCard key={stock.ticker} stock={stock} index={i} onClick={() => handleStockAnalyze(stock.ticker)} />
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>Top Losers</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(losersData.length > 0 ? losersData : trendingStocks).slice(0, 6).map((stock: any, i: number) => (
                    <StockCard key={stock.ticker} stock={stock} index={i} onClick={() => handleStockAnalyze(stock.ticker)} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {activeTab === 'stocks' && (
          <motion.div key="stocks" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {(allStocksData.length > 0 ? allStocksData : trendingStocks).map((stock: any, i: number) => (
              <StockCard key={stock.ticker} stock={stock} index={i} onClick={() => handleStockAnalyze(stock.ticker)} />
            ))}
          </motion.div>
        )}
        
        {activeTab === 'etfs' && (
          <motion.div key="etfs" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {etfData.length > 0 ? etfData.map((etf: any, i: number) => (
              <StockCard key={etf.ticker} stock={etf} index={i} onClick={() => handleStockAnalyze(etf.ticker)} />
            )) : (
              <p className="text-white/40">Loading ETFs...</p>
            )}
          </motion.div>
        )}
        
        {activeTab === 'commodities' && (
          <motion.div key="commodities" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {elementsData.length > 0 ? elementsData.map((elem: any, i: number) => (
              <StockCard key={elem.ticker} stock={elem} index={i} onClick={() => handleStockAnalyze(elem.ticker)} />
            )) : (
              <p className="text-white/40">Loading commodities...</p>
            )}
          </motion.div>
        )}
        
        {activeTab === 'forex' && (
          <motion.div key="forex" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {forexData.length > 0 ? forexData.map((fx: any, i: number) => (
              <StockCard key={fx.ticker} stock={fx} index={i} onClick={() => handleStockAnalyze(fx.ticker)} />
            )) : (
              <p className="text-white/40">Loading forex...</p>
            )}
          </motion.div>
        )}
        
        {activeTab === 'ipos' && (
          <motion.div key="ipos" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {ipoData.length > 0 ? ipoData.map((ipo: any) => (
              <motion.div key={ipo.ticker} whileHover={{ scale: 1.03, y: -4 }} whileTap={{ scale: 0.98 }} onClick={() => handleStockAnalyze(ipo.ticker)} className="relative rounded-3xl border cursor-pointer overflow-hidden group" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}>
                <div className="relative p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>IPO</span>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{ipo.sector}</span>
                  </div>
                  <h3 className="text-lg font-mono font-bold mb-1" style={{ color: 'rgba(255,255,255,0.9)' }}>{ipo.ticker}</h3>
                  <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>{ipo.name}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Exchange</span>
                      <span className="text-sm font-mono" style={{ color: 'rgba(255,255,255,0.8)' }}>{ipo.exchange}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )) : (
              <p className="text-white/40">No upcoming IPOs</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.32, ease: [0.16,1,0.3,1] }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Advance / Decline', value: '1,847 / 1,234', color: 'rgba(255,255,255,0.85)' },
          { label: 'FII Net Flow',       value: '+₹1,234 Cr',    color: '#34d399' },
          { label: 'DII Net Flow',       value: '+₹2,567 Cr',    color: '#34d399' },
          { label: 'India VIX',          value: '14.32',          color: '#fbbf24' },
        ].map((item) => (
          <div key={item.label} className="metric-card">
            <p className="metric-label">{item.label}</p>
            <p className="metric-value tabular" style={{ color: item.color, fontSize: 18 }}>{item.value}</p>
          </div>
        ))}
      </motion.div>
      
      {analysisState === 'loading' && selectedStockForAnalysis && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[60vh]">
          <AnalysisLoader stock={selectedStockForAnalysis} onComplete={handleAnalysisComplete} />
        </motion.div>
      )}
      
      {analysisState === 'report' && selectedStockForAnalysis && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <AnalysisReport stock={selectedStockForAnalysis} onBack={handleBackToMarket} />
        </motion.div>
      )}
    </div>
  );
};

export default MarketPulse;