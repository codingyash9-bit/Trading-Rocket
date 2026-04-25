'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore, useXAIStore } from '../../store';
import type { XAIData, FeatureImportance, SourceTrace, AnalysisTab } from '../../types';
import { formatINR, formatPercent } from '../../utils';

// Feature Importance Bar Chart Component
const FeatureImportanceBar: React.FC<{ feature: FeatureImportance; index: number }> = ({ feature, index }) => {
  const isPositive = feature.impact >= 0;
  const barWidth = Math.abs(feature.impact);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: isPositive ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative py-3"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-inter text-white">{feature.feature}</span>
        <span className={`text-sm font-mono ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPositive ? '+' : ''}{feature.impact.toFixed(2)}%
        </span>
      </div>
      
      {/* Bar container */}
      <div className="relative h-8 bg-slate-800/50 rounded-lg overflow-hidden">
        {/* Center line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-600" />
        
        {/* Positive bar */}
        {isPositive && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${barWidth}%` }}
            transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
            className="absolute left-1/2 top-0 bottom-0 bg-gradient-to-r from-emerald-500/50 to-emerald-500"
            style={{ boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)' }}
          />
        )}
        
        {/* Negative bar */}
        {!isPositive && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${barWidth}%` }}
            transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
            className="absolute right-1/2 top-0 bottom-0 bg-gradient-to-l from-red-500/50 to-red-500"
            style={{ boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)' }}
          />
        )}
      </div>
      
      {/* Description */}
      <p className="text-xs text-slate-500 mt-1">{feature.description}</p>
    </motion.div>
  );
};

// Source Trace Card Component
const SourceTraceCard: React.FC<{ source: SourceTrace; index: number }> = ({ source, index }) => {
  const typeColors = {
    'SEBI Filing': 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    'Financial Statement': 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    'News Article': 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
    'Research Report': 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    'Company Filing': 'bg-orange-500/10 border-orange-500/30 text-orange-400',
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative bg-slate-900/50 rounded-xl border border-white/5 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="text-white font-inter font-medium text-sm mb-1">
              {source.documentTitle}
            </h4>
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs border ${typeColors[source.documentType]}`}>
              {source.documentType}
            </span>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Relevance</p>
            <p className="text-sm font-mono text-cyan-400">{formatPercent(source.relevanceScore * 100, 0)}</p>
          </div>
        </div>
      </div>
      
      {/* Excerpt */}
      <div className="p-4">
        <p className="text-sm text-slate-400 italic border-l-2 border-cyan-500/50 pl-3">
          &ldquo;{source.excerpt}&rdquo;
        </p>
        
        {source.url && (
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-3 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View Source
          </a>
        )}
        
        <p className="text-xs text-slate-600 mt-2">
          Accessed: {new Date(source.accessedAt).toLocaleDateString('en-IN')}
        </p>
      </div>
    </motion.div>
  );
};

