'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Legend,
} from 'recharts';

interface ChartProjectionProps {
  currentPrice: number;
  trend: string;
  confidenceScore: number;
  entryZone: [number, number];
  stopLoss: number;
  targets: number[];
}

interface ProjectionData {
  day: number;
  price: number;
  upperBound: number;
  lowerBound: number;
}

function generateProjection(
  currentPrice: number,
  trend: string,
  confidenceScore: number,
  stopLoss: number,
  targets: number[]
): ProjectionData[] {
  const days = 30;
  const data: ProjectionData[] = [];
  
  const confidenceFactor = confidenceScore / 100;
  const volatility = 1 - confidenceFactor * 0.5;
  
  let price = currentPrice;
  const target = targets[0] || currentPrice * 1.15;
  const stepsToTarget = days;
  
  const trendMultiplier = trend.toLowerCase() === 'bullish' ? 1 : 
                          trend.toLowerCase() === 'bearish' ? -1 : 0;
  
  const baseMove = trendMultiplier * ((target - currentPrice) / stepsToTarget);
  
  for (let i = 0; i <= days; i++) {
    let projectedPrice: number;
    
    if (trend.toLowerCase() === 'sideways') {
      const oscillation = Math.sin(i / 3) * currentPrice * 0.02 * volatility;
      const noise = (Math.random() - 0.5) * currentPrice * 0.01 * volatility;
      projectedPrice = currentPrice + oscillation + noise;
    } else {
      const progress = i / stepsToTarget;
      const curveFactor = Math.sin(progress * Math.PI / 2);
      const trendMove = baseMove * curveFactor * (1 + i * 0.02);
      const pullback = trendMultiplier > 0 
        ? -Math.abs(Math.sin(i / 5)) * currentPrice * 0.015 * volatility
        : Math.abs(Math.sin(i / 5)) * currentPrice * 0.015 * volatility;
      const noise = (Math.random() - 0.5) * currentPrice * 0.008 * volatility;
      projectedPrice = currentPrice + trendMove + pullback + noise;
    }
    
    const bandWidth = currentPrice * (0.05 + (1 - confidenceFactor) * 0.1);
    const upperBound = projectedPrice + bandWidth;
    const lowerBound = projectedPrice - bandWidth;
    
    data.push({
      day: i,
      price: Math.round(projectedPrice),
      upperBound: Math.round(upperBound),
      lowerBound: Math.round(lowerBound),
    });
  }
  
  return data;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: number }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/95 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-4 shadow-2xl shadow-cyan-500/10">
        <p className="text-white/50 text-xs mb-2 font-mono">
          Day {label}
        </p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm font-mono font-semibold" style={{ color: entry.color }}>
            ₹{entry.value?.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ChartProjectionGraph({
  currentPrice,
  trend,
  confidenceScore,
  entryZone,
  stopLoss,
  targets,
}: ChartProjectionProps) {
  const projectionData = generateProjection(currentPrice, trend, confidenceScore, stopLoss, targets);
  
  const trendColor = trend.toLowerCase() === 'bullish' ? '#10b981' :
                     trend.toLowerCase() === 'bearish' ? '#f43f5e' : '#f59e0b';
  
  const minPrice = Math.min(...projectionData.map(d => d.lowerBound), stopLoss * 0.95);
  const maxPrice = Math.max(...projectionData.map(d => d.upperBound), ...targets) * 1.05;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div className="flex-1">
          <span className="text-xs font-mono font-bold tracking-widest text-cyan-400">
            30-DAY PRICE PROJECTION
          </span>
        </div>
        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono border ${
          trend.toLowerCase() === 'bullish' 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
            : trend.toLowerCase() === 'bearish'
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
        }`}>
          {trend.toUpperCase()}
        </span>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={projectionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={trendColor} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={trendColor} stopOpacity={0.05}/>
            </linearGradient>
            <linearGradient id="colorBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.02}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          
          <XAxis 
            dataKey="day" 
            stroke="rgba(255,255,255,0.3)"
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
            tickFormatter={(value) => `D${value}`}
          />
          
          <YAxis 
            stroke="rgba(255,255,255,0.3)"
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
            tickFormatter={(value) => `₹${value.toLocaleString()}`}
            domain={[minPrice, maxPrice]}
            width={75}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Legend 
            wrapperStyle={{ paddingTop: 10 }}
            formatter={(value) => (
              <span className="text-white/60 text-xs font-mono">
                {value}
              </span>
            )}
          />
          
          <ReferenceArea 
            y1={entryZone[0]} 
            y2={entryZone[1]} 
            fill="#10b981" 
            fillOpacity={0.1}
            stroke="#10b981"
            strokeDasharray="5 5"
          />
          
          <ReferenceLine 
            y={stopLoss} 
            stroke="#f43f5e" 
            strokeWidth={2}
            strokeDasharray="5 5"
            label={{ 
              value: 'STOP LOSS', 
              position: 'right',
              fill: '#f43f5e',
              fontSize: 10,
              fontFamily: 'monospace',
            }}
          />
          
          {targets.map((target, idx) => (
            <ReferenceLine 
              key={idx}
              y={target} 
              stroke="#06b6d4" 
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{ 
                value: `TARGET ${idx + 1}`, 
                position: 'right',
                fill: '#06b6d4',
                fontSize: 10,
                fontFamily: 'monospace',
              }}
            />
          ))}
          
          <Area 
            type="monotone" 
            dataKey="upperBound" 
            stroke="transparent"
            fill="url(#colorBand)"
            name="Upper Bound"
          />
          
          <Area 
            type="monotone" 
            dataKey="lowerBound" 
            stroke="transparent"
            fill="rgba(15, 23, 42, 0.9)"
            name="Confidence Band"
          />
          
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke={trendColor}
            strokeWidth={3}
            dot={false}
            name="Price Projection"
            activeDot={{ r: 6, fill: trendColor, stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-emerald-500" />
          <span className="text-xs text-white/50 font-mono">
            Entry: <span className="text-emerald-400">₹{entryZone[0].toLocaleString()} - ₹{entryZone[1].toLocaleString()}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-rose-500" />
          <span className="text-xs text-white/50 font-mono">
            Stop Loss: <span className="text-rose-400">₹{stopLoss.toLocaleString()}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-cyan-500" />
          <span className="text-xs text-white/50 font-mono">
            Targets: <span className="text-cyan-400">{targets.map(t => `₹${t.toLocaleString()}`).join(', ')}</span>
          </span>
        </div>
      </div>

      <div className="mt-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/5">
        <p className="text-xs text-white/40 font-mono leading-relaxed">
          <span className="text-white/60 font-semibold">Projection Logic:</span> This 30-day projection uses a trend-following model with {confidenceScore}% confidence. 
          The shaded area represents the confidence band - narrower bands indicate higher certainty. 
          {trend.toLowerCase() === 'bullish' ? ' Upward momentum is projected toward targets.' : 
           trend.toLowerCase() === 'bearish' ? ' Downward pressure expected.' : 
           ' Oscillating movement around current price expected.'}
        </p>
      </div>
    </motion.div>
  );
}

export type { ProjectionData };
