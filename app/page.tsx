'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import NeuralBackground from '../components/NeuralBackground';
import PageTransition from '../components/PageTransition';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  const handleLaunchApp = () => {
    setTimeout(() => router.push('/features'), 150);
  };

  const handleViewDemoClick = () => {
    setTimeout(() => router.push('/features'), 150);
  };

  return (
    <PageTransition>
      <NeuralBackground subtle />
      
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {/* Strong overlay to make text pop over neural background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#080c14]/80 via-[#080c14]/60 to-[#080c14]/80 pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-cyan-400 mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            AI-Powered Trading Intelligence
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight drop-shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
          >
            Trading <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500">Rocket</span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-slate-200 font-medium drop-shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          >
            Intelligence Beyond Charts
          </motion.p>
        </motion.div>

        <div className="glass-card px-8 py-6 rounded-2xl relative z-20">
          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={handleLaunchApp}
              className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]"
            >
              Launch App
            </button>

            <button
              onClick={handleViewDemoClick}
              className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/10 transition-all backdrop-blur-sm"
            >
              View Demo
            </button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 1 }}
          className="absolute bottom-8 left-0 right-0 text-center"
        >
          <p className="text-sm text-slate-500">
            Press <kbd className="px-2 py-1 rounded bg-white/10 text-slate-400 text-xs">Enter</kbd> to launch
          </p>
        </motion.div>
      </main>
    </PageTransition>
  );
}
