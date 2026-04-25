// app/graveyard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useGraveyardStore } from '@/lib/store/graveyard-store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import NeuralBackground from '@/components/NeuralBackground';
import { Skull, Search, RefreshCw, TrendingUp, TrendingDown, ExternalLink, Loader } from 'lucide-react';

const SECTOR_OPTIONS = ['Technology', 'Finance', 'Healthcare', 'Energy', 'Consumer', 'Industrial', 'Materials', 'Utilities', 'IT', 'Banking', 'Telecom', 'FMCG', 'NBFC', 'Automobile', 'Metals', 'Conglomerate', 'Pharmaceuticals', 'Infrastructure'];
const TIMEFRAME_OPTIONS = ['1D', '1W', '1M', '3M', '6M', '1Y'];
const SORT_OPTIONS = [
  { value: 'date', label: 'Date' },
  { value: 'confidence', label: 'Confidence' },
  { value: 'ticker', label: 'Ticker' }
];

export default function GraveyardPage() {
  const {
    graves,
    stats,
    patterns,
    filters,
    pagination,
    isLoading,
    isGeneratingEpitaph,
    error,
    fetchGraves,
    fetchStats,
    fetchPatternAnalysis,
    generateEpitaph,
    setFilter,
    setPage,
    clearError
  } = useGraveyardStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [patternFilter, setPatternFilter] = useState<string>('');
  const [initialLoad, setInitialLoad] = useState(false);

  useEffect(() => {
    if (!initialLoad) {
      fetchGraves(true);
      fetchStats();
      fetchPatternAnalysis();
      setInitialLoad(true);
    }
  }, []);

  const filteredGraves = graves.filter((grave) => {
    if (searchQuery && !grave.ticker.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (patternFilter && grave.pattern !== patternFilter) {
      return false;
    }
    return true;
  });

  const uniquePatterns = Array.from(new Set(graves.map((g) => g.pattern)));

  const handleGenerateEpitaph = async (predictionId: string) => {
    try {
      await generateEpitaph(predictionId);
    } catch (err) {
      console.error('Failed to generate epitaph:', err);
    }
  };

  const handleViewAutopsy = (predictionId: string) => {
    window.open(`/autopsy/${predictionId}`, '_blank');
  };

  const chartData = patterns.slice(0, 10).map((p) => ({
    pattern: p.pattern.length > 15 ? p.pattern.substring(0, 15) + '...' : p.pattern,
    count: p.count
  }));

  return (
    <div className="min-h-screen relative overflow-hidden">
      <NeuralBackground />
      <div className="relative z-10 min-h-screen bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950/80 p-6">
        <div className="max-w-7xl mx-auto space-y-8 overflow-y-auto max-h-[calc(100vh-48px)] pb-8 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <div className="flex items-center gap-4 flex-shrink-0">
            <button
              onClick={() => window.location.href = '/features'}
              className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition-all backdrop-blur-md"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 via-orange-500 to-yellow-500 bg-clip-text text-transparent flex items-center gap-3">
              <Skull className="w-8 h-8 text-red-500" />
              Signal Graveyard
            </h1>
            <p className="text-slate-400 hidden md:block">Where failed trading signals rest in peace</p>
          </div>

          <div className="flex justify-end flex-shrink-0">
            <button
              onClick={() => { fetchGraves(true); fetchStats(); fetchPatternAnalysis(); }}
              disabled={isLoading}
              className="p-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-all disabled:opacity-50 backdrop-blur-md"
            >
              <RefreshCw className={`w-5 h-5 text-slate-300 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 flex items-center justify-between backdrop-blur-md">
              <span>{error}</span>
              <button onClick={clearError} className="text-red-400 hover:text-red-300">Dismiss</button>
            </div>
          )}

          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-shrink-0">
              <StatCard
                label="Total Graves"
                value={stats.total_graves}
                icon={<Skull className="w-5 h-5" />}
              />
              <StatCard
                label="Worst Sector"
                value={stats.worst_sector || 'N/A'}
                subLabel="Most failed signals"
              />
              <StatCard
                label="Worst Pattern"
                value={stats.worst_pattern || 'N/A'}
                subLabel="Most invalidated"
              />
              <StatCard
                label="Avg Confidence"
                value={`${stats.avg_confidence_of_fails.toFixed(1)}%`}
                subLabel="Of failed signals"
              />
            </div>
          )}

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex-shrink-0">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by ticker..."
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 text-white rounded-xl focus:border-cyan-500/50 focus:outline-none backdrop-blur-md placeholder-slate-500"
                  />
                </div>
              </div>

              <select
                value={filters.sector || ''}
                onChange={(e) => setFilter('sector', e.target.value || null)}
                className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-xl focus:border-cyan-500/50 focus:outline-none backdrop-blur-md"
              >
                <option value="">All Sectors</option>
                {SECTOR_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <select
                value={filters.timeframe || ''}
                onChange={(e) => setFilter('timeframe', e.target.value || null)}
                className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-xl focus:border-cyan-500/50 focus:outline-none backdrop-blur-md"
              >
                <option value="">All Timeframes</option>
                {TIMEFRAME_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <select
                value={filters.sort}
                onChange={(e) => setFilter('sort', e.target.value as 'date' | 'confidence' | 'ticker')}
                className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-xl focus:border-cyan-500/50 focus:outline-none backdrop-blur-md"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>Sort: {o.label}</option>
                ))}
              </select>
            </div>

            {patternFilter && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-slate-400 text-sm">Pattern filter:</span>
                <span className="px-2 py-1 bg-red-500/20 border border-red-500/50 text-red-400 rounded text-sm">{patternFilter}</span>
                <button
                  onClick={() => setPatternFilter('')}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {filteredGraves.length === 0 && !isLoading ? (
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center flex-shrink-0">
              <Skull className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No graves found. Your trading signals are still alive!</p>
              <p className="text-slate-500 text-sm mt-2">Click refresh to load failed signals</p>
            </div>
          ) : (
            <div className="grid gap-4 overflow-y-auto max-h-[400px] pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {filteredGraves.map((grave) => {
                const isHighConfidence = grave.confidence >= 70;

                return (
                  <div
                    key={grave.id}
                    className={`p-5 rounded-2xl bg-white/5 border ${
                      isHighConfidence ? 'border-l-4 border-l-red-500 border-white/10' : 'border-white/10'
                    } backdrop-blur-md hover:border-red-500/30 transition-all`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-white">{grave.ticker}</h3>
                          <span className="px-2 py-0.5 bg-red-500/20 border border-red-500/50 text-red-400 rounded text-xs font-medium">
                            INVALIDATED
                          </span>
                          <span className="px-2 py-0.5 bg-slate-500/20 border border-slate-500/50 text-slate-300 rounded text-xs">
                            {grave.source}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
                          <span>{grave.sector}</span>
                          <button
                            onClick={() => setPatternFilter(grave.pattern)}
                            className="text-cyan-400 hover:text-cyan-300 hover:underline"
                          >
                            {grave.pattern}
                          </button>
                          <span>{grave.timeframe}</span>
                        </div>

                        {grave.epitaph ? (
                          <p className="text-slate-300 italic mb-3">&quot;{grave.epitaph}&quot;</p>
                        ) : (
                          <button
                            onClick={() => handleGenerateEpitaph(grave.id)}
                            disabled={isGeneratingEpitaph}
                            className="mb-3 px-3 py-1.5 bg-white/10 border border-white/20 hover:bg-white/20 text-slate-300 rounded text-sm disabled:opacity-50 backdrop-blur-md flex items-center gap-2"
                          >
                            {isGeneratingEpitaph ? (
                              <>
                                <Loader className="w-4 h-4 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              'Generate Epitaph'
                            )}
                          </button>
                        )}

                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="flex items-center gap-2">
                            {grave.predicted_direction === 'BULLISH' ? (
                              <TrendingUp className="w-4 h-4 text-green-400" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-400" />
                            )}
                            <span className="text-sm text-slate-400">
                              Predicted: {grave.predicted_direction} @ ₹{grave.predicted_price}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-400">
                              Actual: ₹{grave.actual_price}
                            </span>
                          </div>
                          <span className={`text-sm font-medium ${
                            grave.confidence >= 70 ? 'text-red-400' :
                            grave.confidence >= 50 ? 'text-yellow-400' : 'text-slate-400'
                          }`}>
                            {grave.confidence}% confidence
                          </span>
                        </div>

                        {grave.invalidation_reason && (
                          <p className="mt-2 text-sm text-red-400">
                            Killed by: {grave.invalidation_reason}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleViewAutopsy(grave.id)}
                        className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all"
                        title="View Full Autopsy"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {pagination.total > pagination.limit && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPage(pagination.page - 1)}
                disabled={pagination.page === 1 || isLoading}
                className="px-4 py-2 bg-white/10 border border-white/20 hover:bg-white/20 text-white rounded-xl disabled:opacity-50 backdrop-blur-md"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-slate-400">
                Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
              </span>
              <button
                onClick={() => setPage(pagination.page + 1)}
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit) || isLoading}
                className="px-4 py-2 bg-white/10 border border-white/20 hover:bg-white/20 text-white rounded-xl disabled:opacity-50 backdrop-blur-md"
              >
                Next
              </button>
            </div>
          )}

          {chartData.length > 0 && (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex-shrink-0">
              <h3 className="text-xl font-bold text-white mb-4">Pattern Killers</h3>
              <div className="h-80 overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 100 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis type="number" tick={{ fill: '#9CA3AF' }} />
                    <YAxis
                      dataKey="pattern"
                      type="category"
                      tick={{ fill: '#9CA3AF' }}
                      width={100}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15,23,42,0.9)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '12px'
                      }}
                    />
                    <Bar dataKey="count" fill="#EF4444" name="Invalidated Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  subLabel
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  subLabel?: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
      <div className="flex items-center gap-2 text-slate-400 mb-1">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {subLabel && <p className="text-xs text-slate-500 mt-1">{subLabel}</p>}
    </div>
  );
}