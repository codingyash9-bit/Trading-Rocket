// app/wargame/page.tsx
'use client';

import { useState } from 'react';
import { useWargameStore } from '@/lib/store/wargame-store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from 'recharts';
import NeuralBackground from '@/components/NeuralBackground';
import { Shield, TrendingUp, TrendingDown, Minus, Target, Lock, CheckCircle } from 'lucide-react';

const SCENARIO_COLORS = {
  BULL: { gradient: 'from-green-400/20 via-green-500/10 to-transparent', border: 'border-green-500/50', text: 'text-green-400', icon: TrendingUp },
  BASE: { gradient: 'from-yellow-400/20 via-yellow-500/10 to-transparent', border: 'border-yellow-500/50', text: 'text-yellow-400', icon: Minus },
  BEAR: { gradient: 'from-red-400/20 via-red-500/10 to-transparent', border: 'border-red-500/50', text: 'text-red-400', icon: TrendingDown }
};

const VERDICT_CONFIG = {
  SHARP: { gradient: 'from-emerald-400/30 via-emerald-500/15 to-transparent', border: 'border-emerald-500/50', text: 'text-emerald-400', label: 'SHARP' },
  SOLID: { gradient: 'from-blue-400/30 via-blue-500/15 to-transparent', border: 'border-blue-500/50', text: 'text-blue-400', label: 'SOLID' },
  PARTIAL: { gradient: 'from-yellow-400/30 via-yellow-500/15 to-transparent', border: 'border-yellow-500/50', text: 'text-yellow-400', label: 'PARTIAL' },
  WRONG: { gradient: 'from-red-400/30 via-red-500/15 to-transparent', border: 'border-red-500/50', text: 'text-red-400', label: 'WRONG' }
};

