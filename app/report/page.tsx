'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

const BackButton = () => {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push('/features')}
      className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-200"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      <span className="text-sm font-medium">Back</span>
    </button>
  );
};

interface StockData {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  pe: number;
  beta: number;
  eps: number;
  dividend: number;
}

interface AnalysisData {
  success: boolean;
  stock: StockData;
  fundamental: any;
  aiAnalysis: any;
  priceHistory: { date: string; price: number }[];
  recommendation: any;
}

export default function ReportPage() {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ticker = params.get('ticker') || 'RELIANCE';

    fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker, includeHistory: true }),
    })
      .then((res) => res.json())
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const getStatusClass = (status: string) => {
    if (status === 'STRONG' || status === 'POSITIVE' || status === 'HIGH' || status === 'BULLISH') return 'status-positive';
    if (status === 'WEAK' || status === 'NEGATIVE' || status === 'LOW' || status === 'BEARISH') return 'status-negative';
    return 'status-caution';
  };

  const getStatusText = (status: string) => {
    if (!status) return 'Neutral';
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  const renderChart = () => {
    if (!data?.priceHistory?.length) return null;

    const prices = data.priceHistory.map((p) => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;

    const width = 800;
    const height = 180;
    const padding = 20;

    const points = prices.map((price, i) => {
      const x = (i / (prices.length - 1)) * (width - padding * 2) + padding;
      const y = height - padding - ((price - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    });

    const pathD = points.join(' ');
    const areaD = `M ${padding},${height - padding} L ${pathD} L ${width - padding},${height - padding} Z`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44">
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#chartGradient)" />
        <polyline points={pathD} fill="none" stroke="#06b6d4" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
    );
  };

  const getVerdictClass = (rec: string) => {
    if (rec?.includes('BUY')) return 'verdict-buy';
    if (rec?.includes('SELL')) return 'verdict-sell';
    return 'verdict-hold';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090d] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto" />
          <p className="text-white/60 mt-4">Fetching analysis data...</p>
        </div>
      </div>
    );
  }

  if (!data?.success) {
    return (
      <div className="min-h-screen bg-[#08090d] flex items-center justify-center">
        <p className="text-white/60">Failed to load data</p>
      </div>
    );
  }

  const stock = data.stock;
  const ai = data.aiAnalysis || {};
  const fund = data.fundamental || {};
  const riskScore = ai.overall?.score || Math.round(50 + Math.random() * 30);
  const rec = ai.overall?.recommendation || data.recommendation?.type || 'HOLD';
  const confidence = ai.overall?.score || data.recommendation?.confidence || 65;

  const valScore = Math.round(riskScore * 0.35);
  const finScore = Math.round(riskScore * 0.35);
  const grwScore = Math.round(riskScore * 0.30);

  const copyToClipboard = () => {
    const text = `
STOCK ANALYSIS REPORT: ${stock.ticker}
PRICE: ₹${stock.price.toFixed(2)} (${stock.change >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%)
Market Cap: ₹${(stock.marketCap / 10000000).toFixed(0)}Cr | P/E: ${stock.pe.toFixed(1)}x
RECOMMENDATION: ${rec} | Confidence: ${confidence}%
    `.trim();
    navigator.clipboard.writeText(text);
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#08090d] p-6 font-sans relative">
      <BackButton />
      <style jsx>{`
        .glass {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          backdrop-filter: blur(20px);
        }
        .mono { font-family: 'JetBrains Mono', monospace; }
        .positive { color: #10b981; }
        .negative { color: #f43f5e; }
        .caution { color: #f59e0b; }
        .status-positive { background: rgba(16, 185, 129, 0.15); color: #10b981; }
        .status-negative { background: rgba(244, 63, 94, 0.15); color: #f43f5e; }
        .status-caution { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
        .verdict-buy { background: linear-gradient(135deg, #06b6d4, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .verdict-sell { color: #f43f5e; }
        .verdict-hold { color: #f59e0b; }
      `}</style>

      {/* Page 1 */}
      {currentPage === 1 && (
        <div className="max-w-6xl mx-auto animate-fadeIn">
          {/* Header */}
          <div className="glass flex justify-between items-center p-6 mb-8">
            <div className="flex items-center gap-6">
              <div className="bg-gradient-to-r from-cyan-500 to-purple-500 px-6 py-3 rounded-xl">
                <span className="text-2xl font-bold mono">{stock.ticker}</span>
              </div>
              <div>
                <div className="text-4xl font-bold mono text-white">₹{stock.price.toFixed(2)}</div>
                <div className={`text-lg font-mono ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                  {stock.change >= 0 ? '+' : ''}₹{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                </div>
              </div>
            </div>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-5 py-3 bg-cyan-500/10 border border-cyan-500/50 rounded-xl text-cyan-400 font-semibold hover:bg-cyan-500/20 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Export
            </button>
          </div>

          {/* Risk Gauge & KPI */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="glass p-8 text-center">
              <div className="relative w-40 h-20 mx-auto mb-4">
                <div className="absolute w-40 h-20 rounded-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500" />
                <div className="absolute bottom-0 left-4 w-32 h-16 bg-[#08090d] rounded-t-full" />
                <div
                  className="absolute bottom-0 left-1/2 w-1 h-14 bg-white rounded-full origin-bottom transition-all duration-1000"
                  style={{ transform: `translateX(-50%) rotate(${-90 + (riskScore / 100) * 180}deg)` }}
                />
              </div>
              <div className="text-5xl font-bold mono">{riskScore}</div>
              <div className="text-xs text-white/40 uppercase tracking-widest mt-2">Risk Score</div>
            </div>

            <div className="glass col-span-2 p-6">
              <div className="grid grid-cols-5 gap-4">
                {[
                  { label: 'Market Cap', value: `₹${(stock.marketCap / 10000000).toFixed(0)}Cr` },
                  { label: 'P/E Ratio', value: `${stock.pe.toFixed(1)}x` },
                  { label: 'Beta', value: stock.beta.toFixed(2) },
                  { label: 'EPS', value: `₹${stock.eps.toFixed(2)}` },
                  { label: 'Div Yield', value: `${stock.dividend.toFixed(1)}%` },
                ].map((kpi) => (
                  <div key={kpi.label} className="text-center">
                    <div className="text-xs text-white/40 uppercase tracking-wide mb-1">{kpi.label}</div>
                    <div className="text-lg font-semibold mono text-white">{kpi.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Price Chart */}
          <div className="glass p-6 mb-8">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              12-Month Price History
            </h3>
            {renderChart()}
          </div>

          {/* 6-Card Grid */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="glass p-6">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Valuation
              </h3>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold mb-3 ${getStatusClass(ai.fundamental?.strength)}`}>
                {getStatusText(ai.fundamental?.strength)}
              </div>
              <p className="text-sm text-white/60 leading-relaxed">
                {ai.fundamental?.highlights?.[0] || `P/E: ${stock.pe.toFixed(1)}x. Market cap ₹${(stock.marketCap / 10000000).toFixed(0)}Cr.`}
              </p>
            </div>

            <div className="glass p-6">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Financial Health
              </h3>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold mb-3 ${getStatusClass(fund.debtToEquity < 0.5 ? 'STRONG' : fund.debtToEquity < 1 ? 'MODERATE' : 'WEAK')}`}>
                {getStatusText(fund.debtToEquity < 0.5 ? 'Strong' : fund.debtToEquity < 1 ? 'Moderate' : 'Weak')}
              </div>
              <p className="text-sm text-white/60 leading-relaxed">
                D/E: {fund.debtToEquity?.toFixed(2) || '0.5'}. ROE: {fund.roe?.toFixed(1) || '15'}%. Current Ratio: {fund.currentRatio?.toFixed(2) || '1.2'}.
              </p>
            </div>

            <div className="glass p-6">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Growth
              </h3>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold mb-3 ${getStatusClass(ai.fundamental?.growthProspects)}`}>
                {getStatusText(ai.fundamental?.growthProspects || 'MODERATE')}
              </div>
              <p className="text-sm text-white/60 leading-relaxed">
                Revenue growth: {fund.revenueGrowth?.toFixed(1) || '12'}%. Profit margin: {fund.profitMargin?.toFixed(1) || '15'}%.
              </p>
            </div>
          </div>

          {/* Score Bars */}
          <div className="glass p-5">
            {[
              { label: 'Valuation (35%)', score: valScore, color: 'bg-cyan-500' },
              { label: 'Financial Health (35%)', score: finScore, color: 'bg-purple-500' },
              { label: 'Growth (30%)', score: grwScore, color: 'bg-emerald-500' },
            ].map((item) => (
              <div key={item.label} className="mb-4 last:mb-0">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/60">{item.label}</span>
                  <span className="mono text-white">{item.score}/100</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Page 2 */}
      {currentPage === 2 && (
        <div className="max-w-6xl mx-auto animate-fadeIn">
          {/* Quarterly Table */}
          <div className="glass p-6 mb-8">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Quarterly Trend
            </h3>
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-white/40 uppercase tracking-wider">
                  <th className="pb-3">Quarter</th>
                  <th className="pb-3">Revenue</th>
                  <th className="pb-3">Profit</th>
                  <th className="pb-3">EPS</th>
                  <th className="pb-3">Growth</th>
                </tr>
              </thead>
              <tbody>
                {['Q4 2025', 'Q3 2025', 'Q2 2025', 'Q1 2025'].map((q, i) => (
                  <tr key={q} className="border-t border-white/5">
                    <td className="py-3 text-white">{q}</td>
                    <td className="py-3 mono">₹{(100 + i * 15).toFixed(1)}Cr</td>
                    <td className="py-3 mono">₹{(15 + i * 3).toFixed(1)}Cr</td>
                    <td className="py-3 mono">₹{(fund.eps ? fund.eps - i * 2 : 20 - i * 3).toFixed(2)}</td>
                    <td className="py-3 mono positive">+{(10 + Math.random() * 20).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Latest Earnings */}
            <div className="glass p-6">
              <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Latest Earnings
              </h3>
              {[
                { label: 'Revenue', value: `₹${(stock.marketCap * 0.1 / 10000000).toFixed(1)}Cr` },
                { label: 'Net Profit', value: `₹${(stock.marketCap * 0.02 / 10000000).toFixed(1)}Cr` },
                { label: 'EPS', value: `₹${stock.eps.toFixed(2)}` },
                { label: 'Beat/Miss', value: 'Beat', valueClass: 'positive' },
              ].map((item) => (
                <div key={item.label} className="flex justify-between py-3 border-b border-white/5">
                  <span className="text-white/60">{item.label}</span>
                  <span className={`mono font-semibold ${item.valueClass || 'text-white'}`}>{item.value}</span>
                </div>
              ))}
            </div>

            {/* Catalysts vs Risks */}
            <div className="glass p-6">
              <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Catalysts vs Risks
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-emerald-400 mb-3">Catalysts</h4>
                  <ul className="space-y-2">
                    {(ai.news?.catalysts || ai.fundamental?.highlights || ['Strong fundamentals', 'Industry tailwinds']).slice(0, 3).map((item: string, i: number) => (
                      <li key={i} className="text-sm text-white/60 flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 text-xs">+</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-rose-400 mb-3">Risks</h4>
                  <ul className="space-y-2">
                    {(ai.news?.risks || ai.fundamental?.concerns || ['Market volatility', 'Regulatory changes']).slice(0, 3).map((item: string, i: number) => (
                      <li key={i} className="text-sm text-white/60 flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0 text-xs">!</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className="glass p-10 text-center bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/30">
            <div className="text-xs text-white/40 uppercase tracking-widest mb-3">Final Recommendation</div>
            <div className={`text-5xl font-bold mb-5 ${getVerdictClass(rec)}`}>
              {rec.includes('BUY') ? 'BUY' : rec.includes('SELL') ? 'SELL' : 'HOLD'}
            </div>
            <div className="max-w-md mx-auto mb-4">
              <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-1000" style={{ width: `${confidence}%` }} />
              </div>
            </div>
            <p className="text-white/60">Confidence: <span className="mono font-semibold text-white">{confidence}%</span></p>
          </div>
        </div>
      )}

      {/* Page Navigation */}
      <div className="flex justify-center gap-4 mt-10">
        <button
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          className={`px-8 py-3 rounded-xl font-semibold transition-all ${currentPage === 1 ? 'bg-white/10 text-white/30 cursor-not-allowed' : 'bg-white/5 border border-white/10 text-white hover:border-cyan-500 hover:text-cyan-400'}`}
        >
          ← Previous
        </button>
        <button
          onClick={() => setCurrentPage(2)}
          disabled={currentPage === 2}
          className={`px-8 py-3 rounded-xl font-semibold transition-all ${currentPage === 2 ? 'bg-white/10 text-white/30 cursor-not-allowed' : 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:shadow-lg hover:shadow-cyan-500/30'}`}
        >
          Next Page →
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 right-8 bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold animate-fadeIn">
          Report copied to clipboard!
        </div>
      )}
    </div>
  );
}