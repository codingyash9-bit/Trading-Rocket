'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnalysisLoaderProps {
  stock: string;
  onComplete: () => void;
}

const STEPS = [
  { label: 'Market Data',     sub: 'NSE / BSE real-time quotes',           icon: '◈' },
  { label: 'Technicals',      sub: 'Price patterns & indicators',           icon: '◉' },
  { label: 'Fundamentals',    sub: 'Financial metrics & balance sheet',     icon: '◎' },
  { label: 'AI Processing',   sub: 'Gemini 2.0 analysis engine',            icon: '⬡' },
  { label: 'Report Synthesis',sub: 'Institutional-grade output',            icon: '◈' },
];

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const AnalysisLoader: React.FC<AnalysisLoaderProps> = ({ stock, onComplete }) => {
  const [step, setStep] = useState(0);
  const [stepPct, setStepPct] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => {
      setStepPct((p) => {
        if (p >= 100) {
          setStep((s) => {
            if (s < STEPS.length - 1) return s + 1;
            setDone(true);
            setTimeout(onComplete, 1200);
            return s;
          });
          return 0;
        }
        return p + 25;
      });
    }, 350);
    return () => clearInterval(iv);
  }, [onComplete]);

  const total = ((step + stepPct / 100) / STEPS.length) * 100;
  const r     = 72;
  const circ  = 2 * Math.PI * r;
  const off   = circ - (circ * total) / 100;

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="flex flex-col items-center justify-center min-h-[60vh]"
      >
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 180, damping: 18 }}
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
          style={{
            background: 'rgba(16,185,129,0.10)',
            border: '1px solid rgba(16,185,129,0.25)',
            boxShadow: '0 0 32px rgba(16,185,129,0.15)',
          }}
        >
          <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-[20px] font-montserrat font-bold mb-1"
          style={{ color: 'rgba(255,255,255,0.90)' }}
        >
          Analysis Complete
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-[13.5px] font-mono"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          {stock} · Loading report…
        </motion.p>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="text-center mb-12"
      >
        <p className="text-[11px] font-mono tracking-widest mb-3"
           style={{ color: 'rgba(96,165,250,0.65)', letterSpacing: '0.12em' }}>
          PROCESSING — {stock}
        </p>
        <h2 className="text-[22px] font-montserrat font-bold"
            style={{ color: 'rgba(255,255,255,0.88)', letterSpacing: '-0.03em' }}>
          AI Analysis Engine
        </h2>
        <p className="text-[13px] mt-1.5" style={{ color: 'rgba(255,255,255,0.32)' }}>
          Generating institutional-grade insights
        </p>
      </motion.div>

      {/* Progress ring */}
      <div className="relative mb-12">
        <svg width="192" height="192" className="-rotate-90">
          {/* Track */}
          <circle
            cx="96" cy="96" r={r}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="6"
          />
          {/* Fill */}
          <defs>
            <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <motion.circle
            cx="96" cy="96" r={r}
            fill="none"
            stroke="url(#pg)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circ}
            animate={{ strokeDashoffset: off }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            style={{ filter: 'drop-shadow(0 0 6px rgba(59,130,246,0.50))' }}
          />
        </svg>

        {/* Percentage */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={Math.round(total)}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.18 }}
            className="text-[32px] font-mono font-bold tabular"
            style={{ color: 'rgba(255,255,255,0.92)', letterSpacing: '-0.04em' }}
          >
            {Math.round(total)}
          </motion.span>
          <span className="text-[11px] mt-0.5"
                style={{ color: 'rgba(255,255,255,0.28)', letterSpacing: '0.06em' }}>
            %
          </span>
        </div>
      </div>

      {/* Current step */}
      <div className="w-full max-w-xs mb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
            transition={{ duration: 0.22, ease: EASE }}
            className="text-center"
          >
            <p className="text-[15px] font-inter font-semibold mb-1"
               style={{ color: 'rgba(255,255,255,0.85)' }}>
              {STEPS[step].label}
            </p>
            <p className="text-[12.5px]" style={{ color: 'rgba(255,255,255,0.30)' }}>
              {STEPS[step].sub}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Step dots */}
      <div className="flex items-center gap-1.5">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.label}>
            <motion.div
              animate={{
                background: i < step
                  ? '#10b981'
                  : i === step
                  ? '#3b82f6'
                  : 'rgba(255,255,255,0.12)',
                scale: i === step ? 1.35 : 1,
              }}
              transition={{ duration: 0.28 }}
              style={{
                width: 7, height: 7, borderRadius: '50%',
                boxShadow: i === step ? '0 0 8px rgba(59,130,246,0.7)' : 'none',
              }}
            />
            {i < STEPS.length - 1 && (
              <div style={{
                width: 20, height: 1,
                background: i < step
                  ? 'rgba(16,185,129,0.60)'
                  : 'rgba(255,255,255,0.07)',
                borderRadius: 1,
                transition: 'background 0.3s',
              }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step progress bar */}
      <div className="mt-6 w-full max-w-xs" style={{ height: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
        <motion.div
          animate={{ width: `${stepPct}%` }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
            borderRadius: 2,
            boxShadow: '0 0 6px rgba(59,130,246,0.40)',
          }}
        />
      </div>
    </div>
  );
};

export default AnalysisLoader;