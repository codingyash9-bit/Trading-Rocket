'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompanyRadarStore } from '../../store';
import type { TrackedCompany } from '../../types';
import { formatINR, formatPercent, getSentimentColor, getSentimentBgColor, generateId } from '../../utils';

const RadarChart: React.FC<{ data: { dimension: string; value: number; maxValue: number }[]; size?: number }> = ({ data, size = 200 }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const center = size / 2;
  const maxRadius = size / 2 - 40;
  const angleStep = (2 * Math.PI) / data.length;
  const startAngle = -Math.PI / 2;

  const getPoint = (index: number, value: number) => {
    const angle = startAngle + index * angleStep;
    const radius = (value / data[index].maxValue) * maxRadius;
    return { x: center + radius * Math.cos(angle), y: center + radius * Math.sin(angle) };
  };

  return (
    <div style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
        {[0.25, 0.5, 0.75, 1].map(level => (
          <circle key={level} cx={center} cy={center} r={maxRadius * level} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
        ))}
        {data.map((_, i) => {
          const p = getPoint(i, data[i].maxValue);
          return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />;
        })}
        {data.map((item, i) => {
          const p = getPoint(i, item.value);
          return <motion.circle key={item.dimension} cx={p.x} cy={p.y} r={hoveredIndex === i ? 8 : 5} fill="#00d4c8" stroke="#fff" strokeWidth={2} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)} className="cursor-pointer" />;
        })}
      </svg>
    </div>
  );
};

const CompanyCard: React.FC<{ company: TrackedCompany; index: number; onRemove: (ticker: string) => void }> = ({ company, index, onRemove }) => {
  const [showDetails, setShowDetails] = useState(false);
  const isPositive = company.changePercent >= 0;
  const radarData = [
    { dimension: 'Price', value: Math.abs(company.changePercent) * 10, maxValue: 100 },
    { dimension: 'Volume', value: 70, maxValue: 100 },
    { dimension: 'Sentiment', value: (company.sentimentScore + 1) * 50, maxValue: 100 },
    { dimension: 'Momentum', value: isPositive ? 75 : 40, maxValue: 100 },
  ];

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }} className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/5 hover:border-cyan-500/30 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
              <span className="text-sm font-mono font-bold text-cyan-400">{company.ticker.slice(0, 4)}</span>
            </div>
            <div>
              <h3 className="text-white font-semibold">{company.ticker}</h3>
              <p className="text-xs text-slate-500">{company.exchange}</p>
            </div>
          </div>
          <button onClick={() => onRemove(company.ticker)} className="w-8 h-8 rounded-lg bg-slate-800/50 hover:bg-red-500/20 flex items-center justify-center text-slate-400 hover:text-red-400">
            ×
          </button>
        </div>
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-2xl font-mono font-bold text-white">{formatINR(company.lastPrice)}</p>
            <p className={`text-sm font-mono ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>{isPositive ? '+' : ''}{formatINR(company.lastPrice - company.addedPrice)} ({formatPercent(company.changePercent)})</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs ${getSentimentBgColor(company.sentimentScore)} ${getSentimentColor(company.sentimentScore)}`}>{company.sentimentLabel}</div>
        </div>
        <RadarChart data={radarData} size={140} />
        <button onClick={() => setShowDetails(!showDetails)} className="w-full text-left text-sm text-slate-400 mt-4 py-2">Signals ({company.recentSignals.length})</button>
        {showDetails && <div className="space-y-2 mt-2">{company.recentSignals.slice(0, 3).map((s, i) => <div key={i} className="text-xs p-2 bg-slate-800/50 rounded">{s.type}: {s.description}</div>)}</div>}
      </div>
    </motion.div>
  );
};

const AddModal: React.FC<{ open: boolean; close: () => void; add: (c: TrackedCompany) => void }> = ({ open, close, add }) => {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<any>(null);
  const stocks = [{ t: 'RELIANCE', n: 'Reliance', x: 'NSE', p: 2856 }, { t: 'TCS', n: 'TCS', x: 'NSE', p: 4125 }, { t: 'HDFCBANK', n: 'HDFC', x: 'NSE', p: 1723 }];
  const fil = q ? stocks.filter(s => s.t.toLowerCase().includes(q.toLowerCase())) : stocks;
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={close}>
      <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-4">Add Stock</h2>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search..." className="w-full p-3 bg-slate-800 rounded text-white border border-white/10 mb-4" autoFocus />
        <div className="space-y-2 max-h-60 overflow-auto">{fil.map(s => <button key={s.t} onClick={() => setSel(s)} className={`w-full p-3 rounded ${sel?.t === s.t ? 'bg-cyan-500/20 border-cyan-500' : 'bg-slate-800'} text-left`}><span className="text-white">{s.t}</span><span className="text-slate-400 ml-2">{s.n}</span></button>)}</div>
        <div className="flex gap-3 mt-4"><button onClick={close} className="flex-1 p-3 bg-slate-800 text-white rounded">Cancel</button><button onClick={() => sel && add({ id: generateId('c-'), ticker: sel.t, exchange: sel.x, name: sel.n, addedPrice: sel.p, lastPrice: sel.p, changePercent: 0, addedAt: new Date().toISOString(), lastUpdated: new Date().toISOString(), recentSignals: [], sentimentScore: 0, sentimentLabel: 'Neutral', alerts: [] })} disabled={!sel} className="flex-1 p-3 bg-cyan-500 text-white rounded disabled:opacity-50">Add</button></div>
      </div>
    </div>
  );
};

const CompanyRadar = () => {
  const { trackedCompanies, addCompany, removeCompany, setCompanies } = useCompanyRadarStore();
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    if (trackedCompanies.length === 0) setCompanies([
      { id: 'c1', ticker: 'RELIANCE', exchange: 'NSE', name: 'Reliance', addedPrice: 2800, lastPrice: 2856, changePercent: 2, addedAt: new Date().toISOString(), lastUpdated: new Date().toISOString(), recentSignals: [{ type: 'bullish', source: 'Tech', timestamp: new Date().toISOString(), description: 'Golden cross' }], sentimentScore: 0.4, sentimentLabel: 'Positive', alerts: [] },
      { id: 'c2', ticker: 'TCS', exchange: 'NSE', name: 'TCS', addedPrice: 4200, lastPrice: 4125, changePercent: -1.8, addedAt: new Date().toISOString(), lastUpdated: new Date().toISOString(), recentSignals: [], sentimentScore: -0.1, sentimentLabel: 'Neutral', alerts: [] },
    ]);
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between"><h1 className="text-2xl font-bold text-white">Company Radar</h1><button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-cyan-500 text-white rounded">+ Add</button></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-4 rounded"><p className="text-slate-500 text-sm">Total</p><p className="text-2xl font-mono text-white">{trackedCompanies.length}</p></div>
        <div className="bg-slate-900 p-4 rounded"><p className="text-slate-500 text-sm">Change</p><p className="text-2xl font-mono text-emerald-400">{trackedCompanies.length > 0 ? formatPercent(trackedCompanies.reduce((a, c) => a + c.changePercent, 0) / trackedCompanies.length) : '0%'}</p></div>
      </div>
      {trackedCompanies.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{trackedCompanies.map((c, i) => <CompanyCard key={c.id} company={c} index={i} onRemove={removeCompany} />)}</div> : <div className="text-center py-16 text-slate-400">No stocks tracked</div>}
      <AddModal open={showAdd} close={() => setShowAdd(false)} add={addCompany} />
    </div>
  );
};

export default CompanyRadar;