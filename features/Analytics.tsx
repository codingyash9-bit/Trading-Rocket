'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import NeuralBackground from '@/components/NeuralBackground';
import PageTransition from '@/components/PageTransition';
import { ResponsiveContainer, Tooltip, Area, AreaChart, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';

const COLORS = {
  accent: '#22d3ee',
  positive: '#22c55e',
  negative: '#f04d6b',
};

function buildHistory(ipoPrice: number, cmp: number, fromYear: number) {
  const now = new Date();
  const months = (now.getFullYear() - fromYear) * 12 + now.getMonth();
  const pts = [];
  const labels = [];
  let val = ipoPrice;
  const totalGrowth = Math.log(cmp / ipoPrice);
  for (let i = 0; i <= months; i++) {
    const t = i / months;
    const target = ipoPrice * Math.exp(totalGrowth * t);
    val = val * 0.85 + target * 0.15;
    val *= (1 + (Math.random() - 0.49) * 0.055);
    if (val < ipoPrice * 0.3) val = ipoPrice * 0.3;
    pts.push(Math.round(val * 100) / 100);
    labels.push(i % 12 === 0 ? String(fromYear + Math.floor(i / 12)) : "");
  }
  pts[pts.length - 1] = cmp;
  return { pts, labels };
}

async function fetchAnalysis(query: string) {
  try {
    const res = await fetch(`/api/analytics/fetch?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.ipoPrice && data.listedYear) {
        return data;
      }
    }
  } catch (error) {
    console.error('API Error, falling back to mock:', error);
  }

  // Fallback to mock data if API fails
  const { getMockStockAnalysis } = await import('@/lib/gemini');
  return getMockStockAnalysis(query);
}

function SearchView({ onSearch }: { onSearch: (query: string) => void }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const chips = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'NIFTY', 'GOLD'];
  
  const handleChipClick = (chip: string) => {
    console.log('Search chip clicked:', chip);
    onSearch(chip);
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-4 text-center">
      <button 
        onClick={() => router.push('/features')}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-200"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-sm font-medium">Back</span>
      </button>

      <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent mb-3">
        Stock Analytics
      </h1>
      <p className="text-slate-400 text-lg mb-8">AI-Powered Market Intelligence</p>
      
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch(query)}
        placeholder="Search Indian stocks, indices or commodities..."
        className="w-full max-w-lg px-6 py-4 rounded-xl text-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-cyan-500/50 outline-none transition-all"
      />
      
      <div className="flex flex-wrap gap-3 mt-6 max-w-lg justify-center">
        {chips.map((chip) => (
          <button 
            key={chip} 
            onClick={() => handleChipClick(chip)}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all"
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full animate-pulse bg-cyan-400"></span>
        <span className="w-2 h-2 rounded-full animate-pulse bg-purple-500" style={{ animationDelay: '0.15s' }}></span>
        <span className="w-2 h-2 rounded-full animate-pulse bg-blue-500" style={{ animationDelay: '0.3s' }}></span>
      </div>
      <p className="text-slate-400 text-sm">Fetching market data...</p>
    </div>
  );
}

function ResultView({ data, onBack, onSearch }: { data: any; onBack: () => void; onSearch: (q: string) => void }) {
  const [query, setQuery] = useState('');
  const [range, setRange] = useState('ALL');
  
  const isPositive = data?.change >= 0;
  const chartColor = isPositive ? COLORS.positive : COLORS.negative;
  
  const { pts, labels } = buildHistory(data?.ipoPrice || 100, data?.cmp || 1000, data?.listedYear || 2010);
  
  const getFiltered = () => {
    const len = range === 'ALL' ? pts.length : range === '10Y' ? 120 : range === '5Y' ? 60 : 12;
    const start = Math.max(0, pts.length - len);
    return { pts: pts.slice(start), labels: labels.slice(start) };
  };
  
  const filtered = getFiltered();
  const chartData = filtered.labels.map((y, i) => ({ year: y, price: filtered.pts[i] }));
  
  const ranges = ['ALL', '10Y', '5Y', '1Y'];
  
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back
      </button>
      
      <input 
        type="text" 
        value={query} 
        onChange={(e) => setQuery(e.target.value)} 
        onKeyDown={(e) => {
          if (e.key === 'Enter' && query) {
            onSearch(query);
            setQuery('');
          }
        }}
        placeholder="Search more stocks..." 
        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-cyan-500/50 outline-none transition-all" 
      />
      
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-3 flex-wrap mb-3">
          <h2 className="text-2xl font-bold text-white">{data?.name}</h2>
          <span className="px-2 py-0.5 rounded text-xs bg-cyan-500/20 text-cyan-400">{data?.exchange}</span>
          <span className="px-2 py-0.5 rounded text-xs bg-purple-500/20 text-purple-400">{data?.sector}</span>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-mono font-bold text-white">₹{data?.cmp}</span>
          <span className="text-lg font-mono" style={{ color: isPositive ? COLORS.positive : COLORS.negative }}>
            {isPositive ? '+' : ''}{data?.change} ({data?.changePct}%)
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(data?.kpis || {}).map(([k, v]) => (
          <div key={k} className="p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-slate-400">{k}</p>
            <p className="text-sm font-mono text-white">{String(v)}</p>
          </div>
        ))}
      </div>
      
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex gap-2 mb-3">
          {ranges.map(r => (
            <button key={r} onClick={() => setRange(r)} className="px-3 py-1 rounded-lg text-xs" style={{ backgroundColor: range === r ? COLORS.accent : 'transparent', color: range === r ? '#000' : '#888' }}>
              {r}
            </button>
          ))}
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="year" tick={{ fill: '#888', fontSize: 10 }} axisLine={{ stroke: '#333' }} tickLine={false} />
              <YAxis tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => '₹' + v} domain={['auto', 'auto']} width={60} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #444', borderRadius: '8px', padding: '8px' }}
                labelStyle={{ color: '#fff', fontWeight: 'bold', marginBottom: '4px' }}
                itemStyle={{ color: chartColor, padding: '2px 0' }}
                formatter={(value) => [`₹${Number(value).toFixed(2)}`, 'Price']}
                cursor={{ stroke: chartColor, strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              <Area type="monotone" dataKey="price" stroke={chartColor} fill="url(#g)" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: chartColor }} />
              <ReferenceLine y={data?.cmp} stroke={chartColor} strokeDasharray="5 5" strokeOpacity={0.5} label={{ value: `₹${data?.cmp}`, fill: chartColor, fontSize: 10, position: 'right' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
        <p className="text-xs text-slate-400 mb-1">Current Price</p>
        <p className="text-lg font-mono font-bold" style={{ color: chartColor }}>₹{data?.cmp} {data?.change >= 0 ? '+' : ''}{data?.change} ({data?.changePct}%)</p>
      </div>
      
      {data?.companyDetails && (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-sm font-medium text-cyan-400 mb-3">Company Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {data.companyDetails.headquarters && (
              <div><p className="text-xs text-slate-400">Headquarters</p><p className="text-sm text-white">{data.companyDetails.headquarters}</p></div>
            )}
            {data.companyDetails.ceo && (
              <div><p className="text-xs text-slate-400">CEO/MD</p><p className="text-sm text-white">{data.companyDetails.ceo}</p></div>
            )}
            {data.companyDetails.founded && (
              <div><p className="text-xs text-slate-400">Founded</p><p className="text-sm text-white">{data.companyDetails.founded}</p></div>
            )}
            {data.companyDetails.employees && (
              <div><p className="text-xs text-slate-400">Employees</p><p className="text-sm text-white">{data.companyDetails.employees}</p></div>
            )}
            {data.companyDetails.website && (
              <div><p className="text-xs text-slate-400">Website</p><p className="text-sm text-cyan-400">{data.companyDetails.website}</p></div>
            )}
          </div>
        </div>
      )}
      
      {data?.financialSummary && (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-sm font-medium text-cyan-400 mb-3">Financial Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {data.financialSummary.revenue && (
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-xs text-slate-400">Revenue (Q4)</p>
                <p className="text-lg font-mono text-white">{data.financialSummary.revenue.q4_2024}</p>
                <p className="text-xs" style={{ color: data.financialSummary.revenue.trend === 'up' ? COLORS.positive : COLORS.negative }}>{data.financialSummary.revenue.yoy} YoY</p>
              </div>
            )}
            {data.financialSummary.profit && (
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-xs text-slate-400">Net Profit (Q4)</p>
                <p className="text-lg font-mono text-white">{data.financialSummary.profit.q4_2024}</p>
                <p className="text-xs" style={{ color: data.financialSummary.profit.trend === 'up' ? COLORS.positive : COLORS.negative }}>{data.financialSummary.profit.yoy} YoY</p>
              </div>
            )}
            {data.financialSummary.margin && (
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-xs text-slate-400">Margins</p>
                <p className="text-sm font-mono text-white">Op: {data.financialSummary.margin.operating || data.financialSummary.margin.npa}</p>
                <p className="text-sm font-mono text-white">Net: {data.financialSummary.margin.net || data.financialSummary.margin.netInterest}</p>
              </div>
            )}
            {data.financialSummary.guidance && (
              <div className="p-3 rounded-lg bg-white/5 col-span-2">
                <p className="text-xs text-slate-400">Management Guidance</p>
                <p className="text-sm text-white">{data.financialSummary.guidance}</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {data?.balanceSheet && (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-sm font-medium text-cyan-400 mb-3">Balance Sheet</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.balanceSheet.assets && (
              <div>
                <p className="text-xs text-slate-400 mb-2">Assets</p>
                <div className="space-y-1">
                  {data.balanceSheet.assets.map((a: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-slate-300">{a[0]}</span>
                      <span className="font-mono text-white">{a[1]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {data.balanceSheet.liabilities && (
              <div>
                <p className="text-xs text-slate-400 mb-2">Liabilities</p>
                <div className="space-y-1">
                  {data.balanceSheet.liabilities.map((a: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-slate-300">{a[0]}</span>
                      <span className="font-mono text-white">{a[1]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {data.balanceSheet.incomeStatement && (
              <div>
                <p className="text-xs text-slate-400 mb-2">Income Statement</p>
                <div className="space-y-1">
                  {data.balanceSheet.incomeStatement.map((a: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-slate-300">{a[0]}</span>
                      <span className="font-mono text-white">{a[1]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {data.balanceSheet.keyRatios && (
              <div>
                <p className="text-xs text-slate-400 mb-2">Key Ratios</p>
                <div className="space-y-1">
                  {data.balanceSheet.keyRatios.map((a: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-slate-300">{a[0]}</span>
                      <span className="font-mono text-white">{a[1]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {data?.news && data.news.length > 0 && (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-sm font-medium text-cyan-400 mb-3">Latest News</h3>
          <div className="space-y-2">
            {data.news.map((n: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: n.sentiment === 'bull' ? COLORS.positive : n.sentiment === 'bear' ? COLORS.negative : '#f59e0b' }}></span>
                <span className="text-xs text-slate-400">{n.date}</span>
                <span className="text-sm text-white flex-1">{n.headline}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {(data?.signals || []).map((s: any, i: number) => (
          <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-slate-400">{s.label}</p>
            <p className="text-sm font-medium" style={{ color: s.type === 'bull' ? COLORS.positive : s.type === 'bear' ? COLORS.negative : '#f59e0b' }}>{s.value}</p>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-sm font-medium text-white mb-3">About</h3>
          <p className="text-sm text-slate-300 leading-relaxed">{data?.about}</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-sm font-medium text-white mb-3">Future Plans</h3>
          <div className="space-y-2">
            {(data?.futurePlans || []).map((p: string, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span className="text-sm text-slate-300">{p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState('idle');
  const [data, setData] = useState(null);
  
  const query = searchParams.get('q');
  
  useEffect(() => {
    if (!query) {
      setState('idle');
      setData(null);
      return;
    }

    console.log('Fetching analysis for:', query);
    setState('loading');
    setData(null); // Clear old data while loading
    
    fetchAnalysis(query)
      .then(result => {
        console.log('Got result:', result);
        setData(result);
        setState('success');
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setState('error');
      });
  }, [query]);
  
  const handleSearch = (q: string) => {
    if (!q || !q.trim()) return;
    router.push(`/analytics?q=${encodeURIComponent(q.trim())}`);
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-4 py-12">
      {!query && <SearchView onSearch={handleSearch} />}
      {query && state === 'loading' && <Loading />}
      {query && state === 'success' && <ResultView data={data} onBack={() => router.push('/analytics')} onSearch={handleSearch} />}
      {query && state === 'error' && (
        <div className="text-center">
          <p className="text-white mb-4">Could not load market data for "{query}"</p>
          <button onClick={() => router.push('/analytics')} className="px-6 py-2 rounded-xl bg-cyan-500 text-black font-bold hover:bg-cyan-400 transition-colors">Back to Search</button>
        </div>
      )}
    </div>
  );
}

export default function Analytics() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#080c14]">
      <NeuralBackground subtle blurred />
      <div className="absolute inset-0 bg-gradient-to-b from-[#080c14]/80 via-[#080c14]/60 to-[#080c14]/90 pointer-events-none z-[1]" />
      
      <main className="relative z-10 w-full h-full overflow-y-auto">
        <PageTransition>
          <Suspense fallback={<Loading />}>
            <AnalyticsContent />
          </Suspense>
        </PageTransition>
      </main>
    </div>
  );
}