// XAI Drawer Component
const XAIDrawer: React.FC = () => {
  const { xaiDrawerOpen, selectedTickerForXAI, selectedAnalysisTypeForXAI, closeXAIDrawer } = useUIStore();
  const { xaiData, isLoading, setXAIData, setLoading } = useXAIStore();
  const [activeTab, setActiveTab] = useState<'features' | 'sources'>('features');
  
  // Generate mock XAI data when drawer opens
  useEffect(() => {
    if (xaiDrawerOpen && selectedTickerForXAI) {
      setLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        const mockXAIData: XAIData = {
          ticker: selectedTickerForXAI,
          analysisType: selectedAnalysisTypeForXAI || 'fundamentals',
          featureImportance: [
            { feature: 'PE Ratio', impact: 15.2, description: 'Current PE is below industry average, positive signal' },
            { feature: 'Revenue Growth', impact: 12.8, description: 'YoY revenue growth of 18% exceeds sector median' },
            { feature: 'ROE', impact: 8.5, description: 'ROE of 24% indicates efficient capital utilization' },
            { feature: 'Debt/Equity', impact: -6.3, description: 'Leverage increased by 15% this quarter' },
            { feature: 'Cash Flow', impact: 7.2, description: 'Strong operating cash flow of ₹2,340 Cr' },
            { feature: 'Market Sentiment', impact: 4.8, description: 'Positive news coverage over past 30 days' },
            { feature: 'FII Activity', impact: -3.2, description: 'FIIs have reduced position by 5% recently' },
            { feature: 'Technical Score', impact: 5.6, description: 'Price above 50-day moving average' },
          ],
          sourceTraces: [
            {
              documentTitle: 'Q3 FY2026 Financial Results',
              documentType: 'Financial Statement',
              excerpt: 'Revenue grew 18% YoY to ₹1,23,456 Cr, driven by strong performance in the consumer electronics segment. Operating profit margin expanded by 150 bps to 24.5%.',
              relevanceScore: 0.92,
              url: 'https://www.bseindia.com',
              accessedAt: new Date().toISOString(),
            },
            {
              documentTitle: 'SEBI Filing - Shareholding Pattern',
              documentType: 'SEBI Filing',
              excerpt: 'Promoter holding increased by 0.5% to 52.3%. FII holding decreased from 24.5% to 23.2%. DII holding increased from 15.2% to 16.8%.',
              relevanceScore: 0.88,
              url: 'https://www.sebi.gov.in',
              accessedAt: new Date().toISOString(),
            },
            {
              documentTitle: 'Annual Report 2025-26',
              documentType: 'Company Filing',
              excerpt: 'The company plans to invest ₹50,000 Cr over the next 5 years in renewable energy and digital infrastructure. Capex guidance for FY27 is ₹12,000 Cr.',
              relevanceScore: 0.85,
              url: 'https://www.nseindia.com',
              accessedAt: new Date().toISOString(),
            },
            {
              documentTitle: 'Q3 FY26 Earnings Call Transcript',
              documentType: 'Research Report',
              excerpt: 'Management guided for 15-18% revenue growth in FY27. EBITDA margin expansion of 100-150 bps expected. Digital services revenue cross ₹20,000 Cr run-rate.',
              relevanceScore: 0.82,
              accessedAt: new Date().toISOString(),
            },
          ],
          modelConfidence: 87.5,
          limitations: [
            'Analysis based on historical data; past performance may not indicate future results',
            'Sentiment analysis may not fully capture market manipulation attempts',
            'Technical indicators are lagging and may produce delayed signals',
            'External factors like geopolitical events are not fully quantified',
          ],
          generatedAt: new Date().toISOString(),
        };
        
        setXAIData(mockXAIData);
        setLoading(false);
      }, 1000);
    }
  }, [xaiDrawerOpen, selectedTickerForXAI]);
  
  return (
    <AnimatePresence>
      {xaiDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeXAIDrawer}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-slate-900/95 backdrop-blur-xl border-l border-white/10 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="relative p-6 border-b border-white/5">
              {/* Glow effect */}
              <div className="absolute top-0 right-0 w-64 h-32 bg-cyan-500/10 blur-3xl" />
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-montserrat font-bold text-white">
                      Explainable AI
                    </h2>
                    <p className="text-sm text-slate-400">
                      {selectedTickerForXAI} · {selectedAnalysisTypeForXAI?.charAt(0).toUpperCase()}{selectedAnalysisTypeForXAI?.slice(1)} Analysis
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={closeXAIDrawer}
                  className="w-10 h-10 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Model Confidence */}
              <div className="mt-4 flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Model Confidence</span>
                    <span className="text-sm font-mono text-cyan-400">
                      {xaiData?.modelConfidence || 0}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${xaiData?.modelConfidence || 0}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="px-6 py-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('features')}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-inter font-medium transition-all
                    ${activeTab === 'features'
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }
                  `}
                >
                  Feature Importance
                </button>
                <button
                  onClick={() => setActiveTab('sources')}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-inter font-medium transition-all
                    ${activeTab === 'sources'
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }
                  `}
                >
                  Source Traces ({xaiData?.sourceTraces.length || 0})
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : xaiData ? (
                <AnimatePresence mode="wait">
                  {activeTab === 'features' && (
                    <motion.div
                      key="features"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-4"
                    >
                      <div className="mb-6">
                        <h3 className="text-lg font-inter font-semibold text-white mb-2">
                          Feature Importance Analysis
                        </h3>
                        <p className="text-sm text-slate-400">
                          These factors contributed to the AI&apos;s analysis. Positive impacts extend right (green), negative impacts extend left (red).
                        </p>
                      </div>
                      
                      <div className="space-y-4">
                        {xaiData.featureImportance.map((feature, index) => (
                          <FeatureImportanceBar key={feature.feature} feature={feature} index={index} />
                        ))}
                      </div>
                    </motion.div>
                  )}
                  
                  {activeTab === 'sources' && (
                    <motion.div
                      key="sources"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="mb-6">
                        <h3 className="text-lg font-inter font-semibold text-white mb-2">
                          Source Traces
                        </h3>
                        <p className="text-sm text-slate-400">
                          Documents and data sources used in the analysis. Each excerpt shows the relevant portion used for AI inference.
                        </p>
                      </div>
                      
                      <div className="space-y-4">
                        {xaiData.sourceTraces.map((source, index) => (
                          <SourceTraceCard key={source.documentTitle} source={source} index={index} />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              ) : null}
            </div>
            
            {/* Limitations Footer */}
            {xaiData && (
              <div className="p-6 border-t border-white/5 bg-slate-950/50">
                <h4 className="text-sm font-inter font-semibold text-slate-400 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Model Limitations
                </h4>
                <ul className="space-y-2">
                  {xaiData.limitations.map((limitation, index) => (
                    <li key={index} className="text-xs text-slate-500 flex items-start gap-2">
                      <span className="text-slate-600">•</span>
                      {limitation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default XAIDrawer;
