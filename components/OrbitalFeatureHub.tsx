'use client';

import React from 'react';
import NeuralBackground from './NeuralBackground';

import { useRouter } from 'next/navigation';

interface Feature {
  id: number;
  name: string;
  icon: string;
  description: string;
  path: string;
}

const features: Feature[] = [
  { id: 1, name: 'Stock Intelligence', icon: '📊', description: 'Deep-dive AI equity analysis & insights', path: '/analytics' },
  { id: 2, name: 'Market Pulse', icon: '📈', description: 'Real-time monitoring & price action', path: '/markets' },
  { id: 3, name: 'Market Intelligence', icon: '⚡', description: 'AI-curated news & automated signals', path: '/signals' },
  { id: 4, name: 'Company Radar', icon: '🎯', description: 'Smart watchlist & portfolio tracker', path: '/portfolio' },
  { id: 5, name: 'Rocket AI', icon: '🤖', description: 'Interactive financial assistant', path: '/ai' },
  { id: 6, name: 'Paper Portfolio', icon: '📄', description: 'Track hypothetical positions', path: '/portfolio' },
  { id: 7, name: 'Chart Analysis', icon: '👁️', description: 'Aether visual prediction engine', path: '/chart-analysis' },
  { id: 8, name: 'Prediction Forensics', icon: '🔍', description: 'Post-mortem trade analysis', path: '/autopsy' },
  { id: 9, name: 'Earnings Wargame', icon: '⚔️', description: 'Strategic pre-earnings scenarios', path: '/wargame' },
  { id: 10, name: 'Signal Graveyard', icon: '🪦', description: 'Archive of invalidated signals', path: '/graveyard' },
];

const OrbitalFeatureHub: React.FC = () => {
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className="relative w-full h-screen bg-[#080c14] overflow-hidden flex items-center justify-center font-sans">
      {/* Exact Neural Background from Landing Page */}
      <NeuralBackground subtle />

      {/* Foreground Overlay Gradient to match landing page depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#080c14]/80 via-[#080c14]/40 to-[#080c14]/80 z-1 pointer-events-none" />
      
      {/* UI Content Layer */}
      <div className="relative z-10 w-full h-full flex items-center justify-center overflow-visible">
        
        {/* Orbital nodes positioned with CSS math */}
        <div className="relative w-[1px] h-[1px]">
          {features.map((feature, index) => {
            const angle = index * 36;
            return (
              <div
                key={feature.id}
                onClick={() => handleNavigation(feature.path)}
                className="absolute group cursor-pointer transition-all duration-500 hover:scale-125 z-20"
                style={{
                  top: '0',
                  left: '0',
                  '--angle': `${angle}deg`,
                  transform: `translate(-50%, -50%) rotate(var(--angle)) translateY(-280px) rotate(calc(-1 * var(--angle)))`,
                } as React.CSSProperties}
              >
                <div className="relative w-32 h-32 bg-surface-1/40 backdrop-blur-md border border-accent-cyan/20 rounded-full flex flex-col items-center justify-center text-center p-2 group-hover:border-accent-cyan/80 group-hover:bg-surface-2/60 transition-all shadow-lg group-hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{feature.icon}</span>
                  <h3 className="text-accent-cyan font-bold text-[9px] leading-tight tracking-[0.1em] uppercase max-w-[80px] mt-1">{feature.name}</h3>
                </div>
              </div>
            );
          })}
        </div>

        {/* Central Core - Perfectly Centered */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] rounded-full flex items-center justify-center pointer-events-none overflow-hidden">
          {/* Glowing Effects */}
          <div className="absolute inset-0 rounded-full bg-accent-cyan/10 blur-[60px] animate-pulse" />
          <div className="absolute inset-[-10px] rounded-full border border-accent-cyan/10 shadow-[0_0_40px_rgba(6,182,212,0.1)]" />
          
          {/* Backdrop Blur for Legibility */}
          <div className="absolute inset-4 rounded-full bg-black/20 backdrop-blur-md border border-white/5 shadow-inner" />
          
          <div className="relative z-20 flex flex-col items-center justify-center p-6 text-center">
            <div className="text-4xl font-black text-white tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">
              TRADING
            </div>
            <div className="text-xl font-bold text-accent-cyan tracking-[0.3em] -mt-1 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
              ROCKET
            </div>
          </div>
        </div>

        {/* Decorative Inner Ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[580px] rounded-full border border-white/5 pointer-events-none -z-1" />
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default OrbitalFeatureHub;