export default function WargamePage() {
  const {
    detectedEvents,
    selectedEvent,
    scenarios,
    position,
    outcome,
    score,
    currentView,
    isLoading,
    error,
    detectOpportunities,
    selectEvent,
    generateScenarios,
    sealPosition,
    resolveWargame,
    setView,
    clearError
  } = useWargameStore();

  const [selectedScenario, setSelectedScenario] = useState<'BULL' | 'BASE' | 'BEAR' | null>(null);
  const [positionType, setPositionType] = useState<'LONG' | 'SHORT'>('LONG');
  const [entryPrice, setEntryPrice] = useState<string>('');
  const [resolveData, setResolveData] = useState({ actualMove: '', actualDirection: 'BULLISH', triggerHit: '' });

  const handleEnterWarRoom = (event: typeof detectedEvents[0]) => {
    selectEvent(event);
  };

  const handleGenerateScenarios = async () => {
    if (!selectedEvent) return;
    await generateScenarios(selectedEvent.event_id, selectedEvent.ticker, selectedEvent.earnings_date);
  };

  const handleSealPosition = async () => {
    if (!selectedEvent || !selectedScenario) return;
    await sealPosition(selectedEvent.event_id, selectedScenario, positionType, entryPrice ? parseFloat(entryPrice) : undefined);
  };

  const handleResolve = async () => {
    if (!selectedEvent || !resolveData.actualMove) return;
    await resolveWargame(selectedEvent.event_id, parseFloat(resolveData.actualMove), resolveData.actualDirection as 'BULLISH' | 'BEARISH' | 'NEUTRAL', resolveData.triggerHit || undefined);
  };

  const handleViewFullAutopsy = (eventId: string) => {
    window.open(`/autopsy/${eventId}`, '_blank');
  };

  const goBack = () => {
    if (currentView === 'REPORT') setView('SELECTION');
    else setView('WAR_ROOM');
  };

  if (currentView === 'SELECTION') {
    const hasScenarios = scenarios.length > 0;
    const isLocked = position?.is_locked;

    return (
      <div className="min-h-screen relative overflow-hidden">
        <NeuralBackground />
        <div className="relative z-10 min-h-screen bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950/80 p-6">
          <div className="max-w-7xl mx-auto overflow-y-auto max-h-screen pb-8 space-y-8">
            <div className="flex items-center gap-4">
              <button onClick={goBack} className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-md">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back
              </button>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                {selectedEvent?.ticker} - Select Your Destiny
              </h1>
            </div>

            {!hasScenarios ? (
              <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
                <Target className="w-16 h-16 text-cyan-500/50 mx-auto mb-4" />
                <p className="text-slate-400 mb-6">Generate AI-powered scenarios to analyze earnings outcomes</p>
                <button onClick={handleGenerateScenarios} disabled={isLoading} className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/50 text-cyan-400 hover:from-cyan-500/30 hover:to-purple-500/30 transition-all disabled:opacity-50 backdrop-blur-md">
                  {isLoading ? 'Analyzing...' : 'Generate AI Scenarios'}
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid md:grid-cols-3 gap-6 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                  {scenarios.map((scenario) => {
                    const colors = SCENARIO_COLORS[scenario.type];
                    const Icon = colors.icon;
                    const isSelected = selectedScenario === scenario.type;
                    return (
                      <div key={scenario.type} onClick={() => !isLocked && setSelectedScenario(scenario.type)} className={`rounded-2xl p-6 bg-gradient-to-br ${colors.gradient} border ${colors.border} transition-all backdrop-blur-md ${isSelected ? 'ring-2 ring-white/50' : ''} ${isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] cursor-pointer'}`}>
                        <div className="flex items-center justify-between mb-4">
                          <Icon className={`w-8 h-8 ${colors.text}`} />
                          <span className={`${colors.text} text-2xl font-bold`}>{scenario.type}</span>
                        </div>
                        <div className="space-y-3">
                          <div><p className="text-slate-400 text-sm">Probability</p><p className="text-3xl font-bold text-white">{scenario.probability}%</p></div>
                          <div><p className="text-slate-400 text-sm">Price Move Range</p><p className="text-xl font-bold text-white">{scenario.price_move_low}% to {scenario.price_move_high}%</p></div>
                          <div><p className="text-slate-400 text-sm">Trigger</p><p className="text-white">{scenario.trigger}</p></div>
                          <div><p className="text-slate-400 text-sm">Killer Condition</p><p className="text-red-400">{scenario.killer_condition}</p></div>
                          <div><p className="text-slate-400 text-sm">Reasoning</p><p className="text-slate-300 italic">{scenario.reasoning}</p></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {!isLocked && selectedScenario && (
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                    <h3 className="text-xl font-bold text-white mb-4">Seal Your Position</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-slate-400 text-sm block mb-2">Position Type</label>
                        <div className="flex gap-2">
                          <button onClick={() => setPositionType('LONG')} className={`flex-1 py-2 rounded-xl font-medium backdrop-blur-md ${positionType === 'LONG' ? 'bg-green-500/30 border border-green-500/50 text-green-400' : 'bg-white/10 border border-white/20 text-slate-300'}`}>LONG</button>
                          <button onClick={() => setPositionType('SHORT')} className={`flex-1 py-2 rounded-xl font-medium backdrop-blur-md ${positionType === 'SHORT' ? 'bg-red-500/30 border border-red-500/50 text-red-400' : 'bg-white/10 border border-white/20 text-slate-300'}`}>SHORT</button>
                        </div>
                      </div>
                      <div>
                        <label className="text-slate-400 text-sm block mb-2">Entry Price</label>
                        <input type="number" value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} placeholder={selectedEvent?.current_price?.toString() || '0.00'} className="w-full px-4 py-2 bg-white/10 border border-white/20 text-white rounded-xl focus:border-cyan-500/50 focus:outline-none backdrop-blur-md placeholder-slate-500" />
                      </div>
                      <div className="flex items-end">
                        <button onClick={handleSealPosition} disabled={isLoading} className="w-full py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/50 text-cyan-400 rounded-xl hover:from-cyan-500/30 hover:to-purple-500/30 transition-all disabled:opacity-50 backdrop-blur-md flex items-center justify-center gap-2">
                          <Lock className="w-5 h-5" />Seal My Position
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {isLocked && (
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                    <div className="flex items-center gap-3 text-green-400 mb-4">
                      <Lock className="w-6 h-6" />
                      <span className="text-lg font-medium">Position Locked: {position?.scenario_type} {position?.position_type}</span>
                    </div>
                    <label className="text-slate-400 text-sm block mb-2">Enter Actual Outcome After Earnings</label>
                    <div className="grid md:grid-cols-4 gap-4">
                      <input type="number" value={resolveData.actualMove} onChange={(e) => setResolveData({ ...resolveData, actualMove: e.target.value })} placeholder="Actual % move" className="w-full px-4 py-2 bg-white/10 border border-white/20 text-white rounded-xl focus:border-cyan-500/50 focus:outline-none backdrop-blur-md placeholder-slate-500" />
                      <select value={resolveData.actualDirection} onChange={(e) => setResolveData({ ...resolveData, actualDirection: e.target.value })} className="w-full px-4 py-2 bg-white/10 border border-white/20 text-white rounded-xl focus:border-cyan-500/50 focus:outline-none backdrop-blur-md">
                        <option value="BULLISH">BULLISH</option><option value="BEARISH">BEARISH</option><option value="NEUTRAL">NEUTRAL</option>
                      </select>
                      <input type="text" value={resolveData.triggerHit} onChange={(e) => setResolveData({ ...resolveData, triggerHit: e.target.value })} placeholder="Trigger that hit (optional)" className="w-full px-4 py-2 bg-white/10 border border-white/20 text-white rounded-xl focus:border-cyan-500/50 focus:outline-none backdrop-blur-md placeholder-slate-500" />
                      <button onClick={handleResolve} disabled={isLoading || !resolveData.actualMove} className="py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 text-green-400 rounded-xl hover:from-green-500/30 hover:to-emerald-500/30 transition-all disabled:opacity-50 backdrop-blur-md">Resolve Wargame</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'REPORT' && score) {
    const verdictConfig = VERDICT_CONFIG[score.verdict] || VERDICT_CONFIG.PARTIAL;
    const chartData = scenarios.map((s) => ({ name: s.type, low: s.price_move_low, high: s.price_move_high, actual: s.type === position?.scenario_type ? outcome?.actual_price_move : null }));

    return (
      <div className="min-h-screen relative overflow-hidden">
        <NeuralBackground />
        <div className="relative z-10 min-h-screen bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950/80 p-6">
          <div className="max-w-7xl mx-auto overflow-y-auto max-h-screen pb-8 space-y-8">
            <div className="flex items-center gap-4">
              <button onClick={goBack} className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-md">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back
              </button>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">Wargame Report: {selectedEvent?.ticker}</h1>
            </div>

            <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-br ${verdictConfig.gradient} border ${verdictConfig.border} backdrop-blur-md`}>
              <CheckCircle className={`w-8 h-8 ${verdictConfig.text}`} />
              <span className={`text-2xl font-bold ${verdictConfig.text}`}>{verdictConfig.label}</span>
              <span className="text-xl text-slate-300">({score.total_score}/100)</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ScoreCard label="Direction" score={score.direction_score} max={40} />
              <ScoreCard label="Price Range" score={score.price_range_score} max={30} />
              <ScoreCard label="Trigger" score={score.trigger_score} max={20} />
              <ScoreCard label="Probability" score={score.probability_score} max={10} />
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <h3 className="text-xl font-bold text-white mb-4">Your Prediction vs Reality</h3>
              <div className="flex items-center gap-4">
                <div><p className="text-slate-400 text-sm">You Picked</p><p className="text-2xl font-bold text-white">{position?.scenario_type} {position?.position_type}</p></div>
                <div className="h-12 w-px bg-slate-600" />
                <div><p className="text-slate-400 text-sm">Actual Outcome</p><p className="text-2xl font-bold text-white">{outcome?.actual_direction} ({outcome?.actual_price_move}%)</p></div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <h3 className="text-xl font-bold text-white mb-4">Price Range Analysis</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis type="number" domain={[-20, 20]} tick={{ fill: '#9CA3AF' }} />
                    <YAxis dataKey="name" type="category" tick={{ fill: '#9CA3AF' }} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px' }} />
                    <Legend />
                    <ReferenceLine x={0} stroke="#6B7280" />
                    <Bar dataKey="low" fill="#6B7280" name="Low" />
                    <Bar dataKey="high" fill="#9CA3AF" name="High" />
                    {chartData.filter(d => d.actual !== null).map((d, i) => <Bar key={i} dataKey="actual" fill="#EF4444" name="Actual" />)}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <button onClick={() => handleViewFullAutopsy(selectedEvent?.event_id || '')} className="w-full py-3 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all backdrop-blur-md">View Full Autopsy</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <NeuralBackground />
      <div className="relative z-10 min-h-screen bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950/80 p-6">
        <div className="max-w-7xl mx-auto overflow-y-auto max-h-screen pb-8 space-y-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.location.href = '/features'}
              className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition-all backdrop-blur-md"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">Earnings War Room</h1>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-slate-400">Pre-earnings scenario analysis for Indian stocks</p>
            <button onClick={detectOpportunities} disabled={isLoading} className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/50 text-cyan-400 hover:from-cyan-500/30 hover:to-purple-500/30 transition-all disabled:opacity-50 backdrop-blur-md flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {isLoading ? 'Scanning...' : 'Detect Earnings (Next 30 Days)'}
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 flex items-center justify-between backdrop-blur-md">
              <span>{error}</span>
              <button onClick={clearError} className="text-red-400 hover:text-red-300">Dismiss</button>
            </div>
          )}

          <div className="max-h-[calc(100vh-280px)] overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {detectedEvents.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
                <Shield className="w-16 h-16 text-cyan-500/50 mx-auto mb-4" />
                <p className="text-slate-400">Click &quot;Detect Earnings&quot; to find stocks with upcoming earnings announcements.</p>
                <p className="text-slate-500 text-sm mt-2">Scans NSE stocks for earnings within 30 days</p>
              </div>
            ) : (
              <div className="space-y-4">
                {detectedEvents.map((event) => (
                  <div key={event.event_id} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/50 transition-all backdrop-blur-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-2xl font-bold text-white">{event.ticker}</h3>
                          <span className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/50 text-purple-400 rounded text-xs">{event.sector || 'N/A'}</span>
                        </div>
                        <p className="text-slate-400 mt-1">Earnings: {new Date(event.earnings_date).toLocaleDateString()} ({event.days_until} days)</p>
                        {event.current_price && <p className="text-cyan-400 mt-1">Current: ₹{event.current_price}</p>}
                      </div>
                      <button onClick={() => handleEnterWarRoom(event)} className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/50 text-cyan-400 hover:from-cyan-500/30 hover:to-purple-500/30 transition-all">Enter War Room</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreCard({ label, score, max }: { label: string; score: number; max: number }) {
  const percentage = (score / max) * 100;
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
      <div className="flex justify-between mb-2">
        <span className="text-slate-400 text-sm">{label}</span>
        <span className="text-white font-medium">{score}/{max}</span>
      </div>
      <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}