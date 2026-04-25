'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AppTransitionProps {
  isActive: boolean;
  onComplete: () => void;
}

export default function AppTransition({ isActive, onComplete }: AppTransitionProps) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setPhase(0);
      return;
    }

    // Phase 1: INIT (0–1s) -> phase 1
    setPhase(1);

    // Phase 2: SYSTEM ACTIVATION (1–3s) -> phase 2
    const timer1 = setTimeout(() => setPhase(2), 1200);

    // Phase 3: POWER BUILD (3–4s) -> phase 3
    const timer2 = setTimeout(() => setPhase(3), 3200);

    // Phase 4: REVEAL (4–5s) -> complete
    const timer3 = setTimeout(() => {
      setPhase(4);
      setTimeout(onComplete, 800); // Wait for fade out
    }, 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isActive, onComplete]);

  if (!isActive && phase === 0) return null;

  return (
    <AnimatePresence>
      {isActive && phase < 4 && (
        <motion.div
          key="transition-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(10px)' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
        >
          {/* Base Dark Overlay */}
          <motion.div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          />

          {/* Grid Lines (Phase 2+) */}
          <AnimatePresence>
            {phase >= 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0"
              >
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
                {/* Scanning line */}
                <motion.div
                  className="absolute left-0 right-0 h-[10vh] bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent"
                  initial={{ top: '-10%' }}
                  animate={{ top: '110%' }}
                  transition={{ duration: 2.5, ease: 'linear', repeat: Infinity }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Central Progress & Content */}
          <div className="relative z-10 flex flex-col items-center max-w-md w-full px-6">
            <AnimatePresence mode="wait">
              {phase === 1 && (
                <motion.div
                  key="phase1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-cyan-500/30 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  </div>
                  <h2 className="text-xl font-mono text-cyan-400 mb-2">Initializing...</h2>
                  <p className="text-sm text-slate-400 font-mono">Trading Intelligence Core</p>
                </motion.div>
              )}

              {phase === 2 && (
                <motion.div
                  key="phase2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="w-full text-left"
                >
                  <motion.div className="space-y-4 font-mono text-sm">
                    <motion.p
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-cyan-400"
                    >
                      {'>'} Connecting to Market Signals... [OK]
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 }}
                      className="text-blue-400"
                    >
                      {'>'} Calibrating AI Models... [OK]
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.4 }}
                      className="text-purple-400"
                    >
                      {'>'} Establishing Secure Node... [OK]
                    </motion.p>
                  </motion.div>
                </motion.div>
              )}

              {phase === 3 && (
                <motion.div
                  key="phase3"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="text-center relative"
                >
                  <motion.div
                    className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0] }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />
                  <svg viewBox="0 0 32 32" fill="none" className="w-24 h-24 mx-auto mb-6 relative z-10">
                    <defs>
                      <linearGradient id="logo-t" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#60a5fa" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                    <motion.path
                      d="M16 3L6 9v14l10 6 10-6V9L16 3Z"
                      stroke="url(#logo-t)"
                      strokeWidth="1.5"
                      fill="none"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1, ease: "circInOut" }}
                    />
                    <motion.path
                      d="M16 8L11 11v10l5 3 5-3V11L16 8Z"
                      fill="url(#logo-t)"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.85 }}
                      transition={{ delay: 0.8, duration: 0.5 }}
                    />
                  </svg>
                  <motion.h2
                    className="text-2xl font-bold tracking-tight text-white mb-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    System Ready
                  </motion.h2>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
