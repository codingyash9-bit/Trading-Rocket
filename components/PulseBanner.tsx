'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const mockIndices = [
  { name: 'NIFTY 50', value: 22541.30, change: 0.43 },
  { name: 'SENSEX', value: 74119.20, change: -0.21 },
  { name: 'BANKNIFTY', value: 48120.45, change: 0.65 },
  { name: 'NIFTY IT', value: 34500.80, change: -0.80 },
  { name: 'USD/INR', value: 83.25, change: 0.05 },
];

export default function PulseBanner() {
  const [pulseIndices, setPulseIndices] = useState(mockIndices);
  const [pulsing, setPulsing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseIndices((prev) => 
        prev.map(idx => ({
          ...idx,
          // Random slight fluctuation for the demo
          value: idx.value + (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 5),
        }))
      );
      setPulsing(true);
      setTimeout(() => setPulsing(false), 1500);
    }, 4000); // Poll every 4s for effect
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-8 z-50 overflow-hidden flex items-center"
      style={{
        background: 'rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <motion.div
        className="flex space-x-12 px-6 whitespace-nowrap min-w-full"
        animate={{ x: [0, -100] }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
      >
        {[...pulseIndices, ...pulseIndices].map((idx, i) => {
          const isUp = idx.change >= 0;
          return (
            <div key={i} className="flex items-center space-x-3 text-[11px] font-mono tracking-wide">
              <span className="text-slate-300">{idx.name}</span>
              <motion.span 
                animate={{ color: pulsing ? (isUp ? '#4ade80' : '#f87171') : '#f8fafc' }}
                className="font-medium"
              >
                {idx.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </motion.span>
              <span className={isUp ? 'text-green-400' : 'text-red-400'}>
                {isUp ? '▲' : '▼'} {Math.abs(idx.change).toFixed(2)}%
              </span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
