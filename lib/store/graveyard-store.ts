// lib/store/graveyard-store.ts
import { create } from 'zustand';

export interface GraveyardPrediction {
  id: string;
  ticker: string;
  sector: string;
  pattern: string;
  timeframe: string;
  predicted_direction: 'BULLISH' | 'BEARISH';
  predicted_price: number;
  actual_price: number;
  confidence: number;
  verdict: 'INVALIDATED';
  invalidation_reason: string;
  epitaph?: string;
  source: 'SIGNAL' | 'WARGAME';
  created_at: string;
}

export interface GraveyardStats {
  total_graves: number;
  worst_sector: string | null;
  worst_pattern: string | null;
  avg_confidence_of_fails: number;
}

export interface PatternAnalysis {
  pattern: string;
  count: number;
  avg_confidence: number;
  sector_breakdown: Record<string, number>;
}

interface GraveyardState {
  graves: GraveyardPrediction[];
  stats: GraveyardStats | null;
  patterns: PatternAnalysis[];
  filters: {
    sector: string | null;
    pattern: string | null;
    timeframe: string | null;
    sort: 'date' | 'confidence' | 'ticker';
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  isLoading: boolean;
  isGeneratingEpitaph: boolean;
  error: string | null;

  fetchGraves: (resetPage?: boolean) => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchPatternAnalysis: () => Promise<void>;
  generateEpitaph: (predictionId: string) => Promise<string>;
  setFilter: (key: keyof GraveyardState['filters'], value: string | null) => void;
  setPage: (page: number) => void;
  clearError: () => void;
}

export const useGraveyardStore = create<GraveyardState>((set, get) => ({
  graves: [],
  stats: null,
  patterns: [],
  filters: {
    sector: null,
    pattern: null,
    timeframe: null,
    sort: 'date'
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0
  },
  isLoading: false,
  isGeneratingEpitaph: false,
  error: null,

  fetchGraves: async (resetPage = false) => {
    const { filters, pagination } = get();
    const page = resetPage ? 1 : pagination.page;

    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams({
        sort: filters.sort,
        page: page.toString(),
        limit: pagination.limit.toString()
      });

      if (filters.sector) params.append('sector', filters.sector);
      if (filters.pattern) params.append('pattern', filters.pattern);
      if (filters.timeframe) params.append('timeframe', filters.timeframe);

      const response = await fetch(`/api/graveyard/graves?${params}`);
      const data = await response.json();

      if (data.success) {
        set({
          graves: resetPage ? data.graves : [...get().graves, ...data.graves],
          pagination: { ...pagination, page, total: data.total },
          isLoading: false
        });
      } else {
        throw new Error(data.error || 'Failed to fetch graves');
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchStats: async () => {
    try {
      const response = await fetch('/api/graveyard/stats');
      const data = await response.json();

      if (data.success) {
        set({ stats: data });
      }
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  fetchPatternAnalysis: async () => {
    try {
      const response = await fetch('/api/graveyard/pattern-analysis');
      const data = await response.json();

      if (data.success) {
        set({ patterns: data.patterns || [] });
      }
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  generateEpitaph: async (predictionId: string) => {
    set({ isGeneratingEpitaph: true, error: null });
    try {
      const response = await fetch(`/api/graveyard/epitaph?prediction_id=${predictionId}`);
      const data = await response.json();

      set({
        graves: get().graves.map((g) =>
          g.id === predictionId ? { ...g, epitaph: data.epitaph } : g
        ),
        isGeneratingEpitaph: false
      });

      return data.epitaph;
    } catch (error) {
      set({ error: (error as Error).message, isGeneratingEpitaph: false });
      throw error;
    }
  },

  setFilter: (key, value) => {
    set({
      filters: { ...get().filters, [key]: value },
      pagination: { ...get().pagination, page: 1 }
    });
    get().fetchGraves(true);
  },

  setPage: (page) => {
    set({ pagination: { ...get().pagination, page } });
    get().fetchGraves();
  },

  clearError: () => set({ error: null })
}));