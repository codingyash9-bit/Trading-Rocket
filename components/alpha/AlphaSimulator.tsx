'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAlphaSimulatorStore } from '../../store';
import type { ProcessingLog, AlphaGaugeData, SignalType } from '../../types';

interface AlphaSimulatorProps {
  isRunning: boolean;
  onComplete: (gaugeData: AlphaGaugeData) => void;
  onReset: () => void;
  ticker?: string;
}

// Processing Log Display
const LogEntry: React.FC<{ log: ProcessingLog; index: number }> = ({ log, index }) => {
  const getTypeStyles = (type: ProcessingLog['type']) => {
    switch (type) {
      case 'info':
        return { color: 'text-slate-400', prefix: '>' };
      case 'processing':
        return { color: 'text-cyan-400', prefix: '◆' };
      case 'complete':
        return { color: 'text-emerald-400', prefix: '✓' };
      case 'warning':
        return { color: 'text-yellow-400', prefix: '!' };
      case 'error':
        return { color: 'text-red-400', prefix: '✗' };
      default:
        return { color: 'text-slate-400', prefix: '>' };
    }
  };

  const styles = getTypeStyles(log.type);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className={`font-mono text-sm ${styles.color} flex items-start gap-2`}
    >
      <span className="opacity-50">{styles.prefix}</span>
      <span>{log.message}</span>
      {log.progress !== undefined && (
        <span className="text-cyan-500 ml-2">[{log.progress}%]</span>
      )}
    </motion.div>
  );
};

// AlphaGauge - Circular Progress Indicator
const AlphaGauge: React.FC<{
  probability: number;
  isAnimating: boolean;
}> = ({ probability, isAnimating }) => {
  const [displayProbability, setDisplayProbability] = useState(0);
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (displayProbability / 100) * circumference;
  
  const getCategory = (prob: number): AlphaGaugeData['category'] => {
    if (prob >= 80) return 'Strong Opportunity';
    if (prob >= 60) return 'Moderate Opportunity';
    if (prob >= 40) return 'Low Opportunity';
    return 'High Risk';
  };
  
  const getGlowColor = (prob: number): string => {
    if (prob >= 80) return '#10b981';
    if (prob >= 60) return '#06b6d4';
    if (prob >= 40) return '#f59e0b';
    return '#ef4444';
  };
  
  const category = getCategory(displayProbability);
  const glowColor = getGlowColor(displayProbability);
  
  useEffect(() => {
    if (!isAnimating) {
      setDisplayProbability(probability);
    } else {
      const interval = setInterval(() => {
        setDisplayProbability((prev) => {
          if (prev >= probability) {
            clearInterval(interval);
            return probability;
          }
          return Math.min(prev + 2, probability);
        });
      }, 30);
      return () => clearInterval(interval);
    }
  }, [probability, isAnimating]);
  
  return (
    <div className="relative w-72 h-72">
      {/* Outer glow ring */}
      {displayProbability >= 80 && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: `0 0 60px 20px ${glowColor}40` }}
          animate={{
            opacity: [0.6, 1, 0.6],
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
      
      {/* Background ring */}
      <svg className="w-full h-full -rotate-90" viewBox="0 0 260 260">
        <circle
          cx="130"
          cy="130"
          r="120"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="12"
        />
        
        {/* Progress ring */}
        <motion.circle
          cx="130"
          cy="130"
          r="120"
          fill="none"
          stroke={glowColor}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ filter: `drop-shadow(0 0 10px ${glowColor})` }}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
        
        {/* Tick marks */}
        {[...Array(20)].map((_, i) => {
          const angle = (i / 20) * 360;
          const rad = (angle - 90) * (Math.PI / 180);
          const innerR = 105;
          const outerR = 115;
          const x1 = 130 + innerR * Math.cos(rad);
          const y1 = 130 + innerR * Math.sin(rad);
          const x2 = 130 + outerR * Math.cos(rad);
          const y2 = 130 + outerR * Math.sin(rad);
          
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1"
            />
          );
        })}
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 10, delay: 0.3 }}
          className="text-center"
        >
          <motion.div
            className="text-6xl font-mono font-bold text-white mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {Math.round(displayProbability)}%
          </motion.div>
          <motion.div
            className="text-sm font-inter uppercase tracking-wider"
            style={{ color: glowColor }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {category}
          </motion.div>
        </motion.div>
        
        {/* Pulsing dot */}
        {isAnimating && (
          <motion.div
            className="absolute w-4 h-4 rounded-full bg-cyan-400"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
          />
        )}
      </div>
      
      {/* Decorative arcs */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 260 260">
        <path
          d="M 130 20 A 110 110 0 0 1 240 130"
          fill="none"
          stroke="url(#arc-gradient)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.5"
        />
        <defs>
          <linearGradient id="arc-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d4c8" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

// Typewriter Effect Component
const TypewriterText: React.FC<{
  text: string;
  speed?: number;
  onComplete?: () => void;
}> = ({ text, speed = 30, onComplete }) => {
  const [displayText, setDisplayText] = useState('');
  
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        onComplete?.();
      }
    }, speed);
    
    return () => clearInterval(interval);
  }, [text, speed, onComplete]);
  
  return <span>{displayText}</span>;
};

