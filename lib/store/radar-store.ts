'use client';

import { create } from 'zustand';
import { TrackedCompany } from '../types';

interface CompanyRadarStore {
  trackedCompanies: TrackedCompany[];
  isLoading: boolean;
  
  addCompany: (company: TrackedCompany) => void;
  removeCompany: (ticker: string) => void;
  updateCompanyPrice: (ticker: string, price: number, changePercent: number) => void;
  addSignalToCompany: (ticker: string, signal: TrackedCompany['recentSignals'][0]) => void;
  setCompanies: (companies: TrackedCompany[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useCompanyRadarStore = create<CompanyRadarStore>((set) => ({
  trackedCompanies: [],
  isLoading: false,
  
  addCompany: (company) => set((state) => ({
    trackedCompanies: state.trackedCompanies.some((c) => c.ticker === company.ticker)
      ? state.trackedCompanies
      : [...state.trackedCompanies, company],
  })),
  
  removeCompany: (ticker) => set((state) => ({
    trackedCompanies: state.trackedCompanies.filter((c) => c.ticker !== ticker),
  })),
  
  updateCompanyPrice: (ticker, price, changePercent) => set((state) => ({
    trackedCompanies: state.trackedCompanies.map((c) =>
      c.ticker === ticker
        ? { ...c, lastPrice: price, changePercent, lastUpdated: new Date().toISOString() }
        : c
    ),
  })),
  
  addSignalToCompany: (ticker, signal) => set((state) => ({
    trackedCompanies: state.trackedCompanies.map((c) =>
      c.ticker === ticker
        ? {
            ...c,
            recentSignals: [signal, ...c.recentSignals.slice(0, 9)],
          }
        : c
    ),
  })),
  
  setCompanies: (companies) => set({ trackedCompanies: companies }),
  
  setLoading: (loading) => set({ isLoading: loading }),
}));
