'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { usePaperPortfolioStore, useStockIntelligenceStore } from '../../store';
import type { PortfolioReport, AnalysisTab } from '../../types';
import {
  formatINR,
  formatPercent,
  formatDateIndian,
  formatDateTimeIndian,
  getRecommendationColor,
  getRecommendationBgColor,
  generateId,
} from '../../utils';

// Report Card Component
const ReportCard: React.FC<{
  report: PortfolioReport;
  index: number;
  onView: (report: PortfolioReport) => void;
  onDelete: (id: string) => void;
  onExport: (report: PortfolioReport) => void;
}> = ({ report, index, onView, onDelete, onExport }) => {
  const isPositive = report.overallScore >= 60;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="relative bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all duration-300 overflow-hidden group"
    >
      {/* Background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                <span className="text-sm font-mono font-bold text-cyan-400">
                  {report.ticker.slice(0, 4)}
                </span>
              </div>
              <div className="absolute -inset-1 bg-cyan-400/20 blur-md rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <h3 className="text-white font-inter font-semibold">
                {report.ticker}
              </h3>
              <p className="text-xs text-slate-500">
                {report.exchange} · {report.companyName}
              </p>
            </div>
          </div>

          <div className={`px-3 py-1 rounded-full text-sm font-montserrat font-bold ${getRecommendationBgColor(report.recommendation)} ${getRecommendationColor(report.recommendation)}`}>
            {report.recommendation}
          </div>
        </div>

        {/* Score Display */}
        <div className="flex items-center gap-4 mb-4 p-3 bg-slate-800/50 rounded-xl">
          <div className="flex-1">
            <p className="text-xs text-slate-500 mb-1">Overall Score</p>
            <div className="flex items-center gap-2">
              <span className={`text-3xl font-mono font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {report.overallScore}
              </span>
              <span className="text-sm text-slate-400">/100</span>
            </div>
          </div>
          <div className="w-16 h-16 relative">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={isPositive ? '#10b981' : '#ef4444'}
                strokeWidth="3"
                strokeDasharray={`${report.overallScore}, 100`}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Analysis Status */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { label: 'Fundamental', value: report.reports.fundamental ? '✓' : '○', complete: !!report.reports.fundamental },
            { label: 'Quantitative', value: report.reports.quantitative ? '✓' : '○', complete: !!report.reports.quantitative },
            { label: 'Sentiment', value: report.reports.sentiment ? '✓' : '○', complete: !!report.reports.sentiment },
            { label: 'Strategic', value: report.reports.strategic ? '✓' : '○', complete: !!report.reports.strategic },
          ].map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                item.complete ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800/50 text-slate-500'
              }`}
            >
              <span className="text-sm">{item.value}</span>
              <span className="text-xs">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Timestamp */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
          <span>Generated: {formatDateTimeIndian(report.generatedAt)}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4 border-t border-white/5">
          <motion.button
            onClick={() => onView(report)}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 font-inter font-medium text-sm rounded-xl hover:from-cyan-500/30 hover:to-blue-500/30 transition-colors border border-cyan-500/30"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            View Report
          </motion.button>
          <motion.button
            onClick={() => onExport(report)}
            className="px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white font-inter font-medium text-sm rounded-xl transition-colors border border-white/5"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </motion.button>
          <motion.button
            onClick={() => onDelete(report.id)}
            className="px-4 py-2 bg-slate-800/50 hover:bg-red-500/20 text-slate-400 hover:text-red-400 font-inter font-medium text-sm rounded-xl transition-colors border border-white/5"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Report Detail View Modal
const ReportDetailModal: React.FC<{
  report: PortfolioReport | null;
  isOpen: boolean;
  onClose: () => void;
  onExport: (report: PortfolioReport) => void;
}> = ({ report, isOpen, onClose, onExport }) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'fundamental' | 'quantitative' | 'sentiment' | 'strategic' | 'verdict'>('overview');

  if (!report || !isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-5xl max-h-[90vh] bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center">
                <span className="text-lg font-mono font-bold text-cyan-400">
                  {report.ticker}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-montserrat font-bold text-white">
                  {report.companyName}
                </h2>
                <p className="text-sm text-slate-400">
                  Generated on {formatDateTimeIndian(report.generatedAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => onExport(report)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.02 }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </motion.button>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-slate-800/50 hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 py-3 border-b border-white/5 flex items-center gap-2 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'fundamental', label: 'Fundamental' },
              { id: 'quantitative', label: 'Quantitative' },
              { id: 'sentiment', label: 'Sentiment' },
              { id: 'strategic', label: 'Strategic' },
              { id: 'verdict', label: 'Power Verdict' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as typeof activeSection)}
                className={`px-4 py-2 rounded-lg text-sm font-inter font-medium transition-all whitespace-nowrap ${
                  activeSection === tab.id
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              {activeSection === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Score Card */}
                  <div className="bg-slate-800/50 rounded-xl border border-white/5 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400 mb-2">Overall Recommendation</p>
                        <p className={`text-4xl font-montserrat font-bold ${getRecommendationColor(report.recommendation)}`}>
                          {report.recommendation}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-5xl font-mono font-bold text-cyan-400">{report.overallScore}</p>
                          <p className="text-sm text-slate-500">/100</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Analysis Status */}
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { label: 'Fundamental', complete: !!report.reports.fundamental, icon: '📊' },
                      { label: 'Quantitative', complete: !!report.reports.quantitative, icon: '📈' },
                      { label: 'Sentiment', complete: !!report.reports.sentiment, icon: '💭' },
                      { label: 'Strategic', complete: !!report.reports.strategic, icon: '⚡' },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`p-4 rounded-xl border ${
                          item.complete
                            ? 'bg-emerald-500/10 border-emerald-500/20'
                            : 'bg-slate-800/30 border-white/5'
                        }`}
                      >
                        <span className="text-2xl mb-2 block">{item.icon}</span>
                        <p className={`font-medium ${item.complete ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {item.label}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {item.complete ? 'Analysis complete' : 'Pending'}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Quick Verdict */}
                  {report.reports.verdict && (
                    <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/20 p-6">
                      <h3 className="text-lg font-montserrat font-semibold text-white mb-3">
                        Quick Verdict
                      </h3>
                      <div
                        className={`inline-block px-4 py-2 rounded-xl ${getRecommendationBgColor(report.reports.verdict.finalRecommendation)} ${getRecommendationColor(report.reports.verdict.finalRecommendation)} font-montserrat font-bold text-lg`}
                      >
                        {report.reports.verdict.finalRecommendation}
                      </div>
                      <p className="text-sm text-slate-400 mt-3">
                        {report.reports.verdict.executiveSummary.slice(0, 300)}...
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {(activeSection === 'fundamental' || activeSection === 'quantitative' || activeSection === 'sentiment' || activeSection === 'strategic') && (
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="prose prose-invert max-w-none"
                >
                  <div className="bg-slate-800/50 rounded-xl border border-white/5 p-6">
                    {activeSection === 'fundamental' && report.reports.fundamental && (
                      <div className="space-y-4">
                        <h3 className="text-xl font-montserrat font-bold text-white">Fundamental Analysis</h3>
                        <div className="grid grid-cols-4 gap-4">
                          <div className="bg-slate-900/50 p-3 rounded-lg">
                            <p className="text-xs text-slate-500">P/E Ratio</p>
                            <p className="text-lg font-mono font-bold text-white">{(report.reports.fundamental as any).ratios?.peRatio || 'N/A'}</p>
                          </div>
                          <div className="bg-slate-900/50 p-3 rounded-lg">
                            <p className="text-xs text-slate-500">ROE</p>
                            <p className="text-lg font-mono font-bold text-emerald-400">{(report.reports.fundamental as any).ratios?.roe || 'N/A'}%</p>
                          </div>
                          <div className="bg-slate-900/50 p-3 rounded-lg">
                            <p className="text-xs text-slate-500">Net Profit</p>
                            <p className="text-lg font-mono font-bold text-white">{(report.reports.fundamental as any).profitability?.netProfit || 'N/A'}</p>
                          </div>
                          <div className="bg-slate-900/50 p-3 rounded-lg">
                            <p className="text-xs text-slate-500">Recommendation</p>
                            <p className={`text-lg font-bold ${getRecommendationColor((report.reports.fundamental as any).recommendation)}`}>
                              {(report.reports.fundamental as any).recommendation || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm text-slate-400 whitespace-pre-wrap">
                          {(report.reports.fundamental as any).narrative || 'Analysis data available in full report.'}
                        </div>
                      </div>
                    )}
                    {activeSection === 'quantitative' && report.reports.quantitative && (
                      <div className="space-y-4">
                        <h3 className="text-xl font-montserrat font-bold text-white">Quantitative Analysis</h3>
                        <div className="grid grid-cols-4 gap-4">
                          <div className="bg-slate-900/50 p-3 rounded-lg">
                            <p className="text-xs text-slate-500">RSI</p>
                            <p className="text-lg font-mono font-bold text-white">{(report.reports.quantitative as any).technicalIndicators?.rsi || 'N/A'}</p>
                          </div>
                          <div className="bg-slate-900/50 p-3 rounded-lg">
                            <p className="text-xs text-slate-500">Signal</p>
                            <p className={`text-lg font-bold ${getRecommendationColor((report.reports.quantitative as any).signals?.primarySignal)}`}>
                              {(report.reports.quantitative as any).signals?.primarySignal || 'N/A'}
                            </p>
                          </div>
                          <div className="bg-slate-900/50 p-3 rounded-lg">
                            <p className="text-xs text-slate-500">Win Rate</p>
                            <p className="text-lg font-mono font-bold text-cyan-400">{(report.reports.quantitative as any).probabilityModels?.winRate || 'N/A'}%</p>
                          </div>
                          <div className="bg-slate-900/50 p-3 rounded-lg">
                            <p className="text-xs text-slate-500">Risk/Reward</p>
                            <p className="text-lg font-mono font-bold text-white">1:{(report.reports.quantitative as any).probabilityModels?.riskRewardRatio || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {activeSection === 'sentiment' && report.reports.sentiment && (
                      <div className="space-y-4">
                        <h3 className="text-xl font-montserrat font-bold text-white">Sentiment Analysis</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-900/50 p-4 rounded-lg">
                            <p className="text-xs text-slate-500 mb-2">Overall Sentiment</p>
                            <p className={`text-2xl font-mono font-bold ${getRecommendationColor((report.reports.sentiment as any).overallSentiment?.label)}`}>
                              {(report.reports.sentiment as any).overallSentiment?.label || 'N/A'}
                            </p>
                            <p className="text-sm text-slate-400 mt-1">
                              Score: {((report.reports.sentiment as any).overallSentiment?.score || 0).toFixed(2)}
                            </p>
                          </div>
                          <div className="bg-slate-900/50 p-4 rounded-lg">
                            <p className="text-xs text-slate-500 mb-2">Trend</p>
                            <p className="text-xl font-mono font-bold text-white capitalize">
                              {(report.reports.sentiment as any).overallSentiment?.trend || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    {activeSection === 'strategic' && report.reports.strategic && (
                      <div className="space-y-4">
                        <h3 className="text-xl font-montserrat font-bold text-white">Strategic Analysis</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-900/50 p-4 rounded-lg">
                            <p className="text-xs text-slate-500 mb-2">FII Net Flow</p>
                            <p className="text-xl font-mono font-bold text-emerald-400">
                              ₹{(report.reports.strategic as any).fnoAnalysis?.institutionalActivity?.fiiNetBuy || 'N/A'} Cr
                            </p>
                          </div>
                          <div className="bg-slate-900/50 p-4 rounded-lg">
                            <p className="text-xs text-slate-500 mb-2">PCR Ratio</p>
                            <p className="text-xl font-mono font-bold text-white">
                              {(report.reports.strategic as any).fnoAnalysis?.openInterest?.pcrRatio || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="bg-slate-900/50 p-4 rounded-lg">
                          <p className="text-xs text-slate-500 mb-2">Institutional Verdict</p>
                          <p className="text-xl font-montserrat font-bold text-cyan-400">
                            {(report.reports.strategic as any).institutionalVerdict || 'N/A'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeSection === 'verdict' && report.reports.verdict && (
                <motion.div
                  key="verdict"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="prose prose-invert max-w-none"
                >
                  <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/20 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-montserrat font-bold text-white">
                        Power Verdict
                      </h3>
                      <div className={`px-6 py-3 rounded-xl ${getRecommendationBgColor((report.reports.verdict as any).finalRecommendation)} border`}>
                        <p className={`text-2xl font-montserrat font-bold ${getRecommendationColor((report.reports.verdict as any).finalRecommendation)}`}>
                          {(report.reports.verdict as any).finalRecommendation}
                        </p>
                      </div>
                    </div>
                    <div className="prose prose-invert prose-headings:text-white prose-p:text-slate-300 prose-headings:font-montserrat">
                      <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                      >
                        {(report.reports.verdict as any).executiveSummary}
                      </ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Main Paper Portfolio Component
const PaperPortfolio: React.FC = () => {
  const { reports, setReports, addReport, removeReport } = usePaperPortfolioStore();
  const { powerVerdict, fundamentalAnalysis, currentTicker, currentExchange } = useStockIntelligenceStore();
  const [selectedReport, setSelectedReport] = useState<PortfolioReport | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch reports from API
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch('/api/portfolio?userId=demo-user-001');
        const data = await res.json();
        if (data.reports) {
          const mapped = data.reports.map((r: any) => ({
            id: r.id,
            userId: r.userId || 'demo-user-001',
            ticker: r.ticker,
            companyName: r.company_name || r.companyName,
            exchange: r.exchange as 'NSE' | 'BSE',
            generatedAt: r.generatedAt,
            reports: {
              fundamental: null,
              quantitative: null,
              sentiment: null,
              strategic: null,
              verdict: r.analysis?.verdict ? {
                ticker: r.ticker,
                companyName: r.company_name || r.companyName,
                verdictDate: r.generatedAt,
                executiveSummary: r.analysis.verdict,
                signalSynthesis: { fundamental: r.recommendation, quantitative: r.recommendation, sentiment: r.recommendation, strategic: r.recommendation },
              } : null,
            },
            overallScore: r.overallScore,
            recommendation: r.recommendation as 'Buy' | 'Hold' | 'Sell',
          }));
          setReports(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [setReports]);

  // Save report to API when verdict is available
  useEffect(() => {
    if (powerVerdict && currentTicker) {
      const saveReport = async () => {
        try {
          await fetch('/api/portfolio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: 'demo-user-001',
              ticker: currentTicker,
              companyName: powerVerdict.companyName || currentTicker,
              exchange: currentExchange || 'NSE',
              price: 0,
              change: 0,
              changePercent: 0,
              analysis: {
                fundamental: fundamentalAnalysis?.narrative,
                verdict: powerVerdict.executiveSummary,
              },
              recommendation: powerVerdict.signalSynthesis?.fundamental || 'Hold',
              overallScore: powerVerdict.signalSynthesis?.fundamental === 'Buy' ? 75 : powerVerdict.signalSynthesis?.fundamental === 'Sell' ? 35 : 50,
            }),
          });
          // Refresh reports
          const res = await fetch('/api/portfolio?userId=demo-user-001');
          const data = await res.json();
          if (data.reports) {
            const mapped = data.reports.map((r: any) => ({
              id: r.id,
              userId: r.userId || 'demo-user-001',
              ticker: r.ticker,
              companyName: r.company_name || r.companyName,
              exchange: r.exchange as 'NSE' | 'BSE',
              generatedAt: r.generatedAt,
              reports: {
                fundamental: null,
                quantitative: null,
                sentiment: null,
                strategic: null,
                verdict: r.analysis?.verdict ? {
                  ticker: r.ticker,
                  companyName: r.company_name || r.companyName,
                  verdictDate: r.generatedAt,
                  executiveSummary: r.analysis.verdict,
                  signalSynthesis: { fundamental: r.recommendation, quantitative: r.recommendation, sentiment: r.recommendation, strategic: r.recommendation },
                } : null,
              },
              overallScore: r.overallScore,
              recommendation: r.recommendation as 'Buy' | 'Hold' | 'Sell',
            }));
            setReports(mapped);
          }
        } catch (err) {
          console.error('Failed to save report:', err);
        }
      };
      saveReport();
    }
  }, [powerVerdict, currentTicker, currentExchange, fundamentalAnalysis, setReports]);

  // Initialize with sample reports only if no saved reports
  useEffect(() => {
    if (!loading && reports.length === 0) {
      setReports([
        {
          id: generateId('report-'),
          userId: 'demo-user',
          ticker: 'RELIANCE',
          companyName: 'Reliance Industries Ltd',
          exchange: 'NSE',
          generatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          reports: {
            fundamental: {
              ticker: 'RELIANCE',
              companyName: 'Reliance Industries Ltd',
              analysisDate: new Date().toISOString(),
              sector: 'Energy',
              industry: 'Oil & Gas',
              revenue: { quarterly: 234567, yearly: 987654, yoyGrowth: 18.5, QoQGrowth: 4.2 },
              profitability: { operatingProfit: 45678, netProfit: 34567, ebitda: 56789, grossMargin: 32.5 },
              balanceSheet: { totalAssets: 4567890, totalLiabilities: 2345678, netWorth: 2222212, reservesAndSurplus: 1987654 },
              cashFlow: { operatingCashFlow: 67890, investingCashFlow: -23456, financingCashFlow: -12345, freeCashFlow: 44444 },
              ratios: { peRatio: 28.5, pbRatio: 3.2, roe: 24.5, debtToEquity: 0.65, currentRatio: 1.45, quickRatio: 1.12, operatingMargin: 18.5, netMargin: 14.2, dividendYield: 0.35, eps: 100.25 },
              valuationSignals: { isOvervalued: false, isUndervalued: true, fairValue: 2950, marginOfSafety: 15, riskSignals: [] },
              narrative: '## Fundamental Analysis: RELIANCE\n\nStrong fundamental characteristics with robust revenue growth...',
              recommendation: 'Buy',
              confidenceScore: 78,
            },
            quantitative: null,
            sentiment: null,
            strategic: null,
            verdict: {
              ticker: 'RELIANCE',
              companyName: 'Reliance Industries Ltd',
              verdictDate: new Date().toISOString(),
              executiveSummary: '## Power Verdict: RELIANCE\n\n**STRONG BUY** recommendation based on comprehensive analysis...',
              signalSynthesis: { fundamental: 'Buy', quantitative: 'bullish', sentiment: 'Positive', strategic: 'Accumulate' },
              consolidatedScore: 78,
              finalRecommendation: 'STRONG BUY',
              keyBullishFactors: ['Diversified business model', 'Strong institutional support'],
              keyBearishFactors: ['Commodity price exposure'],
              riskFactors: ['Interest rate sensitivity'],
              targetPrices: { threeMonth: 3050, sixMonth: 3250, twelveMonth: 3600 },
              conflictResolution: 'All dimensions converge on bullish outlook.',
              verifiiableDataSources: [],
              disclaimer: 'For informational purposes only.',
            },
          },
          overallScore: 78,
          recommendation: 'STRONG BUY',
        },
        {
          id: generateId('report-'),
          userId: 'demo-user',
          ticker: 'TCS',
          companyName: 'Tata Consultancy Services',
          exchange: 'NSE',
          generatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          reports: {
            fundamental: null,
            quantitative: null,
            sentiment: null,
            strategic: null,
            verdict: null,
          },
          overallScore: 72,
          recommendation: 'BUY',
        },
        {
          id: generateId('report-'),
          userId: 'demo-user',
          ticker: 'HDFCBANK',
          companyName: 'HDFC Bank Ltd',
          exchange: 'NSE',
          generatedAt: new Date(Date.now() - 86400000).toISOString(),
          reports: {
            fundamental: null,
            quantitative: null,
            sentiment: null,
            strategic: null,
            verdict: null,
          },
          overallScore: 65,
          recommendation: 'HOLD',
        },
      ]);
    }
  }, []);

  const handleViewReport = useCallback((report: PortfolioReport) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  }, []);

  const handleDeleteReport = useCallback(async (id: string) => {
    const ticker = id.split('-')[0];
    try {
      await fetch(`/api/portfolio?ticker=${ticker}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete from API:', err);
    }
    removeReport(id);
  }, [removeReport]);

  const handleExportReport = useCallback((report: PortfolioReport) => {
    let content = `# Trading Rocket - Stock Intelligence Report\n\n`;
    content += `Ticker: ${report.ticker}\n`;
    content += `Company: ${report.companyName}\n`;
    content += `Exchange: ${report.exchange}\n`;
    content += `Generated: ${formatDateTimeIndian(report.generatedAt)}\n\n`;
    content += `---\n\n`;
    content += `## Recommendation: ${report.recommendation}\n`;
    content += `Overall Score: ${report.overallScore}/100\n\n`;
    
    if (report.reports.verdict) {
      content += `## Power Verdict\n\n`;
      content += (report.reports.verdict as any).executiveSummary || 'Verdict summary available.';
    }

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.ticker}_Portfolio_Report.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-montserrat font-bold text-white">
            Paper Portfolio
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            AI-generated stock intelligence reports for your watchlist
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-slate-800/50 rounded-xl border border-white/5">
            <p className="text-sm text-slate-400">Total Reports</p>
            <p className="text-xl font-mono font-bold text-white">{reports.length}</p>
          </div>
        </div>
      </motion.div>

      {/* Portfolio Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-white/5 p-4">
          <p className="text-sm text-slate-500">Strong Buy</p>
          <p className="text-2xl font-mono font-bold text-emerald-400">
            {reports.filter((r) => r.recommendation === 'STRONG BUY').length}
          </p>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-white/5 p-4">
          <p className="text-sm text-slate-500">Buy</p>
          <p className="text-2xl font-mono font-bold text-emerald-300">
            {reports.filter((r) => r.recommendation === 'BUY').length}
          </p>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-white/5 p-4">
          <p className="text-sm text-slate-500">Hold</p>
          <p className="text-2xl font-mono font-bold text-yellow-400">
            {reports.filter((r) => r.recommendation === 'HOLD').length}
          </p>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-white/5 p-4">
          <p className="text-sm text-slate-500">Avg. Score</p>
          <p className="text-2xl font-mono font-bold text-cyan-400">
            {reports.length > 0 ? Math.round(reports.reduce((acc, r) => acc + r.overallScore, 0) / reports.length) : 0}
          </p>
        </div>
      </motion.div>

      {/* Reports Grid */}
      {reports.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {reports.map((report, index) => (
            <ReportCard
              key={report.id}
              report={report}
              index={index}
              onView={handleViewReport}
              onDelete={handleDeleteReport}
              onExport={handleExportReport}
            />
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/5"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h3 className="text-xl font-montserrat font-bold text-white mb-2">
            No reports yet
          </h3>
          <p className="text-slate-400 text-center max-w-md">
            Generate stock intelligence reports from the Stock Intelligence module and they will appear here.
          </p>
        </motion.div>
      )}

      {/* Report Detail Modal */}
      <ReportDetailModal
        report={selectedReport}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onExport={handleExportReport}
      />
    </div>
  );
};

export default PaperPortfolio;