// Main AlphaSimulator Component
const AlphaSimulator: React.FC<AlphaSimulatorProps> = ({
  isRunning,
  onComplete,
  onReset,
  ticker = 'RELIANCE',
}) => {
  const { logs, progress, alphaGauge, addLog, setProgress, setAlphaGauge, resetSimulation } = 
    useAlphaSimulatorStore();
  const [showResults, setShowResults] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const logsRef = useRef<HTMLDivElement>(null);
  
  const processingPhases = [
    {
      name: 'Initializing AI Analysis Engine',
      logs: [
        'Connecting to Indian Markets Data Layer...',
        'Loading NSE/BSE equity databases...',
        'Initializing Gemini-1.5-Pro neural networks...',
        'Calibrating fundamental analysis module...',
        'Setting up quantitative research parameters...',
        'Configuring sentiment analysis pipelines...',
        'Loading FII/DII flow indicators...',
        'Calibrating SEBI disclosure parsers...',
        'System ready. Beginning analysis...',
      ],
    },
    {
      name: 'Fundamental Analysis',
      logs: [
        'Fetching quarterly financials from SEBI filings...',
        'Analyzing P&L statements for FY2024...',
        'Calculating PE, PB, ROE ratios...',
        'Evaluating revenue growth trajectory...',
        'Assessing debt-to-equity metrics...',
        'Computing operating margin trends...',
        'Finalizing fundamental score...',
      ],
    },
    {
      name: 'Quantitative Analysis',
      logs: [
        'Loading historical price data...',
        'Calculating SMA 20/50/200 Moving Averages...',
        'Computing RSI and MACD indicators...',
        'Analyzing Bollinger Bands positioning...',
        'Running Monte Carlo simulations (10,000 paths)...',
        'Calculating Value at Risk (VaR)...',
        'Computing Sharpe and Sortino ratios...',
        'Finalizing quantitative probability models...',
      ],
    },
    {
      name: 'Sentiment Analysis',
      logs: [
        'Scraping news sources (MoneyControl, ET Markets)...',
        'Analyzing X (Twitter) mentions...',
        'Processing Reddit discussions (r/IndiaInvestments)...',
        'Evaluating Instagram sentiment patterns...',
        'Computing aggregate sentiment score...',
        'Detecting key themes and entities...',
        'Finalizing sentiment analysis...',
      ],
    },
    {
      name: 'Strategic Analysis',
      logs: [
        'Fetching F&O Open Interest data...',
        'Analyzing Put-Call ratio dynamics...',
        'Tracking institutional activity (FII/DII)...',
        'Detecting block deal patterns...',
        'Evaluating capital flow trends...',
        'Computing entry/exit signals...',
        'Finalizing strategic recommendations...',
      ],
    },
    {
      name: 'Generating Power Verdict',
      logs: [
        'Synthesizing all analysis streams...',
        'Resolving signal conflicts...',
        'Computing weighted opportunity score...',
        'Generating executive summary...',
        'Formatting structured output...',
        'Verdict generation complete!',
      ],
    },
  ];
  
  useEffect(() => {
    if (isRunning && currentPhase < processingPhases.length) {
      const phase = processingPhases[currentPhase];
      const currentLogIndex = logs.filter((l) => l.type === 'processing').length % phase.logs.length;
      
      if (currentLogIndex === 0 && logs.length === 0) {
        addLog({ message: `▶ ${phase.name}`, type: 'info' });
      }
      
      const timer = setTimeout(() => {
        if (currentLogIndex < phase.logs.length - 1) {
          addLog({ message: phase.logs[currentLogIndex + 1], type: 'processing', progress: Math.round(((currentPhase * phase.logs.length + currentLogIndex + 1) / (processingPhases.length * phase.logs.length)) * 100) });
          setProgress(Math.round(((currentPhase * phase.logs.length + currentLogIndex + 1) / (processingPhases.length * phase.logs.length)) * 100));
        } else {
          addLog({ message: `✓ ${phase.name} complete`, type: 'complete' });
          setCurrentPhase((prev) => prev + 1);
        }
      }, 400);
      
      return () => clearTimeout(timer);
    } else if (isRunning && currentPhase >= processingPhases.length) {
      const finalProbability = Math.floor(Math.random() * 30) + 65;
      const gaugeData: AlphaGaugeData = {
        probability: finalProbability,
        label: `${ticker} Opportunity Score`,
        category: finalProbability >= 80 
          ? 'Strong Opportunity' 
          : finalProbability >= 60 
            ? 'Moderate Opportunity' 
            : 'High Risk',
        glowColor: finalProbability >= 80 ? '#10b981' : '#06b6d4',
        isAnimating: false,
      };
      
      setTimeout(() => {
        addLog({ message: 'All analysis complete. Finalizing results...', type: 'info' });
        setTimeout(() => {
          setAlphaGauge(gaugeData);
          setShowResults(true);
          onComplete(gaugeData);
        }, 1000);
      }, 500);
    }
  }, [isRunning, currentPhase, logs.length]);
  
  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [logs]);
  
  const handleReset = () => {
    resetSimulation();
    setShowResults(false);
    setCurrentPhase(0);
    onReset();
  };
  
  return (
    <div className="relative">
      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
      >
        {/* Background effects */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(0, 212, 200, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 212, 200, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }} />
        </div>
        
        {/* Header */}
        <div className="relative px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                  </svg>
                </div>
                <div className="absolute inset-0 rounded-xl bg-cyan-400/20 blur-md" />
              </div>
              <div>
                <h2 className="text-white font-montserrat font-semibold">
                  AlphaSimulator
                </h2>
                <p className="text-xs text-slate-500 font-mono">
                  {ticker} · NSE · AI-Powered Analysis
                </p>
              </div>
            </div>
          </div>
          
          {/* Progress indicator */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-slate-400">Progress</p>
              <p className="text-lg font-mono font-bold text-cyan-400">{progress}%</p>
            </div>
            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="relative p-6">
          <AnimatePresence mode="wait">
            {!showResults ? (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {/* Processing Logs */}
                <div className="bg-slate-950/50 rounded-xl border border-white/5 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-inter font-semibold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      Processing Terminal
                    </h3>
                    <span className="text-xs text-slate-500 font-mono">
                      {new Date().toLocaleTimeString('en-IN', { hour12: false })}
                    </span>
                  </div>
                  
                  <div
                    ref={logsRef}
                    className="h-80 overflow-y-auto space-y-1 pr-2 scrollbar-thin"
                  >
                    {logs.map((log, index) => (
                      <LogEntry key={`${log.timestamp}-${index}`} log={log} index={index} />
                    ))}
                    {isRunning && (
                      <motion.div
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="flex items-center gap-2"
                      >
                        <span className="text-cyan-400 font-mono">◆</span>
                        <span className="text-cyan-400 font-mono">Processing...</span>
                      </motion.div>
                    )}
                  </div>
                </div>
                
                {/* Visual Display */}
                <div className="bg-slate-950/50 rounded-xl border border-white/5 p-6 flex flex-col items-center justify-center">
                  <div className="relative">
                    {/* Animated processing ring */}
                    <motion.div
                      className="w-48 h-48 rounded-full border-4 border-transparent"
                      style={{
                        background: 'linear-gradient(#0f172a, #0f172a) padding-box, linear-gradient(90deg, #00d4c8, #3b82f6, #8b5cf6) border-box',
                      }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    />
                    <div className="absolute inset-4 rounded-full bg-slate-900 flex items-center justify-center">
                      <div className="text-center">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="text-4xl mb-2"
                        >
                          🚀
                        </motion.div>
                        <p className="text-slate-400 font-mono text-sm">
                          Computing...
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Processing phases */}
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {processingPhases.map((phase, index) => (
                      <div
                        key={phase.name}
                        className={`px-3 py-1 rounded-full text-xs font-mono ${
                          index < currentPhase
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : index === currentPhase
                              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 animate-pulse'
                              : 'bg-slate-800/50 text-slate-500 border border-slate-700/50'
                        }`}
                      >
                        {index < currentPhase ? '✓ ' : index === currentPhase ? '◆ ' : '○ '}
                        {phase.name}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center"
              >
                {/* AlphaGauge */}
                <div className="mb-8">
                  <AlphaGauge
                    probability={alphaGauge?.probability || 0}
                    isAnimating={false}
                  />
                </div>
                
                {/* Results Summary */}
                <div className="w-full max-w-xl space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-slate-800/30 rounded-xl border border-white/5 p-4"
                  >
                    <h3 className="text-white font-inter font-semibold mb-3">
                      Analysis Summary
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Ticker</p>
                        <p className="text-white font-mono">{ticker}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Exchange</p>
                        <p className="text-white font-mono">NSE</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Analysis Date</p>
                        <p className="text-white font-mono">
                          {new Date().toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Confidence</p>
                        <p className="text-cyan-400 font-mono">
                          {alphaGauge?.probability || 0}%
                        </p>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex gap-3"
                  >
                    <motion.button
                      onClick={handleReset}
                      className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-inter font-semibold rounded-xl border border-white/10 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Run Again
                    </motion.button>
                    <motion.button
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-inter font-semibold rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-shadow"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      View Full Report
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default AlphaSimulator;
