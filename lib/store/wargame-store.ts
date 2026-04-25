// lib/store/wargame-store.ts
import { create } from 'zustand';

export interface WargameScenario {
  id?: string;
  type: 'BULL' | 'BASE' | 'BEAR';
  probability: number;
  price_move_low: number;
  price_move_high: number;
  trigger: string;
  killer_condition: string;
  reasoning: string;
}

export interface WargameEvent {
  event_id: string;
  ticker: string;
  earnings_date: string;
  days_until: number;
  status: 'PENDING' | 'ACTIVE' | 'RESOLVED';
  company_name?: string;
  current_price?: number;
  sector?: string;
}

export interface WargamePosition {
  scenario_type: 'BULL' | 'BASE' | 'BEAR';
  position_type: 'LONG' | 'SHORT';
  entry_price?: number;
  is_locked: boolean;
}

export interface WargameOutcome {
  actual_price_move: number;
  actual_direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  trigger_hit?: string;
}

export interface WargameScore {
  direction_score: number;
  price_range_score: number;
  trigger_score: number;
  probability_score: number;
  total_score: number;
  verdict: 'SHARP' | 'SOLID' | 'PARTIAL' | 'WRONG';
}

export interface WargameReport {
  event_id: string;
  ticker: string;
  earnings_date: string;
  status: string;
  scenarios: WargameScenario[];
  position?: WargamePosition;
  outcome?: WargameOutcome;
  score?: WargameScore;
}

export interface TrackRecord {
  user_id: string;
  total_events: number;
  sharp_count: number;
  solid_count: number;
  partial_count: number;
  wrong_count: number;
  avg_score: number;
  win_rate: number;
}

interface WargameState {
  detectedEvents: WargameEvent[];
  selectedEvent: WargameEvent | null;
  scenarios: WargameScenario[];
  position: WargamePosition | null;
  outcome: WargameOutcome | null;
  score: WargameScore | null;
  trackRecord: TrackRecord | null;
  currentView: 'WAR_ROOM' | 'SELECTION' | 'REPORT';
  isLoading: boolean;
  error: string | null;

  detectOpportunities: () => Promise<void>;
  selectEvent: (event: WargameEvent) => void;
  generateScenarios: (eventId: string, ticker: string, earningsDate: string) => Promise<void>;
  sealPosition: (eventId: string, scenarioType: string, positionType: string, entryPrice?: number) => Promise<void>;
  resolveWargame: (eventId: string, actualPriceMove: number, actualDirection: string, triggerHit?: string) => Promise<void>;
  setView: (view: 'WAR_ROOM' | 'SELECTION' | 'REPORT') => void;
  clearError: () => void;
  reset: () => void;
}

export const useWargameStore = create<WargameState>((set, get) => ({
  detectedEvents: [],
  selectedEvent: null,
  scenarios: [],
  position: null,
  outcome: null,
  score: null,
  trackRecord: null,
  currentView: 'WAR_ROOM',
  isLoading: false,
  error: null,

  detectOpportunities: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/wargame/detect');
      const data = await response.json();
      
      if (data.success) {
        set({ detectedEvents: data.events || [], isLoading: false });
      } else {
        throw new Error(data.error || 'Detection failed');
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  selectEvent: (event) => {
    set({ selectedEvent: event, currentView: 'SELECTION', scenarios: [], position: null, outcome: null, score: null });
  },

  generateScenarios: async (eventId, ticker, earningsDate) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/wargame/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker, earnings_date: earningsDate })
      });
      
      const data = await response.json();
      
      if (data.success) {
        set({ scenarios: data.scenarios, isLoading: false });
      } else {
        throw new Error(data.error || 'Failed to generate scenarios');
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  sealPosition: async (eventId, scenarioType, positionType, entryPrice) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/wargame/seal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          scenario_type: scenarioType,
          position_type: positionType,
          entry_price: entryPrice
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        set({
          position: {
            scenario_type: scenarioType as 'BULL' | 'BASE' | 'BEAR',
            position_type: positionType as 'LONG' | 'SHORT',
            entry_price: entryPrice,
            is_locked: true
          },
          isLoading: false
        });
      } else {
        throw new Error(data.error || 'Failed to seal position');
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  resolveWargame: async (eventId, actualPriceMove, actualDirection, triggerHit) => {
    const { selectedEvent, scenarios, position } = get();
    
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/wargame/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          ticker: selectedEvent?.ticker,
          scenarios,
          position,
          actual_price_move: actualPriceMove,
          actual_direction: actualDirection,
          trigger_hit: triggerHit
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        set({
          outcome: data.outcome,
          score: data.score,
          currentView: 'REPORT',
          isLoading: false
        });
      } else {
        throw new Error(data.error || 'Failed to resolve wargame');
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  setView: (view) => set({ currentView: view }),
  clearError: () => set({ error: null }),
  reset: () => set({
    detectedEvents: [],
    selectedEvent: null,
    scenarios: [],
    position: null,
    outcome: null,
    score: null,
    currentView: 'WAR_ROOM'
  })
}));