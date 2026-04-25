'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import NeuralBackground from '@/components/NeuralBackground';
import ReactMarkdown from 'react-markdown';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, ReferenceLine, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface Prediction {
  ticker: string;
  direction: 'Bullish' | 'Bearish';
  confidence: number;
  targetRange: string;
  falsification: string;
  dateOpened: string;
}

interface Outcome {
  closingPrice: number;
  actualMove: number;
  days: number;
  movements: { date: string; price: number }[];
}

export default function AutopsyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const [prediction, setPrediction] = useState<Prediction>({
    ticker: 'RELIANCE',
    direction: 'Bullish',
    confidence: 75,
    targetRange: '₹2,950 - ₹3,050',
    falsification: 'Close below ₹2,840',
    dateOpened: '2026-04-10',
  });

  const [outcome, setOutcome] = useState<Outcome>({
    closingPrice: 3012,
    actualMove: 4.2,
    days: 8,
    movements: [
      { date: '2026-04-10', price: 2890 },
      { date: '2026-04-12', price: 2865 },
      { date: '2026-04-15', price: 2940 },
      { date: '2026-04-18', price: 3012 },
    ],
  });

  const runAutopsy = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/autopsy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prediction, outcome }),
      });
      const result = await res.json();
      if (result.success) {
        setReport(result.report);
        setData(result.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#080c14] text-white">
      <NeuralBackground subtle blurred />
      <div className="absolute inset-0 bg-gradient-to-b from-[#080c14]/70 via-[#080c14]/50 to-[#080c14]/80 pointer-events-none z-[1]" />

      <button
        onClick={() => router.push('/features')}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-200"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-sm font-medium">Back</span>
      </button>

      <main className="relative z-10 w-full h-full overflow-y-auto">
        <div className="flex flex-col items-center justify-center min-h-full px-4 py-16">
          {!report ? (
            <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                className="p-6 rounded-xl backdrop-blur-md bg-white/10 border border-white/20"
              >
                <h2 className="text-sm font-medium text-cyan-400 mb-6">Original Signal</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Ticker</label>
                    <input 
                      type="text" 
                      value={prediction.ticker} 
                      onChange={e => setPrediction({...prediction, ticker: e.target.value})} 
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-cyan-500/50 outline-none transition-all" 
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-xs text-slate-400 mb-1 block">Direction</label>
                      <select 
                        value={prediction.direction} 
                        onChange={e => setPrediction({...prediction, direction: e.target.value as any})} 
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-cyan-500/50 outline-none transition-all"
                      >
                        <option>Bullish</option>
                        <option>Bearish</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-slate-400 mb-1 block">Confidence</label>
                      <input 
                        type="number" 
                        value={prediction.confidence} 
                        onChange={e => setPrediction({...prediction, confidence: parseInt(e.target.value)})} 
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-cyan-500/50 outline-none transition-all" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Target Range</label>
                    <input 
                      type="text" 
                      value={prediction.targetRange} 
                      onChange={e => setPrediction({...prediction, targetRange: e.target.value})} 
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-cyan-500/50 outline-none transition-all" 
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Stop Loss</label>
                    <input 
                      type="text" 
                      value={prediction.falsification} 
                      onChange={e => setPrediction({...prediction, falsification: e.target.value})} 
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-cyan-500/50 outline-none transition-all" 
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Date</label>
                    <input 
                      type="date" 
                      value={prediction.dateOpened} 
                      onChange={e => setPrediction({...prediction, dateOpened: e.target.value})} 
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-cyan-500/50 outline-none transition-all" 
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                className="p-6 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 flex flex-col"
              >
                <h2 className="text-sm font-medium text-rose-400 mb-6">Actual Result</h2>
                <div className="space-y-4 flex-1">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Closing Price</label>
                    <input 
                      type="number" 
                      value={outcome.closingPrice} 
                      onChange={e => setOutcome({...outcome, closingPrice: parseFloat(e.target.value)})} 
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-rose-500/50 outline-none transition-all" 
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-xs text-slate-400 mb-1 block">% Move</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        value={outcome.actualMove} 
                        onChange={e => setOutcome({...outcome, actualMove: parseFloat(e.target.value)})} 
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-rose-500/50 outline-none transition-all" 
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-slate-400 mb-1 block">Days</label>
                      <input 
                        type="number" 
                        value={outcome.days} 
                        onChange={e => setOutcome({...outcome, days: parseInt(e.target.value)})} 
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-rose-500/50 outline-none transition-all" 
                      />
                    </div>
                  </div>
                  <div className="mt-auto pt-6 flex flex-col gap-4">
                    <button 
                      onClick={runAutopsy}
                      disabled={loading}
                      className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium text-sm hover:from-cyan-400 hover:to-blue-400 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Analyzing...' : 'Run Analysis'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="p-6 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 relative overflow-hidden"
                >
                  <div className="absolute top-4 right-4">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full border ${data?.verdict === 'CONFIRMED' ? 'border-emerald-500/50 text-emerald-400' : data?.verdict === 'PARTIAL' ? 'border-amber-500/50 text-amber-400' : 'border-rose-500/50 text-rose-400'}`}>
                      {data?.verdict || 'PENDING'}
                    </span>
                  </div>
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{report}</ReactMarkdown>
                  </div>
                  <div className="mt-6 flex justify-center">
                    <button 
                      onClick={() => setReport(null)} 
                      className="px-6 py-2 border border-white/20 rounded-lg text-sm text-slate-400 hover:text-white hover:border-white/40 transition-all"
                    >
                      New Analysis
                    </button>
                  </div>
                </motion.div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 flex flex-col items-center">
                  <span className="text-xs text-slate-400 mb-4">Accuracy Score</span>
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="48" cy="48" r="44" stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="none" />
                      <motion.circle 
                        cx="48" cy="48" r="44" stroke="#22d3ee" strokeWidth="4" fill="none"
                        strokeLinecap="round"
                        strokeDasharray={276.46}
                        initial={{ strokeDashoffset: 276.46 }}
                        animate={{ strokeDashoffset: 276.46 - (data?.score / 100) * 276.46 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </svg>
                    <span className="absolute text-2xl font-bold text-cyan-400">{data?.score || 0}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl backdrop-blur-md bg-white/10 border border-white/20">
                  <h3 className="text-xs text-slate-400 mb-3">Price Path</h3>
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data?.visuals?.envelope?.actualPath || []}>
                        <defs>
                          <linearGradient id="pathGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="date" hide />
                        <YAxis hide />
                        <Area type="monotone" dataKey="price" stroke="#22d3ee" fill="url(#pathGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {data?.visuals?.radar && (
                  <div className="p-4 rounded-xl backdrop-blur-md bg-white/10 border border-white/20">
                    <h3 className="text-xs text-slate-400 mb-3">Bias Analysis</h3>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                          { subject: 'Dir', A: data.visuals.radar.direction },
                          { subject: 'Range', A: data.visuals.radar.range },
                          { subject: 'Time', A: data.visuals.radar.time },
                          { subject: 'Sec', A: data.visuals.radar.sector },
                          { subject: 'Vol', A: data.visuals.radar.volume },
                          { subject: 'Rev', A: data.visuals.radar.reversal },
                        ]}>
                          <PolarGrid stroke="rgba(255,255,255,0.1)" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 8 }} />
                          <Radar dataKey="A" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.3} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}