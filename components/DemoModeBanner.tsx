'use client';

import { motion } from 'framer-motion';
import { DEMO_CONFIG } from '@/lib/demo-mode';

export default function DemoModeBanner() {
  if (!DEMO_CONFIG.showBanner) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 text-white font-medium text-sm shadow-lg"
    >
      <span className="text-lg">🚀</span>
      <span>{DEMO_CONFIG.bannerMessage}</span>
      <span className="text-xs opacity-80">(Data simulated for demo)</span>
      <button
        onClick={() => window.location.reload()}
        className="ml-4 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-xs transition-colors"
      >
        Refresh
      </button>
    </motion.div>
  );
}