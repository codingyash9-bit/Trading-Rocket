'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStockIntelligenceStore } from '../../store';
import { Button, Card } from '@/components/ui';
import { formatINR, formatPercent, getRecommendationColor, getRecommendationBgColor } from '../../utils';
import { api } from '@/lib/api-client';

// AetherAlphaEngine Suggestion Interface
interface AlphaSuggestion {
  from: string;
  to: string;
  reason: string;
}

const AlphaEngineCard: React.FC<{ suggestions: AlphaSuggestion[] }> = ({ suggestions }) => (
  <Card variant="gradient" className="mt-6 border-emerald-500/20">
    <div className="flex items-center gap-3 mb-4">
      <span className="text-2xl">✨</span>
      <div>
        <h3 className="text-white font-bold font-montserrat">Aether Alpha Engine</h3>
        <p className="text-xs text-emerald-400 font-mono tracking-widest uppercase">Portfolio Optimization Strategy</p>
      </div>
    </div>
    <div className="space-y-3">
      {suggestions.map((s, i) => (
        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
          <div>
            <p className="text-xs text-slate-400">Swap <span className="text-rose-400 font-bold">{s.from}</span> to <span className="text-emerald-400 font-bold">{s.to}</span></p>
            <p className="text-xs text-white/60 mt-1">{s.reason}</p>
          </div>
          <Button variant="outline" size="sm">Execute</Button>
        </div>
      ))}
    </div>
  </Card>
);

const StockIntelligence: React.FC = () => {
  const { currentTicker, setCurrentStock, setPowerVerdict, isGeneratingVerdict, setGeneratingVerdict } = useStockIntelligenceStore();
  const [activeStock, setActiveStock] = useState<string | null>(null);
  const [alphaInsights, setAlphaInsights] = useState<any>(null);

  const handleStockSelect = useCallback((ticker: string) => {
    setActiveStock(ticker);
    setCurrentStock(ticker, 'NSE');
  }, [setCurrentStock]);

  const runAlphaEngine = async () => {
    if (!activeStock) return;
    setGeneratingVerdict(true);
    
    try {
      // Mock portfolio for the hackathon demo
      const mockPortfolio = [{ ticker: activeStock, shares: 10 }];
      const res = await api.post('/api/simulate/alpha', { portfolio: mockPortfolio });
      
      if (res.success) {
        setAlphaInsights(res.data);
      }
    } catch (e) {
      console.error(e);
    }
    setGeneratingVerdict(false);
  };

  return (
    <div className="space-y-6">
      {/* ... existing header and stock search ... */}
      
      {activeStock && (
        <Card variant="glass" className="mt-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">{activeStock}</h2>
              <p className="text-sm text-slate-400">Intelligence & Alpha Sync</p>
            </div>
            <Button 
              onClick={runAlphaEngine} 
              isLoading={isGeneratingVerdict}
              variant="primary"
            >
              Run Alpha Engine
            </Button>
          </div>

          {alphaInsights && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <AlphaEngineCard suggestions={alphaInsights.suggestions} />
            </motion.div>
          )}
        </Card>
      )}
    </div>
  );
};

export default StockIntelligence;
