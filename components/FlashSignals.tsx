'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_SIGNALS = [
  { id: 1, type: 'bullish', ticker: 'RELIANCE', message: 'Bullish Engulfing pattern detected on 15m chart' },
  { id: 2, type: 'bearish', ticker: 'TCS', message: 'Heavy volume selling at resistance ₹4,120' },
  { id: 3, type: 'bullish', ticker: 'HDFC BANK', message: 'RSI divergence forming near support zone' },
  { id: 4, type: 'neutral', ticker: 'NIFTY', message: 'Index entering low volatility squeeze zone' },
];

export default function FlashSignals() {
  const [activeSignal, setActiveSignal] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(true);

  const speak = useCallback((text: string) => {
    if (isMuted || typeof window === 'undefined') return;
    
    // Cancel previous speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 1.2;
    // Find a cool robotic/female voice if possible
    const voices = window.speechSynthesis.getVoices();
    const synthVoice = voices.find(v => v.name.includes('Google UK English Female')) || voices[0];
    if (synthVoice) utterance.voice = synthVoice;
    
    window.speechSynthesis.speak(utterance);
  }, [isMuted]);

  useEffect(() => {
    const triggerRandomSignal = () => {
      const signal = MOCK_SIGNALS[Math.floor(Math.random() * MOCK_SIGNALS.length)];
      setActiveSignal(signal);
      speak(`${signal.ticker}. ${signal.message}`);
      
      // Auto-clear after 8 seconds
      setTimeout(() => setActiveSignal(null), 8000);
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.7) triggerRandomSignal();
    }, 15000);

    return () => clearInterval(interval);
  }, [speak]);

    return (
    <div className="fixed top-10 right-10 z-[100] flex flex-col items-end gap-4 pointer-events-none">
      <AnimatePresence>
        {activeSignal && (
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className="pointer-events-auto"
          >
            <div className={`
              glass-panel p-4 rounded-2xl border min-w-[300px] shadow-2xl
              ${activeSignal.type === 'bullish' ? 'border-emerald-500/30' : 
                activeSignal.type === 'bearish' ? 'border-rose-500/30' : 'border-white/10'}
            `}>
              <div className="flex items-center justify-between mb-2">
                <span className={`
                  text-[10px] font-mono font-bold px-2 py-0.5 rounded-full
                  ${activeSignal.type === 'bullish' ? 'bg-emerald-500/10 text-emerald-400' : 
                    activeSignal.type === 'bearish' ? 'bg-rose-500/10 text-rose-400' : 'bg-white/10 text-white/40'}
                `}>
                  {activeSignal.type.toUpperCase()} SIGNAL
                </span>
                <span className="text-[10px] text-white/20 font-mono">JUST NOW</span>
              </div>
              
              <h4 className="text-lg font-bold text-white mb-1">{activeSignal.ticker}</h4>
              <p className="text-sm text-white/60 leading-tight">{activeSignal.message}</p>
              
              <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 8, ease: 'linear' }}
                  className={`h-full ${activeSignal.type === 'bullish' ? 'bg-emerald-500' : 'bg-rose-500'}`}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
